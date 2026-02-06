package com.service.microservice_auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;

import com.service.microservice_auth.security.JwtAuthFilter;

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

    /**
     * Registro manual del filtro JWT.
     */
    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtFilter(JwtAuthFilter filter) {
        FilterRegistrationBean<JwtAuthFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(filter);
        registration.addUrlPatterns("/*");
        registration.setOrder(1);
        return registration;
    }
}
