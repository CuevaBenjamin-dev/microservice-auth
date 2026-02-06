package com.service.microservice_auth.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint protegido de prueba.
 */
@RestController
public class TestController {

    @GetMapping("/protected")
    public String protectedEndpoint() {
        return "Acceso permitido con Access Token válido";
    }
}
