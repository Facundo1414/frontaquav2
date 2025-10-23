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

interface PyseError {
  userId: string;
  error: string;
}

export function useProgressWebSocket() {
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
      console.log("✅ WebSocket conectado al worker");
    });

    socket.on("disconnect", () => {
      console.log("🔌 WebSocket desconectado");
    });

    socket.on("pyse-progress", (data: PyseProgress) => {
      console.log(
        `📊 Progreso PYSE: ${data.processed}/${data.total} (${data.percentage}%)`
      );
      setProgress(data);
      setIsCompleted(false);
      setError(null);
    });

    socket.on("pyse-completed", (data: PyseCompleted) => {
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
      console.error(`❌ Error PYSE: ${data.error}`);
      setError(data.error);
      setIsCompleted(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
