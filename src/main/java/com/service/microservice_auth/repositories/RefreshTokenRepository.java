package com.service.microservice_auth.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.service.microservice_auth.models.RefreshToken;

import java.util.Optional;

/**
 * REPOSITORIO REFRESH TOKEN - NIVEL 8
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHashAndRevokedFalse(String tokenHash);

    void deleteByUsuario(String usuario);
}
