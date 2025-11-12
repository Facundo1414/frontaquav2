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
  const { status: wsStatus, isSubscribed, connected } = useWhatsappStatus(userId);
  
  console.log('📱 WhatsappSessionContext state:', {
    userId: !!userId,
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

  const updateFromStatus = useCallback((payload: any) => {
    if (!payload) return;
    const state = payload.state || 'none';
    
    setSnapshot(prev => {
      // Evitar actualización si el estado no cambió
      if (prev && prev.state === state && state === 'ready') {
        return prev; // No cambiar para evitar re-renders innecesarios
      }
      
      const next: WhatsappSessionSnapshot = {
        state,
        qr: payload.qr ?? prev?.qr ?? null,
        regenerations: payload.regenerations ?? prev?.regenerations ?? 0,
        ready: state === 'ready',
        syncing: state === 'syncing',
        updatedAt: Date.now(),
      };
      try { sessionStorage.setItem('whatsapp_v2_snapshot', JSON.stringify(next)); } catch { /* ignore */ }
      
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
      updateFromStatus({
        state: wsStatus.state,
        qr: wsStatus.qr || null,
      });
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
    } catch (error) {
      console.error('❌ Error al reconectar WhatsApp:', error);
      // No mostrar toast de error para no molestar al usuario
    }
  }, [updateFromStatus]);

  // 🆕 Auto-reconectar si no hay sesión activa al montar componentes que necesitan WA
  // Verificamos periódicamente si hay sesión guardada pero no está conectada
  useEffect(() => {
    const checkAndReconnect = async () => {
      // Solo intentar si:
      // 1. Hay userId (usuario autenticado)
      // 2. No hay snapshot o el estado es 'none'
      // 3. No estamos ya conectados vía WebSocket
      if (!userId) return;
      
      // Si ya tenemos sesión ready, no hacer nada
      if (snapshot?.ready) return;
      
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
        // Si no hay sesión, intentar reconectar automáticamente
        else if (!state.ready && !state.authenticated && !snapshot?.state) {
          console.log('🔌 No hay sesión activa, intentando reconectar...');
          await reconnect();
        }
      } catch (error) {
        console.error('❌ Error verificando estado:', error);
      }
    };
    
    // Verificar inmediatamente al montar
    checkAndReconnect();
    
    // Verificar cada 10 segundos si no estamos ready
    const interval = setInterval(() => {
      if (!snapshot?.ready) {
        checkAndReconnect();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [userId, snapshot?.ready, snapshot?.state, reconnect, updateFromStatus]);

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
