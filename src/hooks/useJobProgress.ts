"use client";

import { useEffect, useState, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";

export interface JobProgress {
  jobId: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  message?: string;
  currentAction?: string;
  resultado?: any;
  errores?: string[];
}

export function useJobProgress(jobId: string | null) {
  const { socket, connected } = useWebSocket();
  const [progress, setProgress] = useState<JobProgress | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!socket || !connected || !jobId) {
      console.log("⏸️ No se puede suscribir aún:", {
        hasSocket: !!socket,
        connected,
        hasJobId: !!jobId,
      });
      setIsSubscribed(false);
      return;
    }

    console.log(`📊 Suscribiendo a job: ${jobId}`);

    // Listeners de eventos
    const handleProgress = (data: JobProgress) => {
      console.log("📊 Job progress recibido:", data);
      setProgress(data);
    };

    const handleCompleted = (data: any) => {
      console.log("✅ Job completado:", data);
      setProgress({
        jobId,
        status: "completed",
        progress: 100,
        message: "Completado",
        resultado: data,
      });
    };

    const handleError = (data: any) => {
      console.error("❌ Job error:", data);
      setProgress({
        jobId,
        status: "error",
        progress: 0,
        message: data.message || "Error en el procesamiento",
        errores: data.errores || [data.message],
      });
    };

    socket.on("job:progress", handleProgress);
    socket.on("job:completed", handleCompleted);
    socket.on("job:error", handleError);

    // Emitir suscripción
    socket.emit("job:subscribe", { jobId });

    // Marcar como suscrito inmediatamente (no esperamos ack)
    setIsSubscribed(true);

    // Cleanup
    return () => {
      console.log(`📊 Dessuscribiendo de job: ${jobId}`);
      socket.emit("job:unsubscribe", { jobId });
      socket.off("job:progress", handleProgress);
      socket.off("job:completed", handleCompleted);
      socket.off("job:error", handleError);
      setIsSubscribed(false);
    };
  }, [socket, connected, jobId]);

  return {
    progress,
    isSubscribed,
    connected,
  };
}
