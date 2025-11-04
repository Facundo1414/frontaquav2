import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface PyseProgress {
  userId: string;
  processed: number;
  total: number;
  percentage: number;
}

interface PyseCompleted {
  userId: string;
  totalProcessed: number;
  aptos: number;
  noAptos: number;
}

interface PdfCompleted {
  userId: string;
  totalProcessed: number;
  successful: number;
  failed: number;
}

interface PyseError {
  userId: string;
  error: string;
}

interface UseProgressWebSocketOptions {
  eventType?: "pyse" | "pdf"; // Tipo de evento a escuchar
  userId?: string; // Filtrar eventos por userId
}

export function useProgressWebSocket(
  options: UseProgressWebSocketOptions = {}
) {
  const { eventType = "pyse", userId } = options;
  const [progress, setProgress] = useState<PyseProgress | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Conectar al WebSocket del worker
    const socket = io("http://localhost:3004/progress", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ WebSocket conectado al worker (tipo:", eventType, ")");
    });

    socket.on("disconnect", () => {
      console.log("🔌 WebSocket desconectado");
    });

    // Escuchar eventos según el tipo
    if (eventType === "pyse") {
      socket.on("pyse-progress", (data: PyseProgress) => {
        // Filtrar por userId si se proporciona
        if (userId && data.userId !== userId) return;

        console.log(
          `📊 Progreso PYSE: ${data.processed}/${data.total} (${data.percentage}%)`
        );
        setProgress(data);
        setIsCompleted(false);
        setError(null);
      });

      socket.on("pyse-completed", (data: PyseCompleted) => {
        if (userId && data.userId !== userId) return;

        console.log(
          `✅ PYSE Completado: ${data.aptos} aptos, ${data.noAptos} no aptos`
        );
        setIsCompleted(true);
        setProgress({
          userId: data.userId,
          processed: data.totalProcessed,
          total: data.totalProcessed,
          percentage: 100,
        });
      });

      socket.on("pyse-error", (data: PyseError) => {
        if (userId && data.userId !== userId) return;

        console.error(`❌ Error PYSE: ${data.error}`);
        setError(data.error);
        setIsCompleted(false);
      });
    } else if (eventType === "pdf") {
      socket.on("pdf-progress", (data: PyseProgress) => {
        if (userId && data.userId !== userId) return;

        console.log(
          `📊 Progreso PDF: ${data.processed}/${data.total} (${data.percentage}%)`
        );
        setProgress(data);
        setIsCompleted(false);
        setError(null);
      });

      socket.on("pdf-completed", (data: PdfCompleted) => {
        if (userId && data.userId !== userId) return;

        console.log(
          `✅ PDF Completado: ${data.successful} exitosos, ${data.failed} fallidos`
        );
        setIsCompleted(true);
        setProgress({
          userId: data.userId,
          processed: data.totalProcessed,
          total: data.totalProcessed,
          percentage: 100,
        });
      });

      socket.on("pdf-error", (data: PyseError) => {
        if (userId && data.userId !== userId) return;

        console.error(`❌ Error PDF: ${data.error}`);
        setError(data.error);
        setIsCompleted(false);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [eventType, userId]);

  const resetProgress = () => {
    setProgress(null);
    setIsCompleted(false);
    setError(null);
  };

  return {
    progress,
    isCompleted,
    error,
    resetProgress,
  };
}
