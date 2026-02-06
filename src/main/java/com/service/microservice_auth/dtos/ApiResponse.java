package com.service.microservice_auth.dtos;

/**
 * Respuesta estándar del API.
 * 
 * NIVEL 2 - PASO 3:
 * - Unifica TODAS las respuestas del backend
 * - Facilita escalabilidad y reutilización
 */
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private Object errors;

    public ApiResponse(boolean success, String message, T data, Object errors) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errors = errors;
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public T getData() { return data; }
    public Object getErrors() { return errors; }

    // Helpers estáticos (muy útiles)
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data, null);
    }

    public static ApiResponse<?> error(String message, Object errors) {
        return new ApiResponse<>(false, message, null, errors);
    }
}
