"use client";
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { simpleWaState } from '@/lib/api/simpleWaApi';
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
  
  // 🔥 NUEVO: WebSocket
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
      const next: WhatsappSessionSnapshot = {
        state,
        qr: payload.qr ?? prev?.qr ?? null,
        regenerations: payload.regenerations ?? prev?.regenerations ?? 0,
        ready: state === 'ready',
        syncing: state === 'syncing',
        updatedAt: Date.now(),
      };
      try { sessionStorage.setItem('whatsapp_v2_snapshot', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    if (state === 'ready' && !readyToastShown.current) {
      readyToastShown.current = true;
      toast.success('WhatsApp listo.');
    }
  }, []);

  // 🔥 Actualizar desde WebSocket
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

  return (
    <WhatsappSessionContext.Provider value={{ snapshot, updateFromStatus, markQr }}>
      {children}
    </WhatsappSessionContext.Provider>
  );
};

export const useWhatsappSessionContext = () => {
  const ctx = useContext(WhatsappSessionContext);
  if (!ctx) throw new Error('useWhatsappSessionContext debe usarse dentro de WhatsappSessionProvider');
  return ctx;
};
