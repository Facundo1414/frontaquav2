"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { logger } from '@/lib/logger';

const WEBSOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

    logger.log(
      `🔌 useWebSocket montado (conexiones activas: ${connectionCount})`
    );

    // Crear nuevo socket si no existe
    if (!globalSocket) {
      logger.log(
        "🔌 Iniciando nueva conexión WebSocket a:",
        `${WEBSOCKET_URL}/events`
      );

      const socket = io(`${WEBSOCKET_URL}/events`, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10, // Aumentado de 5 a 10
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000, // Aumentado de 10000 a 20000
        autoConnect: true,
        upgrade: true, // Permitir upgrade de polling a websocket
        rememberUpgrade: true, // Recordar el upgrade para futuras conexiones
        forceNew: false, // No forzar nueva conexión si ya existe
      });

      globalSocket = socket;
    }

    // Usar el socket global
    socketRef.current = globalSocket;

    // Setear estado inicial
    if (globalSocket.connected) {
      logger.log(
        `♻️ Reutilizando conexión WebSocket existente (connected: true)`,
        globalSocket.id
      );
      setConnected(true);
    } else {
      logger.log(
        `♻️ Reutilizando conexión WebSocket existente (connected: false, esperando...)`
      );
      setConnected(false);
    }

    // SIEMPRE agregar listeners (incluso si reutilizamos)
    const handleConnect = () => {
      if (!mountedRef.current) return;
      logger.log("✅ WebSocket conectado:", globalSocket?.id);
      setConnected(true);
      setReconnecting(false);
    };

    const handleDisconnect = (reason: string) => {
      if (!mountedRef.current) return;
      logger.warn("⚠️ WebSocket desconectado:", reason);
      setConnected(false);
      if (reason === "io server disconnect") {
        globalSocket?.connect();
      }
    };

    const handleReconnect = (attemptNumber: number) => {
      if (!mountedRef.current) return;
      logger.log(`🔄 WebSocket reconectado (intento ${attemptNumber})`);
      setConnected(true);
      setReconnecting(false);
    };

    const handleReconnectAttempt = (attemptNumber: number) => {
      if (!mountedRef.current) return;
      logger.log(`⏳ Intento de reconexión ${attemptNumber}...`);
      setReconnecting(true);
    };

    const handleReconnectFailed = () => {
      if (!mountedRef.current) return;
      logger.warn("⚠️ WebSocket: Máximo de intentos de reconexión alcanzado");
      logger.log("ℹ️ Los comprobantes se seguirán enviando correctamente en segundo plano");
      setReconnecting(false);
    };

    const handleConnectError = (error: Error) => {
      // Solo loggear en modo desarrollo, no mostrar error al usuario
      if (process.env.NODE_ENV === 'development') {
        logger.warn("⚠️ WebSocket temporal sin conexión:", {
          message: error.message,
          url: `${WEBSOCKET_URL}/events`,
        });
        logger.log("ℹ️ El sistema seguirá funcionando, los datos se actualizarán al finalizar");
      }
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
      logger.log(
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
        logger.log("🔌 Cerrando conexión WebSocket global");
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
