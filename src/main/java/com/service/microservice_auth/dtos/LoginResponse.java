package com.service.microservice_auth.dtos;

/**
 * DTO de respuesta estándar para el login.
 * 
 * En niveles posteriores este DTO podrá extenderse
 * (token, roles, expiración, etc) sin romper el frontend.
 */
public class LoginResponse {

    private boolean success;
    private String message;

    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }
}