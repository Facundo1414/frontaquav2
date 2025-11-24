'use client';

/**
 * 🔗 WhatsAppUnifiedContext
 *
 * Context Provider para evitar múltiples instancias de polling.
 * Centraliza el estado de WhatsApp y lo comparte entre todos los componentes.
 *
 * **Antes:** Cada componente que usaba useWhatsAppUnified creaba su propio polling interval
 * **Ahora:** Un solo polling interval compartido por toda la aplicación
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useGlobalContext } from './GlobalContext';
import { useWhatsappStatus } from '@/hooks/useWhatsappStatus';
import api from '@/lib/api/axiosInstance';

interface UnifiedWhatsAppStatus {
  // Estado de conexión
  connected: boolean;
  ready: boolean;
  authenticated: boolean;
  phone?: string;
  qr?: string | null;

  // Límites y restricciones
  stats?: {
    messagesToday: number;
    maxPerDay: number;
    isWorkingHours: boolean;
    percentageUsed: number;
  };

  // Metadatos
  mode: 'system' | 'admin-personal';
  loading: boolean;
  error: string | null;
  canSendMessage: boolean;
  reason?: string;
}

interface WhatsAppUnifiedContextValue extends UnifiedWhatsAppStatus {
  refresh: () => void;
}

const WhatsAppUnifiedContext = createContext<WhatsAppUnifiedContextValue | null>(null);

export function WhatsAppUnifiedProvider({ children }: { children: ReactNode }) {
  const { userId } = useGlobalContext();
  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || '';
  const isAdmin = userId === ADMIN_UID;

  // Estados
  const [status, setStatus] = useState<UnifiedWhatsAppStatus>({
    connected: false,
    ready: false,
    authenticated: false,
    mode: 'system',
    loading: true,
    error: null,
    canSendMessage: false,
  });

  // Retry con exponential backoff
  const [retryCount, setRetryCount] = useState(0);
  const [retryDelay, setRetryDelay] = useState(1000);
  const MAX_RETRIES = 5;

  // Admin: WebSocket en tiempo real
  const {
    status: adminStatus,
    isSubscribed: adminSubscribed,
    connected: adminConnected,
  } = useWhatsappStatus(userId, isAdmin);

  // Sistema Centralizado: Polling HTTP con retry
  const fetchSystemStatus = useCallback(async () => {
    try {
      const response = await api.get('/wa/state');

      if (response.data?.data) {
        const data = response.data.data;

        const maxPerDay = parseInt(process.env.NEXT_PUBLIC_MAX_MESSAGES_PER_DAY || '300');
        const workStart = parseInt(process.env.NEXT_PUBLIC_WORKING_HOURS_START || '9');
        const workEnd = parseInt(process.env.NEXT_PUBLIC_WORKING_HOURS_END || '16');

        const currentHour = new Date().getHours();
        const isWorkingHours = currentHour >= workStart && currentHour < workEnd;

        const messagesToday = data.stats?.messagesToday || 0;
        const messagesRemaining = maxPerDay - messagesToday;

        let canSendMessage = true;
        let reason: string | undefined;

        if (!data.ready) {
          canSendMessage = false;
          reason = 'Sistema WhatsApp no conectado';
        } else if (!isWorkingHours) {
          canSendMessage = false;
          reason = `Horario de envío: ${workStart}:00 - ${workEnd}:00 hs`;
        } else if (messagesRemaining <= 0) {
          canSendMessage = false;
          reason = 'Límite diario alcanzado (300 mensajes)';
        }

        setStatus({
          connected: true,
          ready: data.ready || false,
          authenticated: data.authenticated || false,
          phone: data.phone,
          qr: data.qr,
          stats: data.stats,
          mode: 'system',
          loading: false,
          error: null,
          canSendMessage,
          reason,
        });

        // Reset retry en éxito
        setRetryCount(0);
        setRetryDelay(1000);
      }
    } catch (err: any) {
      console.error('Error fetching WhatsApp system status:', err);

      const is429 = err.response?.status === 429;

      if (retryCount >= MAX_RETRIES) {
        console.error(`❌ Máximo de reintentos alcanzado (${MAX_RETRIES}). Pausando polling.`);

        setStatus((prev) => ({
          ...prev,
          loading: false,
          error: is429
            ? 'Demasiadas solicitudes - esperando para reintentar...'
            : 'Error de conexión - máximo de reintentos alcanzado',
          canSendMessage: false,
          reason: is429 ? 'Rate limit alcanzado - por favor espere' : 'Error de conexión persistente',
        }));

        return;
      }

      const nextRetry = retryCount + 1;
      const baseDelay = is429 ? 60000 : Math.min(retryDelay * 2, 16000);
      const nextDelay = is429 ? Math.max(baseDelay, 60000) : baseDelay;

      console.warn(
        `⚠️ ${is429 ? 'Rate limit (429)' : 'Error'} - Retry ${nextRetry}/${MAX_RETRIES} en ${nextDelay / 1000}s...`
      );

      setRetryCount(nextRetry);
      setRetryDelay(nextDelay);

      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: is429 ? 'Demasiadas solicitudes - esperando...' : err.message || 'Error al obtener estado del sistema',
        canSendMessage: false,
        reason: is429
          ? `Rate limit - reintentando en ${nextDelay / 1000}s...`
          : 'Error de conexión - reintentando...',
      }));
    }
  }, [retryCount, retryDelay, MAX_RETRIES]);

  // Admin: Usar WebSocket status
  useEffect(() => {
    if (isAdmin && adminStatus) {
      console.log('👤 Admin mode: usando WebSocket status', adminStatus);

      setStatus({
        connected: adminConnected,
        ready: adminStatus.ready || false,
        authenticated: adminStatus.authenticated || false,
        qr: adminStatus.qr,
        mode: 'admin-personal',
        loading: false,
        error: null,
        canSendMessage: adminStatus.ready || false,
        reason: adminStatus.ready ? undefined : 'Sesión no lista',
      });
    }
  }, [isAdmin, adminStatus, adminConnected]);

  // Sistema: Polling con delay progresivo
  useEffect(() => {
    if (isAdmin) return;

    fetchSystemStatus();

    const interval = setInterval(fetchSystemStatus, retryCount > 0 ? retryDelay : 30000);

    return () => clearInterval(interval);
  }, [isAdmin, fetchSystemStatus, retryCount, retryDelay]);

  const refresh = useCallback(() => {
    if (!isAdmin) {
      fetchSystemStatus();
    }
  }, [isAdmin, fetchSystemStatus]);

  return (
    <WhatsAppUnifiedContext.Provider value={{ ...status, refresh }}>
      {children}
    </WhatsAppUnifiedContext.Provider>
  );
}

export function useWhatsAppUnifiedContext() {
  const context = useContext(WhatsAppUnifiedContext);
  if (!context) {
    throw new Error('useWhatsAppUnifiedContext debe usarse dentro de WhatsAppUnifiedProvider');
  }
  return context;
}
