package com.service.microservice_auth.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.service.microservice_auth.models.Role;

public class CreateUserRequest {

    @NotBlank
    @Size(min = 5, max = 15)
    private String usuario;

    @NotBlank
    @Size(min = 8, max = 50)
    private String password;

    private Role role = Role.USER;

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

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
