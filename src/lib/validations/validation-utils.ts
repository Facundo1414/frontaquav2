import { ZodError, ZodSchema } from "zod";

/**
 * Resultado de validación tipado
 */
export type ValidationResult<T> =
  | { success: true; data: T; errors: null }
  | { success: false; data: null; errors: Record<string, string[]> };

/**
 * Valida datos con un schema de Zod y retorna resultado estructurado
 */
export function validateWithSchema<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return {
      success: true,
      data: validated,
      errors: null,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors: Record<string, string[]> = {};

      error.issues.forEach((err: any) => {
        const path = err.path.join(".");
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(err.message);
      });

      return {
        success: false,
        data: null,
        errors: formattedErrors,
      };
    }

    return {
      success: false,
      data: null,
      errors: { _root: ["Error de validación desconocido"] },
    };
  }
}

/**
 * Valida datos de forma segura (safe parse)
 * Retorna null si la validación falla
 */
export function safeValidate<T>(schema: ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Sanitiza un string eliminando espacios extra y caracteres peligrosos
 */
export function sanitizeString(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ") // Normalizar espacios
    .replace(/[<>]/g, ""); // Eliminar < y > para prevenir XSS básico
}

/**
 * Sanitiza un objeto recursivamente
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === "string") {
        sanitized[key] = sanitizeString(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item: any) =>
          typeof item === "object" && item !== null
            ? sanitizeObject(item)
            : item
        );
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

/**
 * Valida archivo Excel (tamaño y extensión)
 */
export function validateExcelFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Tamaño máximo: 10 MB
  const MAX_SIZE = 10 * 1024 * 1024;

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: "El archivo no debe superar los 10 MB",
    };
  }

  // Extensiones permitidas
  const validExtensions = [".xlsx", ".xls"];
  const hasValidExtension = validExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: "El archivo debe ser un Excel (.xlsx o .xls)",
    };
  }

  // Validar MIME type (puede ser engañado, pero es una capa extra)
  const validMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
  ];

  if (!validMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Tipo de archivo inválido",
    };
  }

  return { valid: true };
}

/**
 * Valida PDF (tamaño y extensión)
 */
export function validatePdfFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const MAX_SIZE = 5 * 1024 * 1024;

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: "El PDF no debe superar los 5 MB",
    };
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return {
      valid: false,
      error: "El archivo debe ser un PDF",
    };
  }

  if (file.type !== "application/pdf") {
    return {
      valid: false,
      error: "Tipo de archivo inválido",
    };
  }

  return { valid: true };
}

/**
 * Valida imagen (tamaño y extensión)
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const MAX_SIZE = 2 * 1024 * 1024;

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: "La imagen no debe superar los 2 MB",
    };
  }

  const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const hasValidExtension = validExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: "El archivo debe ser una imagen (.jpg, .png, .webp)",
    };
  }

  const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Tipo de imagen inválido",
    };
  }

  return { valid: true };
}
