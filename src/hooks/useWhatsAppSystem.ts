import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api/axiosInstance";

interface WhatsAppSystemStatus {
  ready: boolean;
  authenticated: boolean;
  phone?: string;
  qr?: string | null;
  stats?: {
    messagesToday: number;
    maxPerDay: number;
    isWorkingHours: boolean;
    percentageUsed: number;
  };
}

interface WhatsAppLimits {
  messagesRemaining: number;
  maxPerDay: number;
  percentageUsed: number;
  isWorkingHours: boolean;
  canSendMessage: boolean;
  reason?: string;
}

export function useWhatsAppSystem() {
  const [status, setStatus] = useState<WhatsAppSystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/wa/state");

      if (response.data?.data) {
        setStatus(response.data.data);
        setError(null);
      }
    } catch (err: any) {
      console.error("Error fetching WhatsApp status:", err);
      setError(err.message || "Error al obtener estado del sistema");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchStatus, 30000);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  const getLimits = useCallback((): WhatsAppLimits => {
    const maxPerDay = parseInt(
      process.env.NEXT_PUBLIC_MAX_MESSAGES_PER_DAY || "300"
    );
    const workStart = parseInt(
      process.env.NEXT_PUBLIC_WORKING_HOURS_START || "9"
    );
    const workEnd = parseInt(process.env.NEXT_PUBLIC_WORKING_HOURS_END || "16");

    const currentHour = new Date().getHours();
    const isWorkingHours = currentHour >= workStart && currentHour < workEnd;

    const messagesToday = status?.stats?.messagesToday || 0;
    const messagesRemaining = maxPerDay - messagesToday;
    const percentageUsed = (messagesToday / maxPerDay) * 100;

    let canSendMessage = true;
    let reason: string | undefined;

    if (!status?.ready) {
      canSendMessage = false;
      reason = "Sistema WhatsApp no conectado";
    } else if (!isWorkingHours) {
      canSendMessage = false;
      reason = `Horario de envío: ${workStart}:00 - ${workEnd}:00 hs`;
    } else if (messagesRemaining <= 0) {
      canSendMessage = false;
      reason = "Límite diario alcanzado (300 mensajes)";
    }

    return {
      messagesRemaining,
      maxPerDay,
      percentageUsed,
      isWorkingHours,
      canSendMessage,
      reason,
    };
  }, [status]);

  return {
    status,
    loading,
    error,
    limits: getLimits(),
    refresh: fetchStatus,
  };
}
