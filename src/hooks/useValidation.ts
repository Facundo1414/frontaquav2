import { useState, useCallback } from "react";
import { ZodSchema } from "zod";
import {
  validateWithSchema,
  ValidationResult,
} from "@/lib/validations/validation-utils";

/**
 * Hook para validación con Zod
 * Retorna función de validación y estado de errores
 */
export function useZodValidation<T>() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const validate = useCallback(
    (schema: ZodSchema<T>, data: unknown): ValidationResult<T> => {
      const result = validateWithSchema(schema, data);

      if (!result.success) {
        setErrors(result.errors);
      } else {
        setErrors({});
      }

      return result;
    },
    []
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  }, []);

  return {
    validate,
    errors,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0,
  };
}

/**
 * Hook para validación de archivos
 */
export function useFileValidation() {
  const [fileError, setFileError] = useState<string | null>(null);

  const validateFile = useCallback(
    (
      file: File | null,
      validator: (file: File) => { valid: boolean; error?: string }
    ): boolean => {
      if (!file) {
        setFileError("Debe seleccionar un archivo");
        return false;
      }

      const result = validator(file);

      if (!result.valid) {
        setFileError(result.error || "Archivo inválido");
        return false;
      }

      setFileError(null);
      return true;
    },
    []
  );

  const clearFileError = useCallback(() => {
    setFileError(null);
  }, []);

  return {
    validateFile,
    fileError,
    clearFileError,
    hasFileError: fileError !== null,
  };
}
