package com.service.microservice_auth.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.service.microservice_auth.dtos.ApiResponse;
import com.service.microservice_auth.dtos.CreateUserRequest;
import com.service.microservice_auth.dtos.UpdateUserRequest;
import com.service.microservice_auth.models.Usuario;
import com.service.microservice_auth.services.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UsuarioAdminController {

    private final UsuarioService usuarioService;

    public UsuarioAdminController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /** ADMIN: listar usuarios */
    @GetMapping
    public ApiResponse<List<Usuario>> list() {
        return ApiResponse.ok("Usuarios", usuarioService.listAll());
    }

    /** ADMIN: crear usuario */
    @PostMapping
    public ApiResponse<Usuario> create(
            @RequestBody @Valid CreateUserRequest req) {

        Usuario u = usuarioService.createUser(
                req.getUsuario(),
                req.getPassword(),
                req.getRole());

        return ApiResponse.ok("Usuario creado", u);
    }

    /** ADMIN: actualizar usuario */
    @PutMapping("/{id}")
    public ApiResponse<Usuario> update(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest req) {

        Usuario u = usuarioService.updateUser(
                id,
                req.getPassword(),
                req.getRole());

        return ApiResponse.ok("Usuario actualizado", u);
    }

    /** ADMIN: eliminar usuario */
    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        usuarioService.deleteUser(id);
        return ApiResponse.ok("Usuario eliminado", null);
    }
}
