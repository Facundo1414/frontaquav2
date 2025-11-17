'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Clock, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Sistema de horario: Lunes a Viernes, 8:00 AM - 4:00 PM
 * Muestra banner cuando el sistema está fuera de horario
 */
export default function SystemScheduleBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
      const hour = now.getHours();

      // Fuera de horario: Fines de semana o fuera de 8-16hs
      const isWeekend = day === 0 || day === 6;
      const isOutsideWorkingHours = hour < 8 || hour >= 16;

      setShowBanner(isWeekend || isOutsideWorkingHours);
    };

    checkSchedule();
    // Verificar cada minuto
    const interval = setInterval(checkSchedule, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!showBanner || dismissed) return null;

  return (
    <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 mb-4 relative">
      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-300 pr-8">
        <strong>Sistema fuera de horario:</strong> El procesamiento de clientes PYSE funciona de <strong>Lunes a Viernes, 8:00 AM - 4:00 PM</strong>.
        Podrás procesar consultas durante el horario laboral.
      </AlertDescription>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400"
        aria-label="Cerrar aviso"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
}

/**
 * Hook para verificar si el sistema está en horario de trabajo
 */
export function useSystemSchedule() {
  const [isWorkingHours, setIsWorkingHours] = useState(true);

  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();

      const isWeekday = day >= 1 && day <= 5;
      const isDuringWorkHours = hour >= 8 && hour < 16;

      setIsWorkingHours(isWeekday && isDuringWorkHours);
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 60000);

    return () => clearInterval(interval);
  }, []);

  return isWorkingHours;
}
