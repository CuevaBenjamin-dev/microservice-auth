package com.service.microservice_auth.services;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.service.microservice_auth.models.Role;
import com.service.microservice_auth.models.Usuario;
import com.service.microservice_auth.repositories.UsuarioRepository;

/**
 * Servicio de dominio para usuarios.
 * 
 * NIVEL 3:
 * - Comparación segura de contraseñas con BCrypt
 * - Nunca compara texto plano con texto plano
 */
@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            BCryptPasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Valida credenciales del usuario.
     *
     * @param usuario  username ingresado
     * @param password contraseña en texto plano (input)
     * @return true si las credenciales son válidas
     */
    public boolean login(String usuario, String password) {

        Optional<Usuario> usuarioDB = usuarioRepository.findByUsuario(usuario);

        if (usuarioDB.isEmpty()) { // significa que si usuarioDB no tiene un valor dentro entonces return false
            return false;
        }

        // return usuarioDB.get().getPassword().equals(password);
        // BCrypt compara texto plano vs hash almacenado
        return passwordEncoder.matches( // qué hace matches? compara el texto plano con el hash almacenado
                password,
                usuarioDB.get().getPassword());
    }

    /**
     * NIVEL 9.2 - ROLES
     * Obtiene el rol del usuario (para inyectarlo en el JWT).
     */
    public Role getRoleByUsername(String usuario) {
        return usuarioRepository.findByUsuario(usuario)
                .map(Usuario::getRole)
                .orElseThrow(() -> new RuntimeException("Usuario no existe"));
    }

    // ==========================
    // CRUD ADMIN (para controller)
    // ==========================

    public List<Usuario> listAll() {
        return usuarioRepository.findAll();
    }

    public Usuario createUser(String usuario, String rawPassword, Role role) {
        Usuario u = new Usuario();
        u.setUsuario(usuario);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setRole(role == null ? Role.USER : role);
        return usuarioRepository.save(u);
    }

    public Usuario updateUser(Long id, String rawPassword, Role role) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no existe"));

        if (rawPassword != null && !rawPassword.isBlank()) {
            u.setPassword(passwordEncoder.encode(rawPassword));
        }
        if (role != null) {
            u.setRole(role);
        }
        return usuarioRepository.save(u);
    }

    public void deleteUser(Long id) {
        usuarioRepository.deleteById(id);
    }
}
