"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const WEBSOCKET_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

// Singleton para evitar múltiples conexiones
let globalSocket: Socket | null = null;
let connectionCount = 0;

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    connectionCount++;

    console.log(
      `🔌 useWebSocket montado (conexiones activas: ${connectionCount})`
    );

    // Crear nuevo socket si no existe
    if (!globalSocket) {
      console.log(
        "🔌 Iniciando nueva conexión WebSocket a:",
        `${WEBSOCKET_URL}/events`
      );

      const socket = io(`${WEBSOCKET_URL}/events`, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        autoConnect: true,
      });

      globalSocket = socket;
    }

    // Usar el socket global
    socketRef.current = globalSocket;

    // Setear estado inicial
    if (globalSocket.connected) {
      console.log(
        `♻️ Reutilizando conexión WebSocket existente (connected: true)`,
        globalSocket.id
      );
      setConnected(true);
    } else {
      console.log(
        `♻️ Reutilizando conexión WebSocket existente (connected: false, esperando...)`
      );
      setConnected(false);
    }

    // SIEMPRE agregar listeners (incluso si reutilizamos)
    const handleConnect = () => {
      if (!mountedRef.current) return;
      console.log("✅ WebSocket conectado:", globalSocket?.id);
      setConnected(true);
      setReconnecting(false);
    };

    const handleDisconnect = (reason: string) => {
      if (!mountedRef.current) return;
      console.warn("⚠️ WebSocket desconectado:", reason);
      setConnected(false);
      if (reason === "io server disconnect") {
        globalSocket?.connect();
      }
    };

    const handleReconnect = (attemptNumber: number) => {
      if (!mountedRef.current) return;
      console.log(`🔄 WebSocket reconectado (intento ${attemptNumber})`);
      setConnected(true);
      setReconnecting(false);
    };

    const handleReconnectAttempt = (attemptNumber: number) => {
      if (!mountedRef.current) return;
      console.log(`⏳ Intento de reconexión ${attemptNumber}...`);
      setReconnecting(true);
    };

    const handleReconnectFailed = () => {
      if (!mountedRef.current) return;
      console.error("❌ WebSocket falló en reconectar después de 5 intentos");
      setReconnecting(false);
    };

    const handleConnectError = (error: Error) => {
      console.error("❌ Error de conexión WebSocket:", error.message);
    };

    globalSocket.on("connect", handleConnect);
    globalSocket.on("disconnect", handleDisconnect);
    globalSocket.on("reconnect", handleReconnect);
    globalSocket.on("reconnect_attempt", handleReconnectAttempt);
    globalSocket.on("reconnect_failed", handleReconnectFailed);
    globalSocket.on("connect_error", handleConnectError);

    return () => {
      mountedRef.current = false;
      connectionCount--;
      console.log(
        `🔌 useWebSocket desmontado (conexiones activas: ${connectionCount})`
      );

      // Limpiar listeners
      globalSocket?.off("connect", handleConnect);
      globalSocket?.off("disconnect", handleDisconnect);
      globalSocket?.off("reconnect", handleReconnect);
      globalSocket?.off("reconnect_attempt", handleReconnectAttempt);
      globalSocket?.off("reconnect_failed", handleReconnectFailed);
      globalSocket?.off("connect_error", handleConnectError);

      // Solo cerrar la conexión si no hay más componentes usándola
      if (connectionCount === 0 && globalSocket) {
        console.log("🔌 Cerrando conexión WebSocket global");
        globalSocket.close();
        globalSocket = null;
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    connected,
    reconnecting,
  };
}
