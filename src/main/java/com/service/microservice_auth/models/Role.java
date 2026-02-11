package com.service.microservice_auth.models;

/**
 * Roles del sistema.
 * - ADMIN: gestiona usuarios
 * - USER: genera PPTX (consumirá FastAPI)
 */
public enum Role {
    ADMIN,
    USER
}
