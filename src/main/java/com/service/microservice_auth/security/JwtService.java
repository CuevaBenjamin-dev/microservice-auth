package com.service.microservice_auth.security;

import java.util.Date;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;

/**
 * Servicio encargado de generar y gestionar JWT.
 * 
 * NIVEL 4:
 * - Access Token (vida corta)
 * - Refresh Token (vida larga)
 */
@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiration-ms}") long accessExpirationMs,
            @Value("${jwt.refresh-expiration-ms}") long refreshExpirationMs) {

        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    /**
     * Genera un ACCESS TOKEN.
     * 
     * - Se usa para acceder a endpoints protegidos
     * - Vida corta
     */
    public String generateAccessToken(String username, String role) {
        return generateToken(username, accessExpirationMs, "ACCESS", role);
    }

    /**
     * Genera un REFRESH TOKEN.
     * 
     * - Se usa solo para renovar el access token
     * - Vida larga
     */
    public String generateRefreshToken(String username) {
        // refresh NO necesita role, solo identidad y type
        return generateToken(username, refreshExpirationMs, "REFRESH", null);
    }

    /**
     * Método interno para generar tokens JWT.
     */
    private String generateToken(String username, long expirationMs, String type, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        var builder = Jwts.builder()
                .setId(UUID.randomUUID().toString())
                .setSubject(username)
                .claim("type", type)
                .setIssuedAt(now)
                .setExpiration(expiryDate);

        // ✅ Role SOLO en access token
        if (role != null && "ACCESS".equals(type)) {
            builder = builder.claim("role", role);
        }

        return builder
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extrae role del ACCESS token.
     */
    public String getRole(String token) {
        Claims claims = getClaims(token);
        Object role = claims.get("role");
        return role == null ? null : role.toString();
    }

    /**
     * Métodos de validación JWT.
     */
    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extrae los claims del token.
     */
    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Valida que el token sea de tipo ACCESS.
     */
    public boolean isAccessToken(String token) {
        Claims claims = getClaims(token);
        return "ACCESS".equals(claims.get("type"));
    }

    /**
     * Extrae el username (subject).
     */
    public String getUsername(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isRefreshToken(String token) {
        Claims claims = getClaims(token);
        return "REFRESH".equals(claims.get("type"));
    }

}
