/**
 * Hook para manejo de errores async en componentes
 */

import { useState, useCallback } from "react";
import { handleError } from "@/lib/error-logging";
import { toast } from "sonner";

interface UseAsyncErrorOptions {
  module?: string;
  onError?: (error: Error) => void;
  showToast?: boolean;
  toastMessage?: string;
}

/**
 * Hook para capturar y manejar errores en operaciones async
 *
 * Usage:
 * ```typescript
 * const { catchError } = useAsyncError({ module: 'senddebts' })
 *
 * const handleUpload = catchError(async () => {
 *   const result = await uploadFile(file)
 *   return result
 * })
 * ```
 */
export function useAsyncError(options: UseAsyncErrorOptions = {}) {
  const [error, setError] = useState<Error | null>(null);
  const [isError, setIsError] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
    setIsError(false);
  }, []);

  const catchError = useCallback(
    <T extends any[], R>(fn: (...args: T) => Promise<R>) => {
      return async (...args: T): Promise<R | undefined> => {
        try {
          clearError();
          return await fn(...args);
        } catch (err) {
          const error = err as Error;
          setError(error);
          setIsError(true);

          // Log el error
          handleError(error, options.module, {
            hook: "useAsyncError",
            args: args.length > 0 ? args : undefined,
          });

          // Callback personalizado
          options.onError?.(error);

          // Toast opcional
          if (options.showToast) {
            toast.error(
              options.toastMessage || error.message || "Ocurrió un error"
            );
          }

          return undefined;
        }
      };
    },
    [options, clearError]
  );

  return {
    error,
    isError,
    clearError,
    catchError,
  };
}

/**
 * Hook simple para try-catch con logging automático
 *
 * Usage:
 * ```typescript
 * const tryCatch = useTryCatch('senddebts')
 *
 * await tryCatch(
 *   async () => await uploadFile(file),
 *   (error) => toast.error('Error al subir archivo')
 * )
 * ```
 */
export function useTryCatch(module?: string) {
  return useCallback(
    async <T>(
      fn: () => Promise<T>,
      onError?: (error: Error) => void
    ): Promise<T | undefined> => {
      try {
        return await fn();
      } catch (err) {
        const error = err as Error;
        handleError(error, module);
        onError?.(error);
        return undefined;
      }
    },
    [module]
  );
}
