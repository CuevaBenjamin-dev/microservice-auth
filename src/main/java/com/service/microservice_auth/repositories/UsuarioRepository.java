package com.service.microservice_auth.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.service.microservice_auth.models.Usuario;
import java.util.Optional;


public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsuario(String usuario);

}
