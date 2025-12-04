import { useState, useEffect } from "react";
import axios from "axios";

interface CircuitState {
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  failures: number;
  successes: number;
  fallbackCount: number;
  lastFailureTime: Date | null;
  nextAttemptTime: Date | null;
}

interface CircuitBreakerStatus {
  timestamp: string;
  circuitBreakers: Record<string, CircuitState>;
  summary: {
    total: number;
    open: number;
    halfOpen: number;
    closed: number;
  };
}

/**
 * Hook para consultar el estado de los circuit breakers
 *
 * @param circuitName - Nombre específico del circuit breaker (opcional)
 * @param pollingInterval - Intervalo de polling en ms (default: 30000 = 30s)
 * @returns Estado del circuit breaker específico o de todos
 */
export function useCircuitBreakerStatus(
  circuitName?: string,
  pollingInterval: number = 30000
) {
  const [status, setStatus] = useState<
    CircuitState | CircuitBreakerStatus | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get<CircuitBreakerStatus>(
          `${process.env.NEXT_PUBLIC_COMPROBANTE_WORKER_URL}/health/circuit-breakers`
        );

        if (circuitName) {
          // Retornar solo el circuit breaker especificado
          const circuit = response.data.circuitBreakers[circuitName];
          setStatus(circuit || null);
        } else {
          // Retornar todos los circuit breakers
          setStatus(response.data);
        }

        setError(null);
      } catch (err: any) {
        console.error(
          "[useCircuitBreakerStatus] Error checking circuit breaker:",
          err
        );
        setError(err.message || "Error al consultar circuit breakers");
      } finally {
        setIsLoading(false);
      }
    };

    // Consultar inmediatamente
    checkStatus();

    // Setup polling
    const interval = setInterval(checkStatus, pollingInterval);

    return () => clearInterval(interval);
  }, [circuitName, pollingInterval]);

  return { status, isLoading, error };
}

/**
 * Hook simplificado para verificar si Aguas Cordobesas está disponible
 */
export function useAguasCordobesasAvailability() {
  const { status, isLoading } = useCircuitBreakerStatus(
    "aguas-cordobesas-token"
  );

  const isAvailable = !status || (status as CircuitState).state === "CLOSED";
  const nextAttemptTime = status
    ? (status as CircuitState).nextAttemptTime
    : null;

  return { isAvailable, nextAttemptTime, isLoading };
}
