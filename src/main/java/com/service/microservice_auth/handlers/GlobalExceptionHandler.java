package com.service.microservice_auth.handlers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.service.microservice_auth.dtos.ApiResponse;

/**
 * Manejador global de excepciones.
 * 
 * NIVEL 2:
 * - Centraliza errores
 * - Devuelve ApiResponse estándar
 * - Evita lógica de errores en los controllers
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Maneja errores de validación (@Valid).
     * 
     * Se ejecuta automáticamente cuando un DTO
     * no cumple las reglas declaradas.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        for (FieldError err : ex.getBindingResult().getFieldErrors()) {
            errors.put(err.getField(), err.getDefaultMessage());
        }

        return ResponseEntity.badRequest().body(
            ApiResponse.error("Datos inválidos", errors)
        );
    }
}
