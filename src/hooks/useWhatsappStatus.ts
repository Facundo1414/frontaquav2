"use client";
import { useEffect, useState } from "react";
import { getWhatsappStatus } from "@/lib/api/whatsappApi";

export type WhatsAppStatus =
  | "pending"
  | "ready"
  | "authenticated"
  | "disconnected"
  | "initializing"
  | "restoring"
  | "inactive";

export const useWhatsappStatus = (pollInterval = 60000) => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<WhatsAppStatus>("pending");

  useEffect(() => {
    let interval: number;

    const getStatus = async () => {
      try {
        const data = await getWhatsappStatus();
        setStatus(data.status || (data.isActive ? "authenticated" : "pending"));
      } catch (err) {
        console.error("Error al verificar sesión WhatsApp", err);
        setStatus("disconnected");
      } finally {
        setLoading(false);
      }
    };

    getStatus();
    interval = window.setInterval(getStatus, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval]);

  return { status, loading };
};
