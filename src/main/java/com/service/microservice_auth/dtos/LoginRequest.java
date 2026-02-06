package com.service.microservice_auth.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO que representa la solicitud de login.
 * NIVEL 2:
 * - Validación declarativa (fail fast)
 * - Aún NO aplica hashing ni tokens
 */
public class LoginRequest {

    @NotBlank(message = "El campo 'usuario' no puede estar vacío")
    @Size(min = 5, max = 15, message = "El campo 'usuario' debe tener entre 5 y 15 caracteres")
    private String usuario;

    @NotBlank(message = "El campo 'password' no puede estar vacío")
    @Size(min = 8, max = 50, message = "El campo 'password' debe tener entre 8 y 50 caracteres")
    private String password;

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}
