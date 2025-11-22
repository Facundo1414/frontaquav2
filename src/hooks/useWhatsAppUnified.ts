/**
 * 🔗 useWhatsAppUnified
 *
 * Hook unificado para obtener estado de WhatsApp
 *
 * **Sistema Centralizado (whatsapp-worker en puerto 3002):**
 * - Todos los usuarios usan este sistema
 * - Polling HTTP cada 30s a /wa/state
 * - Límite: 300 mensajes/día por usuario
 * - Horario: 9-16hs
 *
 * **Admin con cuenta propia (opcional):**
 * - Puede elegir usar su propia cuenta WhatsApp
 * - También usa whatsapp-web.js
 * - Sin límites de 300 msg/día
 */

import { useState, useEffect, useCallback } from "react";
import { useGlobalContext } from "@/app/providers/context/GlobalContext";
import { useWhatsappStatus } from "./useWhatsappStatus";
import api from "@/lib/api/axiosInstance";

interface UnifiedWhatsAppStatus {
  // Estado de conexión
  connected: boolean;
  ready: boolean;
  authenticated: boolean;
  phone?: string;
  qr?: string | null;

  // Límites y restricciones
  stats?: {
    messagesToday: number;
    maxPerDay: number;
    isWorkingHours: boolean;
    percentageUsed: number;
  };

  // Metadatos
  mode: "system" | "admin-personal";
  loading: boolean;
  error: string | null;
  canSendMessage: boolean;
  reason?: string;
}

export function useWhatsAppUnified() {
  const { userId } = useGlobalContext();
  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || "";
  const isAdmin = userId === ADMIN_UID;

  // Estados
  const [status, setStatus] = useState<UnifiedWhatsAppStatus>({
    connected: false,
    ready: false,
    authenticated: false,
    mode: "system",
    loading: true,
    error: null,
    canSendMessage: false,
  });

  // Retry con exponential backoff
  const [retryCount, setRetryCount] = useState(0);
  const [retryDelay, setRetryDelay] = useState(1000); // Start at 1s

  // Admin: WebSocket en tiempo real (para QR y gestión de sesión)
  const {
    status: adminStatus,
    isSubscribed: adminSubscribed,
    connected: adminConnected,
  } = useWhatsappStatus(userId, isAdmin);

  // Sistema Centralizado: Polling HTTP con retry
  const fetchSystemStatus = useCallback(async () => {
    try {
      const response = await api.get("/wa/state");

      if (response.data?.data) {
        const data = response.data.data;

        // Calcular si puede enviar mensajes
        const maxPerDay = parseInt(
          process.env.NEXT_PUBLIC_MAX_MESSAGES_PER_DAY || "300"
        );
        const workStart = parseInt(
          process.env.NEXT_PUBLIC_WORKING_HOURS_START || "9"
        );
        const workEnd = parseInt(
          process.env.NEXT_PUBLIC_WORKING_HOURS_END || "16"
        );

        const currentHour = new Date().getHours();
        const isWorkingHours =
          currentHour >= workStart && currentHour < workEnd;

        const messagesToday = data.stats?.messagesToday || 0;
        const messagesRemaining = maxPerDay - messagesToday;

        let canSendMessage = true;
        let reason: string | undefined;

        if (!data.ready) {
          canSendMessage = false;
          reason = "Sistema WhatsApp no conectado";
        } else if (!isWorkingHours) {
          canSendMessage = false;
          reason = `Horario de envío: ${workStart}:00 - ${workEnd}:00 hs`;
        } else if (messagesRemaining <= 0) {
          canSendMessage = false;
          reason = "Límite diario alcanzado (300 mensajes)";
        }

        setStatus({
          connected: true,
          ready: data.ready || false,
          authenticated: data.authenticated || false,
          phone: data.phone,
          qr: data.qr,
          stats: data.stats,
          mode: "system",
          loading: false,
          error: null,
          canSendMessage,
          reason,
        });

        // Reset retry en éxito
        setRetryCount(0);
        setRetryDelay(1000);
      }
    } catch (err: any) {
      console.error("Error fetching WhatsApp system status:", err);

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s (max 16s)
      const nextRetry = retryCount + 1;
      const nextDelay = Math.min(retryDelay * 2, 16000);

      console.warn(`⚠️ Retry ${nextRetry} en ${nextDelay / 1000}s...`);

      setRetryCount(nextRetry);
      setRetryDelay(nextDelay);

      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Error al obtener estado del sistema",
        canSendMessage: false,
        reason: "Error de conexión - reintentando...",
      }));
    }
  }, [retryCount, retryDelay]);

  // Admin: Usar WebSocket status
  useEffect(() => {
    if (isAdmin && adminStatus) {
      console.log("👤 Admin mode: usando WebSocket status", adminStatus);

      setStatus({
        connected: adminConnected,
        ready: adminStatus.ready || false,
        authenticated: adminStatus.authenticated || false,
        qr: adminStatus.qr,
        mode: "admin-personal",
        loading: false,
        error: null,
        canSendMessage: adminStatus.ready || false,
        reason: adminStatus.ready ? undefined : "Sesión no lista",
      });
    }
  }, [isAdmin, adminStatus, adminConnected]);

  // Sistema: Polling con delay progresivo
  useEffect(() => {
    if (isAdmin) return; // Admin usa WebSocket

    fetchSystemStatus();

    // Polling: usar el delay actual (30s normal, más si hay errores)
    const interval = setInterval(
      fetchSystemStatus,
      retryCount > 0 ? retryDelay : 30000
    );

    return () => clearInterval(interval);
  }, [isAdmin, fetchSystemStatus, retryCount, retryDelay]);

  // Función de refresco manual
  const refresh = useCallback(() => {
    if (!isAdmin) {
      fetchSystemStatus();
    }
  }, [isAdmin, fetchSystemStatus]);

  return {
    ...status,
    refresh,
  };
}
