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

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useGlobalContext } from './GlobalContext';
import { useWhatsappStatus } from '@/hooks/useWhatsappStatus';
import api from '@/lib/api/axiosInstance';
import { logger } from '@/lib/logger';

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
  refreshStatus: () => Promise<void>;
}

const WhatsAppUnifiedContext = createContext<WhatsAppUnifiedContextValue | null>(null);

export function WhatsAppUnifiedProvider({ children }: { children: ReactNode }) {
  const { userId } = useGlobalContext();
  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || '';
  const isAdmin = userId === ADMIN_UID;

  // Log para debug - solo en dev
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.log('🚀 WhatsAppUnifiedProvider montado - userId:', userId, 'isAdmin:', isAdmin);
    }
  }, [userId, isAdmin]);

  // Estados - inicializar según tipo de usuario
  const [status, setStatus] = useState<UnifiedWhatsAppStatus>(() => {
    // Usuarios normales: no necesitan estado del sistema WhatsApp
    if (!isAdmin) {
      return {
        connected: true, // Asumimos que pueden usar su propio WhatsApp personal
        ready: true,
        authenticated: false,
        mode: 'system',
        loading: false, // No cargar, no necesitan polling
        error: null,
        canSendMessage: true, // Pueden enviar si tienen su sesión personal
      };
    }
    // Admins: necesitan cargar estado del sistema
    return {
      connected: false,
      ready: false,
      authenticated: false,
      mode: 'system',
      loading: true,
      error: null,
      canSendMessage: false,
    };
  });

  // Retry con exponential backoff
  const [retryCount, setRetryCount] = useState(0);
  const [retryDelay, setRetryDelay] = useState(180000); // Empezar con 3min para evitar rate limit
  const MAX_RETRIES = 5;
  const BASE_POLLING_INTERVAL = 180000; // 3 minutos base (0.33 req/min = 20 req/hr, reduce 429 errors)

  // Admin: WebSocket en tiempo real
  const {
    status: adminStatus,
    isSubscribed: adminSubscribed,
    connected: adminConnected,
  } = useWhatsappStatus(userId, isAdmin);

  // Sistema Centralizado: Polling HTTP con retry
  const fetchSystemStatus = useCallback(async () => {
    try {
      // Enviar userId para obtener estadísticas por usuario
      const response = await api.get('/wa/state', {
        params: { userId }
      });

      if (response.data?.data) {
        const data = response.data.data;

        const maxPerDay = parseInt(process.env.NEXT_PUBLIC_MAX_MESSAGES_PER_DAY || '300');
        const workStart = parseInt(process.env.NEXT_PUBLIC_WORKING_HOURS_START || '8');
        const workEnd = parseInt(process.env.NEXT_PUBLIC_WORKING_HOURS_END || '16');

        const currentHour = new Date().getHours();
        const isWorkingHours = currentHour >= workStart && currentHour < workEnd;
        
        // ⚙️ Verificar si la restricción de horario está habilitada en el backend
        const workingHoursEnabled = data.workingHoursEnabled ?? false;

        const messagesToday = data.stats?.messagesToday || 0;
        const messagesRemaining = maxPerDay - messagesToday;

        let canSendMessage = true;
        let reason: string | undefined;

        if (!data.ready) {
          canSendMessage = false;
          reason = 'Sistema WhatsApp no conectado';
        } else if (workingHoursEnabled && !isWorkingHours) {
          // Solo bloquear si la restricción está HABILITADA
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
        setRetryDelay(BASE_POLLING_INTERVAL);
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
      // Para 429: esperar más tiempo (2-5 minutos dependiendo del retry)
      // Para otros errores: exponential backoff normal
      const baseDelay = is429 ? 120000 : Math.min(retryDelay * 2, 32000);
      const nextDelay = is429 ? Math.min(baseDelay * nextRetry, 300000) : baseDelay; // Max 5 min para 429

      logger.warn(
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
      logger.log('👤 Admin mode: usando WebSocket status', adminStatus);

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
  const fetchRef = useRef(fetchSystemStatus);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Actualizar ref cuando cambia la función
  useEffect(() => {
    fetchRef.current = fetchSystemStatus;
  }, [fetchSystemStatus]);

  useEffect(() => {
    // 🔥 CRITICAL: Solo hacer polling para admins (sistema WhatsApp)
    // Los usuarios normales NO necesitan saber el estado del sistema
    if (!isAdmin) return;

    // � NO hacer polling automático - solo bajo demanda
    // El polling solo debe activarse cuando:
    // 1. El usuario está en la página de WhatsApp (/home con modal abierto)
    // 2. O cuando hay una operación activa que necesita verificar estado
    
    // El fetchSystemStatus se llamará solo cuando:
    // - useWhatsAppUnified().refreshStatus() sea llamado explícitamente
    // - Un componente necesite verificar el estado manualmente
    
    logger.log('📵 Polling automático deshabilitado - solo consultas bajo demanda');

    // 🔥 CRITICAL: Limpiar cualquier intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAdmin]);

  // Método manual para refrescar estado cuando sea necesario
  const refreshStatus = useCallback(async () => {
    if (isAdmin) {
      await fetchSystemStatus();
    }
  }, [isAdmin, fetchSystemStatus]);

  const refresh = useCallback(() => {
    if (isAdmin) {
      fetchSystemStatus();
    }
  }, [isAdmin, fetchSystemStatus]);

  return (
    <WhatsAppUnifiedContext.Provider value={{ ...status, refresh, refreshStatus }}>
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
