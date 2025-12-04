import { useAguasCordobesasAvailability } from '@/hooks/useCircuitBreakerStatus';
import { AlertTriangle, Clock, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Banner que muestra cuando el servicio de Aguas Cordobesas no está disponible
 * debido a que el circuit breaker está abierto.
 */
export function CircuitBreakerBanner() {
  const { isAvailable, nextAttemptTime, isLoading } = useAguasCordobesasAvailability();
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!nextAttemptTime) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const next = new Date(nextAttemptTime);
      const diffMs = next.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeRemaining('pronto');
        return;
      }

      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);

      if (diffMins > 0) {
        setTimeRemaining(`${diffMins} min ${diffSecs} seg`);
      } else {
        setTimeRemaining(`${diffSecs} seg`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [nextAttemptTime]);

  // No mostrar nada si está cargando o si está disponible
  if (isLoading || isAvailable) {
    return null;
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm animate-in fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-red-800 mb-1">
            Servicio de Aguas Cordobesas no disponible
          </h3>
          
          <div className="text-sm text-red-700 space-y-2">
            <p>
              El servicio externo está experimentando problemas técnicos. 
              Las consultas están temporalmente deshabilitadas para evitar errores.
            </p>
            
            {nextAttemptTime && (
              <div className="flex items-center gap-2 bg-red-100 px-3 py-2 rounded-md">
                <Clock className="h-4 w-4 text-red-600" />
                <span className="text-red-800 font-medium">
                  Se reintentará automáticamente en: {timeRemaining}
                </span>
              </div>
            )}
            
            <p className="text-xs text-red-600">
              <strong>¿Qué puedes hacer?</strong>
              <br />
              • Espera unos minutos y el sistema reintentará automáticamente
              <br />
              • Si el problema persiste, contacta al administrador
            </p>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="flex-shrink-0 text-red-700 hover:text-red-900 transition-colors"
          title="Refrescar página"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Versión compacta del banner para usar en modales o espacios pequeños
 */
export function CircuitBreakerAlert() {
  const { isAvailable, nextAttemptTime, isLoading } = useAguasCordobesasAvailability();

  if (isLoading || isAvailable) return null;

  const getMinutesRemaining = () => {
    if (!nextAttemptTime) return 5;
    const now = new Date();
    const next = new Date(nextAttemptTime);
    const diffMs = next.getTime() - now.getTime();
    return Math.ceil(diffMs / 60000);
  };

  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>
        Servicio no disponible. Reintento en ~{getMinutesRemaining()} min.
      </span>
    </div>
  );
}
