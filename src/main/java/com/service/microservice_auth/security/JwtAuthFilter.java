package com.service.microservice_auth.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filtro de autorización JWT.
 * 
 * NIVEL 5:
 * - Valida Access Token
 * - Rechaza tokens inválidos
 * - No usa Spring Security aún
 */
@Component
public class JwtAuthFilter implements Filter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String origin = req.getHeader("Origin");
        if ("http://localhost:4200".equals(origin) ||
                "https://ipdefrontendcertificados.vercel.app".equals(origin)) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Vary", "Origin");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
            res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        }

        // if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
        // res.setStatus(HttpServletResponse.SC_OK);
        // return;
        // }

        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
            res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            res.setStatus(HttpServletResponse.SC_OK);
            res.getWriter().flush();
            return;
        }

        String path = req.getRequestURI();

        // 🔓 Endpoints públicos
        if (path.startsWith("/auth")) {
            chain.doFilter(request, response);
            return;
        }

        // (1) Validación JWT access token (igual que ya tienes)
        String authHeader = req.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String token = authHeader.substring(7);

        if (!jwtService.isTokenValid(token) || !jwtService.isAccessToken(token)) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // (2) ✅ Autorización por rol (solo para rutas específicas)
        if (path.startsWith("/api/users")) {
            String role = jwtService.getRole(token);
            if (!"ADMIN".equals(role)) {
                res.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
                return;
            }
        }

        // Token válido y autorizado → continuar
        chain.doFilter(request, response);
    }
}
