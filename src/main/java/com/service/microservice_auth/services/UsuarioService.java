package com.service.microservice_auth.services;

import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

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
}
