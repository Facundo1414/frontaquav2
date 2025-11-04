// 🔌 Hook para tracking de progreso en tiempo real via WebSocket

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useGlobalContext } from "@/app/providers/context/GlobalContext";

export interface ProgressPhase {
  name: string;
  label: string;
  status: "pending" | "in-progress" | "completed" | "error";
  progress: number;
  stats: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
  };
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface JobProgress {
  jobId: string;
  userId: string;
  type: "upload" | "verify" | "send" | "download";
  phases: ProgressPhase[];
  currentPhase: string;
  overallProgress: number;
  estimatedTimeRemaining?: number;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  metadata?: any;
}

interface UseProgressTrackingOptions {
  jobId: string | null;
  enabled?: boolean;
  onProgress?: (progress: JobProgress) => void;
  onCompleted?: (result: any) => void;
  onError?: (error: any) => void;
}

export function useProgressTracking({
  jobId,
  enabled = true,
  onProgress,
  onCompleted,
  onError,
}: UseProgressTrackingOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [progress, setProgress] = useState<JobProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useGlobalContext();
  const token = getToken();

  // Refs para callbacks
  const onProgressRef = useRef(onProgress);
  const onCompletedRef = useRef(onCompleted);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onProgressRef.current = onProgress;
    onCompletedRef.current = onCompleted;
    onErrorRef.current = onError;
  }, [onProgress, onCompleted, onError]);

  // Conectar al WebSocket
  useEffect(() => {
    if (!enabled || !token) return;

    const BACKEND_URL =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

    const newSocket = io(`${BACKEND_URL}/events`, {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("✅ WebSocket conectado");
      setConnected(true);
      setError(null);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ WebSocket desconectado:", reason);
      setConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Error de conexión WebSocket:", err);
      setConnected(false);
      setError("Error de conexión");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [enabled, token]);

  // Suscribirse a un job específico
  useEffect(() => {
    if (!socket || !jobId || !connected) return;

    console.log(`📊 Suscribiendo a job: ${jobId}`);

    socket.emit("job:subscribe", { jobId }, (response: any) => {
      if (response?.success) {
        console.log(`✅ Suscrito a job ${jobId}`);
      }
    });

    // Escuchar eventos de progreso
    const handleProgress = (data: JobProgress) => {
      console.log(`📊 Progreso recibido:`, data);
      setProgress(data);
      onProgressRef.current?.(data);
    };

    const handleCompleted = (data: any) => {
      console.log(`✅ Job completado:`, data);
      setProgress(data);
      onCompletedRef.current?.(data);
    };

    const handleError = (data: any) => {
      console.error(`❌ Job error:`, data);
      setError(data.error || "Error desconocido");
      onErrorRef.current?.(data);
    };

    socket.on("job:progress", handleProgress);
    socket.on("job:completed", handleCompleted);
    socket.on("job:error", handleError);

    return () => {
      socket.off("job:progress", handleProgress);
      socket.off("job:completed", handleCompleted);
      socket.off("job:error", handleError);

      socket.emit("job:unsubscribe", { jobId });
      console.log(`📊 Dessuscrito de job ${jobId}`);
    };
  }, [socket, jobId, connected]);

  // Función para obtener fase actual
  const getCurrentPhase = useCallback((): ProgressPhase | null => {
    if (!progress) return null;
    return (
      progress.phases.find((p) => p.name === progress.currentPhase) || null
    );
  }, [progress]);

  // Función para obtener stats de fase actual
  const getCurrentStats = useCallback(() => {
    const phase = getCurrentPhase();
    if (!phase) return null;
    return phase.stats;
  }, [getCurrentPhase]);

  // Función para formatear tiempo estimado
  const getFormattedTimeRemaining = useCallback((): string | null => {
    if (!progress?.estimatedTimeRemaining) return null;

    const ms = progress.estimatedTimeRemaining;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }, [progress]);

  return {
    connected,
    progress,
    error,
    isTracking: !!jobId && connected,
    currentPhase: getCurrentPhase(),
    currentStats: getCurrentStats(),
    timeRemaining: getFormattedTimeRemaining(),
    overallProgress: progress?.overallProgress || 0,
  };
}

// Hook simplificado para un solo paso
export function useStepProgress(jobId: string | null, stepName: string) {
  const { progress, ...rest } = useProgressTracking({ jobId });

  const stepProgress = progress?.phases.find((p) => p.name === stepName);

  return {
    ...rest,
    stepProgress,
    stepStatus: stepProgress?.status || "pending",
    stepPercent: stepProgress?.progress || 0,
    stepStats: stepProgress?.stats || {
      total: 0,
      completed: 0,
      failed: 0,
      pending: 0,
    },
  };
}
