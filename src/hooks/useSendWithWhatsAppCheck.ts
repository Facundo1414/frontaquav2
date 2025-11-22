/**
 * 🚀 useSendWithWhatsAppCheck
 *
 * Hook para manejar feedback progresivo en botones de envío
 *
 * Estados:
 * - idle: Botón listo
 * - checking: Verificando estado de WhatsApp
 * - sending: Enviando mensajes
 * - success: Envío exitoso
 * - error: Error en el proceso
 */

import { useState, useCallback } from "react";
import { useWhatsAppUnified } from "./useWhatsAppUnified";
import { toast } from "sonner";

type SendState = "idle" | "checking" | "sending" | "success" | "error";

interface SendWithCheckOptions {
  onSend: () => Promise<void>;
  skipCheck?: boolean;
}

export function useSendWithWhatsAppCheck() {
  const [state, setState] = useState<SendState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    canSendMessage,
    reason,
    ready,
    loading: whatsappLoading,
    refresh,
  } = useWhatsAppUnified();

  const execute = useCallback(
    async ({ onSend, skipCheck = false }: SendWithCheckOptions) => {
      try {
        setState("checking");
        setErrorMessage(null);

        // Paso 1: Verificar estado de WhatsApp
        if (!skipCheck) {
          // Refrescar estado primero
          await refresh();

          // Esperar un momento para que se actualice
          await new Promise((resolve) => setTimeout(resolve, 500));

          if (whatsappLoading) {
            toast.info("⏳ Verificando disponibilidad de WhatsApp...");
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }

          // Verificar si puede enviar
          if (!ready) {
            const msg = "Sistema WhatsApp desconectado";
            setErrorMessage(msg);
            setState("error");
            toast.error(`❌ ${msg}`, {
              description: "Contactá al administrador del sistema",
            });
            return;
          }

          if (!canSendMessage) {
            const msg =
              reason || "No es posible enviar mensajes en este momento";
            setErrorMessage(msg);
            setState("error");
            toast.warning(`⚠️ ${msg}`, {
              description: reason?.includes("horario")
                ? "Los mensajes se envían de 9:00 a 16:00 hs"
                : reason?.includes("Límite")
                ? "Volvé mañana para más mensajes"
                : undefined,
            });
            return;
          }

          toast.success("✅ WhatsApp listo");
        }

        // Paso 2: Enviar mensajes
        setState("sending");
        await onSend();

        // Paso 3: Éxito
        setState("success");
        toast.success("✅ Mensajes enviados correctamente");

        // Reset después de 3 segundos
        setTimeout(() => {
          setState("idle");
        }, 3000);
      } catch (error: any) {
        const msg = error.message || "Error al enviar mensajes";
        setErrorMessage(msg);
        setState("error");
        toast.error(`❌ ${msg}`);

        // Reset después de 5 segundos
        setTimeout(() => {
          setState("idle");
          setErrorMessage(null);
        }, 5000);
      }
    },
    [canSendMessage, reason, ready, whatsappLoading, refresh]
  );

  const reset = useCallback(() => {
    setState("idle");
    setErrorMessage(null);
  }, []);

  return {
    state,
    errorMessage,
    isIdle: state === "idle",
    isChecking: state === "checking",
    isSending: state === "sending",
    isSuccess: state === "success",
    isError: state === "error",
    canProceed: ready && canSendMessage,
    execute,
    reset,
  };
}
