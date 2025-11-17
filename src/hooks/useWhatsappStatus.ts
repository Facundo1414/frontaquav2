"use client";

import { useEffect, useState, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";

export interface WhatsappStatus {
  userId: string;
  state: "launching" | "waiting_qr" | "syncing" | "ready";
  qr?: string | null;
  ready?: boolean;
  authenticated?: boolean;
}

export function useWhatsappStatus(userId: string | null, enabled = true) {
  const { socket, connected } = useWebSocket();
  const [status, setStatus] = useState<WhatsappStatus | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Skip si está deshabilitado (usuarios BASE no necesitan WhatsApp)
    if (!enabled) {
      console.log(
        "📱 useWhatsappStatus: Deshabilitado (usuario no necesita WhatsApp)"
      );
      return;
    }

    if (!socket || !connected || !userId) {
      console.log("📱 useWhatsappStatus: Esperando conexión...", {
        socket: !!socket,
        connected,
        userId: !!userId,
      });
      return;
    }

    console.log(`📱 Suscribiendo a WhatsApp status: ${userId}`);

    // Listener de eventos
    const handleStatus = (data: WhatsappStatus) => {
      console.log("📱 WhatsApp status recibido:", data);
      setStatus(data);
    };

    socket.on("whatsapp:status", handleStatus);

    // Emitir suscripción
    socket.emit("whatsapp:subscribe", { userId }, (response: any) => {
      console.log("📱 Respuesta de suscripción:", response);
      setIsSubscribed(true);
    });

    // Si no hay respuesta en 3s, asumir que está suscrito de todas formas
    const timeoutId = setTimeout(() => {
      if (!isSubscribed) {
        console.warn(
          "📱 No hubo respuesta del backend, asumiendo suscripción exitosa"
        );
        setIsSubscribed(true);
      }
    }, 3000);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      socket.off("whatsapp:status", handleStatus);
      setIsSubscribed(false);
    };
  }, [socket, connected, userId]);

  return {
    status,
    isSubscribed,
    connected,
  };
}
