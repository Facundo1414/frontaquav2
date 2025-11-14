/**
 * Utility para mensajes de error user-friendly
 * Traduce errores técnicos a mensajes comprensibles
 */

export const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  "Network Error":
    "No se pudo conectar al servidor. Verifica tu conexión a internet.",
  ECONNREFUSED: "El servidor no está disponible en este momento.",
  ETIMEDOUT: "La conexión tardó demasiado. Intenta nuevamente.",

  // HTTP Status codes
  "400": "Solicitud incorrecta. Verifica los datos ingresados.",
  "401": "Sesión expirada. Por favor, inicia sesión nuevamente.",
  "403": "No tienes permisos para realizar esta acción.",
  "404": "Recurso no encontrado.",
  "409": "Ya existe un registro con estos datos.",
  "422": "Los datos proporcionados son inválidos.",
  "429": "Has realizado demasiadas solicitudes. Espera unos momentos.",
  "500": "Error del servidor. Intenta nuevamente en unos momentos.",
  "502": "El servidor está temporalmente no disponible.",
  "503": "Servicio no disponible. Intenta más tarde.",
  "504": "El servidor tardó demasiado en responder.",

  // Common errors
  "Invalid credentials": "Email o contraseña incorrectos.",
  "Email already exists": "Este email ya está registrado.",
  "Token expired": "Tu sesión ha expirado. Inicia sesión nuevamente.",
  "Invalid token": "Sesión inválida. Por favor, inicia sesión.",
  "File too large": "El archivo es demasiado grande.",
  "Invalid file format": "Formato de archivo no válido.",
  "No file uploaded": "No se subió ningún archivo.",

  // WhatsApp errors
  "WhatsApp not connected": "WhatsApp no está conectado. Escanea el código QR.",
  "Session not found": "Sesión de WhatsApp no encontrada.",
  "Failed to send message": "No se pudo enviar el mensaje. Intenta nuevamente.",

  // Default
  default: "Ha ocurrido un error inesperado. Por favor, intenta nuevamente.",
};

/**
 * Obtiene un mensaje de error user-friendly
 */
export function getUserFriendlyError(error: unknown): string {
  // Si es null o undefined
  if (!error) {
    return ERROR_MESSAGES["default"];
  }

  // Si es un error de Axios
  if (isAxiosError(error)) {
    // Intentar obtener mensaje del backend primero
    const backendMessage = error.response?.data?.message;
    if (backendMessage && ERROR_MESSAGES[backendMessage]) {
      return ERROR_MESSAGES[backendMessage];
    }

    // Por status code
    const status = error.response?.status?.toString();
    if (status && ERROR_MESSAGES[status]) {
      return ERROR_MESSAGES[status];
    }

    // Por mensaje de error
    const message = error.message;
    if (message && ERROR_MESSAGES[message]) {
      return ERROR_MESSAGES[message];
    }

    // Si tiene mensaje del backend, usarlo (pero traducido)
    if (backendMessage) {
      return translateBackendMessage(backendMessage);
    }
  }

  // Si es un Error estándar
  if (error instanceof Error) {
    const message = error.message;
    if (ERROR_MESSAGES[message]) {
      return ERROR_MESSAGES[message];
    }

    // Si es un mensaje técnico, traducirlo
    return translateBackendMessage(message);
  }

  // Si es un string
  if (typeof error === "string") {
    if (ERROR_MESSAGES[error]) {
      return ERROR_MESSAGES[error];
    }
    return translateBackendMessage(error);
  }

  return ERROR_MESSAGES["default"];
}

/**
 * Detecta si es un error de Axios
 */
function isAxiosError(error: any): error is {
  response?: {
    status?: number;
    data?: { message?: string };
  };
  message: string;
} {
  return error && typeof error === "object" && "message" in error;
}

/**
 * Traduce mensajes técnicos del backend a mensajes user-friendly
 */
function translateBackendMessage(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Patrones comunes
  if (
    lowerMessage.includes("duplicate") ||
    lowerMessage.includes("unique constraint")
  ) {
    return "Ya existe un registro con estos datos.";
  }

  if (lowerMessage.includes("not found")) {
    return "No se encontró el recurso solicitado.";
  }

  if (
    lowerMessage.includes("permission") ||
    lowerMessage.includes("unauthorized")
  ) {
    return "No tienes permisos para realizar esta acción.";
  }

  if (
    lowerMessage.includes("validation failed") ||
    lowerMessage.includes("invalid")
  ) {
    return "Los datos proporcionados no son válidos.";
  }

  if (lowerMessage.includes("timeout") || lowerMessage.includes("timed out")) {
    return "La operación tardó demasiado tiempo. Intenta nuevamente.";
  }

  if (lowerMessage.includes("connection") || lowerMessage.includes("connect")) {
    return "Error de conexión. Verifica tu internet.";
  }

  // Si el mensaje es muy técnico o muy largo, usar mensaje genérico
  if (message.length > 100 || /[{}[\]<>]/.test(message)) {
    return ERROR_MESSAGES["default"];
  }

  // Si es un mensaje corto y razonable, devolverlo
  return message;
}

/**
 * Hook para usar en componentes con toast
 */
export function useErrorHandler() {
  return (error: unknown) => {
    const message = getUserFriendlyError(error);
    return message;
  };
}
