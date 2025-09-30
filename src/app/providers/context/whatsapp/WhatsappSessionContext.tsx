"use client";
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { simpleWaState } from '@/lib/api/simpleWaApi';
import { toast } from 'sonner';

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

export const WhatsappSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snapshot, setSnapshot] = useState<WhatsappSessionSnapshot | null>(null);
  const readyToastShown = useRef(false);
  const hydrated = useRef(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

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

  // Lightweight polling so all consumers (Navbar/Home) see the same up-to-date state
  useEffect(() => {
    const intervalMs = 3500;
    const run = async () => {
      try {
        const st = await simpleWaState();
        const mappedState: WhatsappSessionSnapshot['state'] = st.ready
          ? 'ready'
          : (st.authenticated
              ? 'syncing'
              : (st.hasQR ? 'waiting_qr' : 'launching'));
        updateFromStatus({ state: mappedState, qr: st.qr || null });
      } catch {
        // ignore transient errors
      }
    };
    // Kick once immediately to hydrate
    run();
    pollRef.current = setInterval(run, intervalMs);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [updateFromStatus]);

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
