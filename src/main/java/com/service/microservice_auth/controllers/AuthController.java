package com.service.microservice_auth.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.service.microservice_auth.dtos.ApiResponse;
import com.service.microservice_auth.dtos.AuthTokensResponse;
import com.service.microservice_auth.dtos.LoginRequest;
import com.service.microservice_auth.dtos.RefreshTokenRequest;
import com.service.microservice_auth.security.JwtService;
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
@CrossOrigin(origins = "*") // en producción se restringirá
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtService jwtService;
    private final UsuarioService usuarioService;

    public AuthController(JwtService jwtService, UsuarioService usuarioService) {
        this.jwtService = jwtService;
        this.usuarioService = usuarioService;
    }

    /**
     * Endpoint de login básico.
     * 
     * Flujo:
     * 1. Recibe credenciales (LoginRequest)
     * 2. Valida datos (@Valid)
     * 3. Llama a UsuarioService
     * 4. Devuelve ApiResponse estándar
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody LoginRequest request) {

        boolean success = usuarioService.login(
                request.getUsuario(),
                request.getPassword());

        if (!success) {
            return ResponseEntity.status(401).body(
                    ApiResponse.error("Usuario o contraseña incorrectos", null));
        }

        // Generar tokens
        String accessToken = jwtService.generateAccessToken(request.getUsuario());
        String refreshToken = jwtService.generateRefreshToken(request.getUsuario());

        AuthTokensResponse tokens = new AuthTokensResponse(
                accessToken,
                refreshToken);

        return ResponseEntity.ok(
                ApiResponse.ok("Login exitoso", tokens));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<?>> refresh(@RequestBody RefreshTokenRequest request) {

        String refreshToken = request.getRefreshToken();

        if (!jwtService.isTokenValid(refreshToken)) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Refresh token inválido", null));
        }

        if (!jwtService.isRefreshToken(refreshToken)) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Token incorrecto", null));
        }

        String username = jwtService.getUsername(refreshToken);

        String newAccessToken = jwtService.generateAccessToken(username);

        return ResponseEntity.ok(
                ApiResponse.ok("Token renovado", newAccessToken));
    }

}
