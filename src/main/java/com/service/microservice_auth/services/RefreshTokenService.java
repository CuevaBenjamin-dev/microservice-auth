package com.service.microservice_auth.services;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.springframework.stereotype.Service;

import com.service.microservice_auth.models.RefreshToken;
import com.service.microservice_auth.repositories.RefreshTokenRepository;

import org.springframework.transaction.annotation.Transactional;

/**
 * SERVICIO REFRESH TOKEN - NIVEL 8
 * 
 * - Hash seguro del refresh token
 * - Validación
 * - Revocación
 */
@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repository;

    public RefreshTokenService(RefreshTokenRepository repository) {
        this.repository = repository;
    }

    /**
     * Guarda refresh token hasheado.
     */
    public void save(String usuario, String refreshToken) {
        RefreshToken rt = new RefreshToken();
        rt.setUsuario(usuario);
        rt.setTokenHash(hash(refreshToken));
        rt.setRevoked(false);

        repository.save(rt);
    }

    /**
     * Valida si el refresh token es válido y no revocado.
     */
    public boolean isValid(String refreshToken) {
        return repository
                .findByTokenHashAndRevokedFalse(hash(refreshToken))
                .isPresent();
    }

    /**
     * Revoca TODOS los refresh tokens de un usuario (logout).
     */
    @Transactional // Para asegurar que la operación de revocación es atómica
    public void revokeAll(String usuario) {
        repository.deleteByUsuario(usuario);
    }

    /**
     * Hash SHA-256 del token.
     */
    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encoded = digest.digest(token.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder();
            for (byte b : encoded) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();

        } catch (Exception e) {
            throw new RuntimeException("Error hashing token");
        }
    }
}
