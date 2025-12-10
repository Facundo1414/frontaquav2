"use client";
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { simpleWaState, simpleWaInit } from '@/lib/api/simpleWaApi';
import { toast } from 'sonner';
import { useWhatsappStatus } from '@/hooks/useWhatsappStatus';
import { getAccessToken } from '@/utils/authToken';
import { logger } from '@/lib/logger';

// V2 snapshot: minimal shape reflecting server summary (state machine based)
export interface WhatsappSessionSnapshot {
  state: 'none' | 'launching' | 'waiting_qr' | 'syncing' | 'ready' | 'closing';
  qr: string | null;
  regenerations: number;
  ready: boolean;       // state === 'ready'
  syncing: boolean;     // state === 'syncing'
  updatedAt: number;
}

interface WhatsappSessionContextType {
  snapshot: WhatsappSessionSnapshot | null;
  updateFromStatus: (payload: any) => void; // consumed by hook / SSE events
  markQr: (qr: string | null) => void;
  reconnect: () => Promise<void>; // 🆕 Función para reconectar manualmente
}

const WhatsappSessionContext = createContext<WhatsappSessionContextType | undefined>(undefined);

// Helper para extraer userId del JWT token
function getUserIdFromToken(): string | null {
  try {
    const token = getAccessToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.sub || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export const WhatsappSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snapshot, setSnapshot] = useState<WhatsappSessionSnapshot | null>(null);
  const readyToastShown = useRef(false);
  const hydrated = useRef(false);
  
  // NUEVO: WebSocket
  const userId = getUserIdFromToken();
  
  // Solo habilitar WhatsApp status para Admin
  // El sistema ahora es centralizado: todos usan el mismo worker de WhatsApp
  // Solo el admin necesita ver el estado de la sesión
  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || '';
  const isAdmin = userId === ADMIN_UID;
  const shouldEnableWhatsapp = isAdmin; // Solo admin necesita el WebSocket de WhatsApp
  
  const { status: wsStatus, isSubscribed, connected } = useWhatsappStatus(userId, shouldEnableWhatsapp);
  
  logger.log('📱 WhatsappSessionContext state:', {
    userId,
    ADMIN_UID,
    isAdmin,
    shouldEnableWhatsapp,
    connected,
    isSubscribed,
    hasStatus: !!wsStatus
  });

  // Hydrate from sessionStorage immediately on mount to avoid flicker showing "Inicia sesión"
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const raw = sessionStorage.getItem('whatsapp_v2_snapshot');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.state) {
          setSnapshot(parsed);
          if (parsed.state === 'ready') readyToastShown.current = true; // avoid duplicate toast
        }
      }
    } catch { /* ignore */ }
  }, []);

  // 🆕 Verificar estado real del backend cuando se habilita WhatsApp (admin detectado)
  // TEMPORALMENTE DESHABILITADO
  /*
  useEffect(() => {
    if (!shouldEnableWhatsapp || !userId) return;

    const verifyBackendState = async () => {
      logger.log('🔍 Admin detectado - Verificando estado real en Baileys Worker...');
      
      try {
        const state = await simpleWaState();
        logger.log('📊 Estado en backend:', state);
        
        // Si el sessionStorage dice 'ready' pero el backend dice que no hay sesión
        if (snapshot?.state === 'ready' && !state.ready && !state.authenticated) {
          logger.warn('⚠️ Estado inconsistente detectado: sessionStorage dice "ready" pero backend no tiene sesión');
          logger.log('🧹 Limpiando estado obsoleto del sessionStorage');
          sessionStorage.removeItem('whatsapp_v2_snapshot');
          updateFromStatus({ state: 'none' });
        }
        // Si el backend tiene sesión pero nosotros no lo sabemos
        else if (state.ready && snapshot?.state !== 'ready') {
          logger.log('✅ Sesión activa encontrada en backend, actualizando contexto');
          updateFromStatus({ state: 'ready' });
        }
        // Si está sincronizando
        else if (state.authenticated && !state.ready) {
          logger.log('🔄 Sesión sincronizando en backend');
          updateFromStatus({ state: 'syncing' });
        }
      } catch (error: any) {
        console.error('❌ Error verificando estado del backend:', error);
        // Si hay error 500, probablemente no hay sesión
        if (error?.response?.status === 500) {
          logger.log('🧹 Baileys Worker indica no hay sesión (500), limpiando estado');
          sessionStorage.removeItem('whatsapp_v2_snapshot');
          updateFromStatus({ state: 'none' });
        }
      }
    };

    // Verificar inmediatamente al montar
    verifyBackendState();
  }, [shouldEnableWhatsapp, userId]);
  */

  const updateFromStatus = useCallback((payload: any) => {
    if (!payload) return;
    const state = payload.state || 'none';
    
    setSnapshot(prev => {
      // Evitar actualización si el estado no cambió
      if (prev && prev.state === state && state === 'ready') {
        return prev; // No cambiar para evitar re-renders innecesarios
      }
      
      // 🔧 FIX: PRESERVAR EL QR SI YA EXISTE
      // No sobrescribir con null/undefined si ya tenemos un QR válido
      // Solo actualizar QR si:
      // 1. El payload trae un QR nuevo válido (string no vacío)
      // 2. El estado cambió a algo diferente de 'waiting_qr' (limpiar QR)
      let newQr = prev?.qr ?? null;
      
      logger.log('🔄 updateFromStatus:', {
        payloadState: state,
        hasPayloadQr: 'qr' in payload,
        payloadQrLength: payload.qr?.length || 0,
        prevQrLength: prev?.qr?.length || 0,
        prevState: prev?.state,
      });
      
      if (payload.qr && typeof payload.qr === 'string' && payload.qr.length > 0) {
        // Hay un QR nuevo válido, usarlo
        logger.log('✅ Actualizando con QR nuevo de backend (length:', payload.qr.length, ')');
        newQr = payload.qr;
      } else if (state === 'ready' || state === 'syncing') {
        // 🔧 FIX: Solo limpiar QR cuando ya está autenticado (ready/syncing)
        // NO limpiar cuando state='launching' porque ahí se está generando el QR
        logger.log('🧹 Limpiando QR porque ya está autenticado (estado:', state, ')');
        newQr = null;
      } else {
        // Mantener QR anterior para estados 'waiting_qr' y 'launching'
        logger.log('⏸️ Manteniendo QR anterior para estado:', state, '(prev length:', prev?.qr?.length || 0, ')');
      }
      
      const next: WhatsappSessionSnapshot = {
        state,
        qr: newQr,
        regenerations: payload.regenerations ?? prev?.regenerations ?? 0,
        ready: state === 'ready',
        syncing: state === 'syncing',
        updatedAt: Date.now(),
      };
      
      // Solo guardar en sessionStorage si realmente cambió algo
      const changed = !prev || 
        prev.state !== next.state || 
        prev.qr !== next.qr ||
        prev.ready !== next.ready;
      
      if (changed) {
        try { sessionStorage.setItem('whatsapp_v2_snapshot', JSON.stringify(next)); } catch { /* ignore */ }
      }
      
      // Solo mostrar toast si es la primera vez que llega a 'ready'
      if (state === 'ready' && prev?.state !== 'ready' && !readyToastShown.current) {
        readyToastShown.current = true;
        toast.success('WhatsApp listo.');
      }
      
      return next;
    });
  }, []);

  // Actualizar desde WebSocket
  useEffect(() => {
    if (wsStatus && isSubscribed && connected) {
      logger.log('📱 Usando WebSocket para WhatsApp status:', wsStatus);
      
      // 🔧 FIX: Solo incluir QR en el payload si existe en wsStatus
      // No enviar qr: null si wsStatus no lo incluye, para evitar sobrescribir QR válido
      const payload: any = {
        state: wsStatus.state,
      };
      
      // Solo incluir qr si está presente en wsStatus (incluso si es null explícitamente)
      if ('qr' in wsStatus) {
        payload.qr = wsStatus.qr;
      }
      
      updateFromStatus(payload);
    }
  }, [wsStatus, isSubscribed, connected, updateFromStatus]);

  const markQr = useCallback((qr: string | null) => {
    setSnapshot(prev => prev ? { ...prev, qr, updatedAt: Date.now() } : prev);
  }, []);

  // 🆕 Función de reconexión automática
  const reconnect = useCallback(async () => {
    logger.log('🔄 Intentando reconectar WhatsApp...');
    try {
      const result = await simpleWaInit(true); // ✅ Forzar modo personal
      logger.log('✅ Reconexión iniciada:', result);
      
      // Actualizar estado basado en la respuesta
      if (result.ready) {
        updateFromStatus({ state: 'ready' });
      } else if (result.authenticated) {
        updateFromStatus({ state: 'syncing' });
      } else if (result.hasQR) {
        updateFromStatus({ state: 'waiting_qr', qr: result.qr });
      } else {
        updateFromStatus({ state: 'launching' });
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      
      // Error 500: No hay sesión o baileys worker no disponible
      if (status === 500) {
        logger.log('📦 No hay sesión de WhatsApp guardada - Usuario debe escanear QR');
        // Estado limpio, esperando que el usuario inicie sesión
        updateFromStatus({ state: 'none' });
        return;
      }
      
      // Error 429: Rate limiting
      if (status === 429) {
        logger.warn('⚠️ Rate limit alcanzado - reduciendo frecuencia de polling');
        return;
      }
      
      console.error('❌ Error al reconectar WhatsApp:', message);
      // No mostrar toast de error para no molestar al usuario
    }
  }, [updateFromStatus]);

  // ✅ OPTIMIZACIÓN: NO auto-reconectar al montar
  // Solo verificar estado si ya hay una sesión activa
  useEffect(() => {
    // Skip completamente si no es admin
    if (!shouldEnableWhatsapp) {
      logger.log('⏭️ WhatsApp auto-reconnect: Deshabilitado (usuario no es admin)');
      return;
    }

    // Solo verificar cada 10 segundos SI ya hay una sesión activa
    const intervalId = setInterval(() => {
      if (snapshot?.state !== 'none' && snapshot?.state !== 'waiting_qr') {
        logger.log('🔍 Verificando estado de sesión activa...');
        simpleWaState()
          .then((state) => {
            if (state.ready && !snapshot?.ready) {
              logger.log('✅ Sesión activa detectada');
              updateFromStatus({ state: 'ready' });
            } else if (state.authenticated && !state.ready) {
              logger.log('🔄 Sesión sincronizando');
              updateFromStatus({ state: 'syncing' });
            }
          })
          .catch(() => {
            // Ignorar errores silenciosamente
          });
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [shouldEnableWhatsapp, snapshot?.state, snapshot?.ready, updateFromStatus]);

  return (
    <WhatsappSessionContext.Provider value={{ snapshot, updateFromStatus, markQr, reconnect }}>
      {children}
    </WhatsappSessionContext.Provider>
  );
};

export const useWhatsappSessionContext = () => {
  const ctx = useContext(WhatsappSessionContext);
  if (!ctx) throw new Error('useWhatsappSessionContext debe usarse dentro de WhatsappSessionProvider');
  return ctx;
};
