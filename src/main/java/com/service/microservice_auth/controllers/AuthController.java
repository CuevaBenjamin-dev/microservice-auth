package com.service.microservice_auth.controllers;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.service.microservice_auth.dtos.ApiResponse;
import com.service.microservice_auth.dtos.AuthTokensResponse;
import com.service.microservice_auth.dtos.LoginRequest;
import com.service.microservice_auth.security.JwtService;
import com.service.microservice_auth.services.RefreshTokenService;
import com.service.microservice_auth.services.UsuarioService;

import jakarta.validation.Valid;

/**
 * Controlador de autenticación.
 * 
 * NIVEL 2:
 * - Usa DTOs explícitos
 * - Usa ApiResponse como formato estándar
 * - NO aplica hashing ni tokens todavía
 */
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/auth")
public class AuthController {

        private final JwtService jwtService;
        private final UsuarioService usuarioService;
        private final RefreshTokenService refreshTokenService;

        public AuthController(
                        JwtService jwtService,
                        UsuarioService usuarioService,
                        RefreshTokenService refreshTokenService) {
                this.jwtService = jwtService;
                this.usuarioService = usuarioService;
                this.refreshTokenService = refreshTokenService;
        }

        /**
         * LOGIN - NIVEL 7
         * 
         * - AccessToken → se devuelve en el body
         * - RefreshToken → se guarda en COOKIE HttpOnly (NO accesible desde JS)
         */
        @PostMapping("/login")
        public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody LoginRequest request) {

                boolean success = usuarioService.login(
                                request.getUsuario(),
                                request.getPassword());

                if (!success) {
                        return ResponseEntity.status(401)
                                        .body(ApiResponse.error("Usuario o contraseña incorrectos", null));
                }

                // 🔐 Generación de tokens
                String role = usuarioService.getRoleByUsername(request.getUsuario()).name();
                String accessToken = jwtService.generateAccessToken(request.getUsuario(), role);
                String refreshToken = jwtService.generateRefreshToken(request.getUsuario());

                // 💾 Guardar refresh token hasheado
                refreshTokenService.save(request.getUsuario(), refreshToken);

                // 🍪 COOKIE HttpOnly para refresh token
                // JavaScript NO puede leerla (protección XSS)
                ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                                .httpOnly(true) // 🔒 NO accesible desde JS
                                .secure(false) // ⚠️ true en PRODUCCIÓN (HTTPS)
                                .path("/auth/refresh") // esto significa que la cookie se enviará en TODAS las rutas, no
                                                       // solo /auth/refresh, para que funcione en cross-site
                                .maxAge(7 * 24 * 60 * 60) // 7 días
                                .sameSite("Lax") // Protege contra CSRF pero permite navegación normal, y será None con
                                                 // secure(true) en producción, para que funcione en cross-site
                                .build();

                // ❗ IMPORTANTE:
                // Ya NO enviamos refreshToken en el body
                AuthTokensResponse response = new AuthTokensResponse(accessToken, null);

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                                .body(ApiResponse.ok("Login exitoso", response));
        }

        /**
         * REFRESH TOKEN - NIVEL 7
         * 
         * - El refresh token se lee SOLO desde cookie HttpOnly
         * - El frontend NO envía nada
         * - Se rota el refresh token
         */
        @PostMapping("/refresh")
        public ResponseEntity<ApiResponse<?>> refresh(
                        @CookieValue(name = "refreshToken", required = false) String refreshToken) {

                // ❌ No hay cookie
                if (refreshToken == null) {
                        return ResponseEntity.status(401)
                                        .body(ApiResponse.error("Refresh token no encontrado", null));
                }

                // ❌ Token inválido o no es refresh
                if (!jwtService.isTokenValid(refreshToken)
                                || !jwtService.isRefreshToken(refreshToken)
                                || !refreshTokenService.isValid(refreshToken)) {
                        return ResponseEntity.status(401)
                                        .body(ApiResponse.error("Refresh token inválido", null));
                }

                String username = jwtService.getUsername(refreshToken);

                // ✅ role desde BD (fuente de verdad)
                String role = usuarioService.getRoleByUsername(username).name();

                String newAccessToken = jwtService.generateAccessToken(username, role);
                String newRefreshToken = jwtService.generateRefreshToken(username);
                
                // ✅ REVOCAR refresh anterior y GUARDAR el nuevo
                refreshTokenService.revokeAll(username);
                refreshTokenService.save(username, newRefreshToken);

                // 🍪 Nueva cookie (rotación)
                ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", newRefreshToken)
                                .httpOnly(true)
                                .secure(false) // true en PROD
                                .path("/auth/refresh") // esto significa que la cookie se enviará en TODAS las rutas, no
                                                       // solo /auth/refresh, para que funcione en cross-site
                                .maxAge(7 * 24 * 60 * 60)
                                .sameSite("Lax") // Protege contra CSRF pero permite navegación normal, y será None con
                                                 // secure(true) en producción, para que funcione en cross-site
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                                .body(ApiResponse.ok("Access token renovado", newAccessToken));
        }

        /**
         * LOGOUT REAL - NIVEL 8
         * 
         * - Revoca refresh tokens en BD
         * - Borra cookie HttpOnly
         */
        @PostMapping("/logout")
        public ResponseEntity<ApiResponse<?>> logout(
                        @CookieValue(name = "refreshToken", required = false) String refreshToken) {

                if (refreshToken != null && jwtService.isTokenValid(refreshToken)) {
                        String usuario = jwtService.getUsername(refreshToken);
                        refreshTokenService.revokeAll(usuario);
                }

                // 🍪 Borrar cookie
                ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                                .httpOnly(true)
                                .secure(false)
                                .path("/auth/refresh")
                                .maxAge(0)
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                                .body(ApiResponse.ok("Logout exitoso", null));
        }

}
