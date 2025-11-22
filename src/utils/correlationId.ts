/**
 * 🔍 Correlation ID Utilities
 *
 * Generación de IDs únicos para trazabilidad de requests
 * Formato: corr-xxxx-xxxx-xxxx
 */

/**
 * Genera un correlation ID único
 */
export function generateCorrelationId(): string {
  // Generar 12 caracteres hexadecimales aleatorios
  const hex = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");

  // Formato: corr-xxxx-xxxx-xxxx
  return `corr-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

/**
 * Validar formato de correlation ID
 */
export function isValidCorrelationId(id: string): boolean {
  return /^corr-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}$/.test(id);
}
