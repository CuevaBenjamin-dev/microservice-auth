package com.service.microservice_auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Configuración de seguridad básica.
 * 
 * NIVEL 3:
 * - Provee BCryptPasswordEncoder como Bean
 * - Aún NO usa Spring Security (filtros, JWT, etc)
 */
@Configuration
public class SecurityConfig {

    /**
     * BCrypt con fuerza por defecto (10).
     * 
     * Suficiente para la mayoría de sistemas.
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
