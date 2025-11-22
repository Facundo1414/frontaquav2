'use client';

import { useWhatsAppUnified } from '@/hooks/useWhatsAppUnified';
import { AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function WhatsAppSystemBanner() {
  const { ready, loading, error, stats, canSendMessage, reason, mode } = useWhatsAppUnified();

  // Toast cuando cambia el estado
  useEffect(() => {
    if (!loading && ready) {
      // No mostrar toast en el primer render
      const isFirstRender = sessionStorage.getItem('whatsapp-toast-shown') === null;
      if (!isFirstRender) {
        toast.success('✅ Sistema WhatsApp conectado', {
          description: mode === 'admin-baileys' ? 'Modo Admin' : 'Sistema centralizado',
        });
      }
      sessionStorage.setItem('whatsapp-toast-shown', 'true');
    } else if (!loading && !ready && !error) {
      const isFirstRender = sessionStorage.getItem('whatsapp-toast-shown') === null;
      if (!isFirstRender) {
        toast.warning('⚠️ Sistema WhatsApp desconectado', {
          description: 'Los envíos están pausados',
        });
      }
    }
  }, [ready, loading, error, mode]);

  // Toast cuando se alcanza el 80% del límite
  useEffect(() => {
    if (stats && stats.percentageUsed >= 80 && stats.percentageUsed < 100) {
      const alreadyShown = sessionStorage.getItem('whatsapp-limit-warning');
      if (!alreadyShown) {
        toast.warning('⚠️ Límite de mensajes por alcanzar', {
          description: `Has usado ${stats.messagesToday} de ${stats.maxPerDay} mensajes hoy`,
        });
        sessionStorage.setItem('whatsapp-limit-warning', 'true');
      }
    }
  }, [stats]);

  // Limpiar storage al cambiar de día
  useEffect(() => {
    const checkDay = () => {
      const lastDay = sessionStorage.getItem('whatsapp-current-day');
      const currentDay = new Date().toDateString();
      if (lastDay !== currentDay) {
        sessionStorage.removeItem('whatsapp-limit-warning');
        sessionStorage.setItem('whatsapp-current-day', currentDay);
      }
    };
    checkDay();
    const interval = setInterval(checkDay, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="animate-pulse flex gap-2 w-full">
            <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
            <div className="h-4 w-48 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-b border-red-200 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-yellow-700">
          <AlertCircle className="h-4 w-4" />
          <span>Sistema WhatsApp desconectado. Los envíos están pausados.</span>
          {mode === 'admin-personal' && (
            <span className="ml-2 text-xs">(Cuenta Personal)</span>
          )}
        </div>
      </div>
    );
  }

  const getProgressColor = () => {
    if (!stats) return 'bg-green-500';
    if (stats.percentageUsed >= 90) return 'bg-red-500';
    if (stats.percentageUsed >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-green-50 border-b border-green-200 px-4 py-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Estado */}
        <div className="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle className="h-4 w-4" />
          <span className="font-medium">Sistema WhatsApp Activo</span>
          {mode === 'admin-personal' && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Personal</span>
          )}
        </div>

        {/* Límites (solo si hay stats) */}
        {stats && (
          <div className="flex items-center gap-6">
            {/* Mensajes */}
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-600" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Mensajes hoy</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.maxPerDay - stats.messagesToday} / {stats.maxPerDay}
                  </span>
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor()} transition-all duration-300`}
                      style={{ width: `${stats.percentageUsed}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Horario */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Horario</span>
                <span className={`text-sm font-semibold ${stats.isWorkingHours ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.isWorkingHours ? 'Activo' : 'Fuera de horario'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Advertencia */}
        {!canSendMessage && reason && (
          <div className="w-full mt-2 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>{reason}</span>
          </div>
        )}
      </div>
    </div>
  );
}
