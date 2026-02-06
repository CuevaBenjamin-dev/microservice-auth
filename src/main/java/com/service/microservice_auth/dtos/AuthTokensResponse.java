package com.service.microservice_auth.dtos;

/**
 * DTO que representa los tokens de autenticación.
 * 
 * NIVEL 4:
 * - accessToken: se usa para acceder a recursos
 * - refreshToken: se usa para renovar el access token
 */
public class AuthTokensResponse {

    private String accessToken;
    private String refreshToken;

    public AuthTokensResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }
}
