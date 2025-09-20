import { useCallback, useEffect, useRef, useState } from "react";
import { simpleWaInit, simpleWaQR, simpleWaState } from "@/lib/api/simpleWaApi";

interface UseSimpleWaSessionOptions {
  auto?: boolean;
  pollIntervalMs?: number; // for QR & ready detection
}

interface SimpleWaSessionState {
  status: "idle" | "initializing" | "qr" | "ready";
  qr: string | null;
  initializing: boolean;
  ready: boolean;
  error: string | null;
  start: () => Promise<void>;
  logoutPlaceholder?: () => Promise<void>; // future extension
}

export function useSimpleWaSession({
  auto = false,
  pollIntervalMs = 3500,
}: UseSimpleWaSessionOptions = {}): SimpleWaSessionState {
  const [status, setStatus] = useState<
    "idle" | "initializing" | "qr" | "ready"
  >("idle");
  const [qr, setQr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const startedRef = useRef(false);

  const clearPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const poll = useCallback(() => {
    clearPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const st = await simpleWaState();
        if (st.ready) {
          setStatus("ready");
          setQr(null);
          clearPolling();
          return;
        }
        const { qr: current } = await simpleWaQR();
        if (current) {
          setQr(current);
          setStatus("qr");
        }
      } catch (e: any) {
        setError(e.message || "Error polling");
      }
    }, pollIntervalMs);
  }, [pollIntervalMs]);

  const start = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setError(null);
    setStatus("initializing");
    try {
      const init = await simpleWaInit();
      if (init.ready) {
        setStatus("ready");
        return;
      }
      if (init.hasQR) {
        const q = await simpleWaQR();
        setQr(q.qr || null);
        setStatus(q.qr ? "qr" : "initializing");
      } else {
        // wait for first QR via polling
        setStatus("initializing");
      }
      poll();
    } catch (e: any) {
      setError(e.message || "Error iniciando");
      setStatus("idle");
      startedRef.current = false; // allow retry
    }
  }, [poll]);

  useEffect(() => {
    if (auto) start();
    return () => clearPolling();
  }, [auto, start]);

  return {
    status,
    qr,
    initializing: status === "initializing",
    ready: status === "ready",
    error,
    start,
  };
}
