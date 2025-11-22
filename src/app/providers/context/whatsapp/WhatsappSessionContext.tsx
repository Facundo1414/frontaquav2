"use client";
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { simpleWaState, simpleWaInit } from '@/lib/api/simpleWaApi';
import { toast } from 'sonner';
import { useWhatsappStatus } from '@/hooks/useWhatsappStatus';
import { getAccessToken } from '@/utils/authToken';

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
  
  console.log('📱 WhatsappSessionContext state:', {
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
  useEffect(() => {
    if (!shouldEnableWhatsapp || !userId) return;

    const verifyBackendState = async () => {
      console.log('🔍 Admin detectado - Verificando estado real en Baileys Worker...');
      
      try {
        const state = await simpleWaState();
        console.log('📊 Estado en backend:', state);
        
        // Si el sessionStorage dice 'ready' pero el backend dice que no hay sesión
        if (snapshot?.state === 'ready' && !state.ready && !state.authenticated) {
          console.warn('⚠️ Estado inconsistente detectado: sessionStorage dice "ready" pero backend no tiene sesión');
          console.log('🧹 Limpiando estado obsoleto del sessionStorage');
          sessionStorage.removeItem('whatsapp_v2_snapshot');
          updateFromStatus({ state: 'none' });
        }
        // Si el backend tiene sesión pero nosotros no lo sabemos
        else if (state.ready && snapshot?.state !== 'ready') {
          console.log('✅ Sesión activa encontrada en backend, actualizando contexto');
          updateFromStatus({ state: 'ready' });
        }
        // Si está sincronizando
        else if (state.authenticated && !state.ready) {
          console.log('🔄 Sesión sincronizando en backend');
          updateFromStatus({ state: 'syncing' });
        }
      } catch (error: any) {
        console.error('❌ Error verificando estado del backend:', error);
        // Si hay error 500, probablemente no hay sesión
        if (error?.response?.status === 500) {
          console.log('🧹 Baileys Worker indica no hay sesión (500), limpiando estado');
          sessionStorage.removeItem('whatsapp_v2_snapshot');
          updateFromStatus({ state: 'none' });
        }
      }
    };

    // Verificar inmediatamente al montar
    verifyBackendState();
  }, [shouldEnableWhatsapp, userId]);

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
      
      console.log('🔄 updateFromStatus:', {
        payloadState: state,
        hasPayloadQr: 'qr' in payload,
        payloadQrLength: payload.qr?.length || 0,
        prevQrLength: prev?.qr?.length || 0,
        prevState: prev?.state,
      });
      
      if (payload.qr && typeof payload.qr === 'string' && payload.qr.length > 0) {
        // Hay un QR nuevo válido, usarlo
        console.log('✅ Actualizando con QR nuevo de backend (length:', payload.qr.length, ')');
        newQr = payload.qr;
      } else if (state === 'ready' || state === 'syncing') {
        // 🔧 FIX: Solo limpiar QR cuando ya está autenticado (ready/syncing)
        // NO limpiar cuando state='launching' porque ahí se está generando el QR
        console.log('🧹 Limpiando QR porque ya está autenticado (estado:', state, ')');
        newQr = null;
      } else {
        // Mantener QR anterior para estados 'waiting_qr' y 'launching'
        console.log('⏸️ Manteniendo QR anterior para estado:', state, '(prev length:', prev?.qr?.length || 0, ')');
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
      console.log('📱 Usando WebSocket para WhatsApp status:', wsStatus);
      
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
    console.log('🔄 Intentando reconectar WhatsApp...');
    try {
      const result = await simpleWaInit();
      console.log('✅ Reconexión iniciada:', result);
      
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
        console.log('📦 No hay sesión de WhatsApp guardada - Usuario debe escanear QR');
        // Estado limpio, esperando que el usuario inicie sesión
        updateFromStatus({ state: 'none' });
        return;
      }
      
      // Error 429: Rate limiting
      if (status === 429) {
        console.warn('⚠️ Rate limit alcanzado - reduciendo frecuencia de polling');
        return;
      }
      
      console.error('❌ Error al reconectar WhatsApp:', message);
      // No mostrar toast de error para no molestar al usuario
    }
  }, [updateFromStatus]);

  // 🆕 Auto-reconectar si no hay sesión activa al montar componentes que necesitan WA
  // Verificamos periódicamente si hay sesión guardada pero no está conectada
  // SOLO para Admin - Usuarios PRO/BASE no necesitan esto
  useEffect(() => {
    // Skip completamente si no es admin
    if (!shouldEnableWhatsapp) {
      console.log('⏭️ WhatsApp auto-reconnect: Deshabilitado (usuario no es admin)');
      return;
    }

    const checkAndReconnect = async () => {
      // Solo intentar si:
      // 1. Hay userId (usuario autenticado)
      // 2. No hay snapshot o el estado es 'none'
      // 3. No estamos ya conectados vía WebSocket
      if (!userId) return;
      
      // 🔧 FIX: NO VERIFICAR SI ESTAMOS ESPERANDO QR
      // Esto evita que el polling sobrescriba el estado mientras el usuario escanea
      if (snapshot?.state === 'waiting_qr') {
        console.log('⏸️ Pausando verificación - usuario escaneando QR');
        return;
      }
      
      console.log('🔍 Verificando estado de WhatsApp...');
      
      try {
        // Verificar si hay sesión en el backend
        const state = await simpleWaState();
        console.log('📊 Estado actual:', state);
        
        // Si el backend dice que está ready pero nosotros no lo sabemos
        if (state.ready && !snapshot?.ready) {
          console.log('✅ Sesión activa detectada, actualizando contexto');
          updateFromStatus({ state: 'ready' });
        }
        // Si está autenticado pero sincronizando
        else if (state.authenticated && !state.ready) {
          console.log('🔄 Sesión sincronizando');
          updateFromStatus({ state: 'syncing' });
        }
        // Si no hay sesión Y no estamos en ningún proceso, intentar reconectar
        else if (!state.ready && !state.authenticated && !snapshot?.state) {
          console.log('🔌 No hay sesión activa, intentando reconectar...');
          await reconnect();
        }
      } catch (error: any) {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || error?.message;
        
        // Error 500: Baileys worker no disponible o no hay sesión
        if (status === 500) {
          console.log('📦 Baileys worker no disponible o sin sesión - WhatsApp deshabilitado');
          updateFromStatus({ state: 'none' });
          return;
        }
        
        // Error 429: Rate limiting - dejar de hacer polling temporalmente
        if (status === 429) {
          console.warn('⚠️ Rate limit alcanzado en checkAndReconnect');
          // El interval se encargará de reintentar después
          return;
        }
        
        // Error de red
        if (error?.code === 'ERR_NETWORK') {
          console.warn('⚠️ Error de red - Baileys worker no accesible');
          return;
        }
        
        console.error('❌ Error verificando estado WhatsApp:', message);
      }
    };
    
    // Verificar inmediatamente al montar SOLO si no estamos waiting_qr
    if (snapshot?.state !== 'waiting_qr') {
      checkAndReconnect();
    }
    
    // Verificar cada 30 segundos (aumentado para evitar rate limiting) si no estamos ready ni waiting_qr
    const interval = setInterval(() => {
      if (!snapshot?.ready && snapshot?.state !== 'waiting_qr') {
        checkAndReconnect();
      }
    }, 30000); // 30 segundos
    
    return () => clearInterval(interval);
  }, [userId, snapshot?.ready, snapshot?.state, reconnect, updateFromStatus, shouldEnableWhatsapp]);

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
