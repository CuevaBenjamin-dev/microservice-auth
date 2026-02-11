package com.service.microservice_auth.models;

import jakarta.persistence.*;
import lombok.Data;

/**
 * ENTIDAD REFRESH TOKEN - NIVEL 8
 * 
 * - Guarda SOLO hash del refresh token
 * - Permite revocar sesiones
 * - Base para logout real
 */
@Data
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Usuario dueño del token
    @Column(nullable = false)
    private String usuario;

    // Hash del refresh token (nunca el token real)
    @Column(nullable = false, length = 255)
    private String tokenHash;

    // Permite revocación
    @Column(nullable = false)
    private boolean revoked = false;
}
