import { useState, useEffect, useRef } from "react";
import { whatsappChatApi } from "@/lib/api/whatsappChatApi";
import axios from "axios";

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryDelayRef = useRef(60000); // Iniciar con 60s

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let isActive = true;

    const fetchUnreadCount = async () => {
      // Cancelar request anterior si aún está pendiente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear nuevo abort controller
      abortControllerRef.current = new AbortController();

      try {
        const conversations = await whatsappChatApi.getConversations(
          "active",
          1,
          100
        );

        if (!isActive) return; // Componente desmontado

        const total = conversations.reduce(
          (sum, conv) => sum + conv.unread_count,
          0
        );
        setUnreadCount(total);

        // Reset retry delay en caso de éxito
        retryDelayRef.current = 60000; // 60s normal
      } catch (error) {
        if (!isActive) return;

        // Manejar error 429 (Too Many Requests)
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          console.warn(
            "⚠️ Rate limit alcanzado, aumentando intervalo de polling"
          );
          // Exponential backoff: duplicar el delay hasta máximo 5 minutos
          retryDelayRef.current = Math.min(retryDelayRef.current * 2, 300000);

          // Reiniciar el intervalo con el nuevo delay
          if (interval) {
            clearInterval(interval);
            interval = setInterval(fetchUnreadCount, retryDelayRef.current);
          }
        } else if (error && (error as any).name !== "CanceledError") {
          console.error("Error al cargar mensajes sin leer:", error);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    // Primera carga
    fetchUnreadCount();

    // Polling cada 60 segundos (reducido para evitar rate limiting)
    interval = setInterval(fetchUnreadCount, retryDelayRef.current);

    return () => {
      isActive = false;
      if (interval) clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { unreadCount, loading };
}
