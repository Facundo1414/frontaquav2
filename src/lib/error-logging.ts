import { logger } from '@/lib/logger';

/**
 * Utilidades para logging de errores client-side
 */

export interface ErrorLogData {
  message: string;
  stack?: string;
  digest?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  module?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Formatea un error para logging
 */
export function formatErrorForLogging(
  error: Error & { digest?: string },
  module?: string,
  metadata?: Record<string, any>
): ErrorLogData {
  return {
    message: error.message,
    stack: error.stack,
    digest: error.digest,
    timestamp: new Date().toISOString(),
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    url: typeof window !== "undefined" ? window.location.href : "unknown",
    module,
    metadata,
  };
}

/**
 * Envía el error a la consola con formato estructurado
 */
export function logErrorToConsole(errorData: ErrorLogData): void {
  console.error("🚨 Error capturado:", {
    ...errorData,
    // Agregar información adicional del navegador
    browser: {
      language:
        typeof navigator !== "undefined" ? navigator.language : "unknown",
      platform:
        typeof navigator !== "undefined" ? navigator.platform : "unknown",
      cookieEnabled:
        typeof navigator !== "undefined" ? navigator.cookieEnabled : "unknown",
    },
    viewport: {
      width: typeof window !== "undefined" ? window.innerWidth : "unknown",
      height: typeof window !== "undefined" ? window.innerHeight : "unknown",
    },
  });
}

/**
 * Envía el error a un servicio externo (Sentry, LogRocket, etc.)
 * TODO: Implementar integración con servicio de logging
 */
export async function sendErrorToLoggingService(
  errorData: ErrorLogData
): Promise<void> {
  // Solo en producción
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  try {
    // TODO: Implementar llamada a API de logging
    // Ejemplos:

    // Sentry:
    // Sentry.captureException(new Error(errorData.message), {
    //   tags: { module: errorData.module },
    //   extra: errorData.metadata,
    // })

    // LogRocket:
    // LogRocket.captureException(new Error(errorData.message), {
    //   tags: { module: errorData.module },
    //   extra: errorData,
    // })

    // API propia:
    // await fetch('/api/error-logging', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData),
    // })

    logger.log(
      "Error enviado a servicio de logging (simulado):",
      errorData.digest
    );
  } catch (err) {
    // No lanzar error si el logging falla
    console.error("Error al enviar log a servicio externo:", err);
  }
}

/**
 * Handler principal de errores
 * Combina logging en consola y envío a servicio externo
 */
export function handleError(
  error: Error & { digest?: string },
  module?: string,
  metadata?: Record<string, any>
): void {
  const errorData = formatErrorForLogging(error, module, metadata);

  // Log a consola siempre
  logErrorToConsole(errorData);

  // Enviar a servicio externo en producción
  if (process.env.NODE_ENV === "production") {
    sendErrorToLoggingService(errorData).catch(console.error);
  }
}

/**
 * Hook de ejemplo para usar en componentes
 *
 * Usage:
 * ```typescript
 * import { handleError } from '@/lib/error-logging'
 *
 * try {
 *   // código que puede fallar
 * } catch (error) {
 *   handleError(error as Error, 'senddebts', { userId: user.id })
 * }
 * ```
 */

/**
 * Wrapper para llamadas async con manejo de errores
 */
export async function withErrorHandler<T>(
  fn: () => Promise<T>,
  module?: string,
  metadata?: Record<string, any>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    handleError(error as Error, module, metadata);
    throw error;
  }
}

/**
 * Crea un error personalizado con contexto adicional
 */
export class ApplicationError extends Error {
  constructor(
    message: string,
    public module?: string,
    public statusCode?: number,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}
