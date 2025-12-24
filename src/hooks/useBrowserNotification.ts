"use client";

import { useEffect, useCallback, useState } from "react";

interface UseBrowserNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  onClick?: () => void;
}

/**
 * 🔔 Hook para notificaciones del navegador
 * Solicita permiso automáticamente y permite enviar notificaciones
 */
export function useBrowserNotification() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar soporte
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Solicitar permiso
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported]);

  // Enviar notificación
  const sendNotification = useCallback(
    async ({
      title,
      body,
      icon = "/favicon.ico",
      tag,
      onClick,
    }: UseBrowserNotificationOptions) => {
      if (!isSupported) {
        console.warn("Browser notifications not supported");
        return null;
      }

      // Si no tiene permiso, solicitarlo
      let currentPermission = permission;
      if (currentPermission === "default") {
        const granted = await requestPermission();
        if (!granted) {
          console.warn("Notification permission denied");
          return null;
        }
        currentPermission = "granted";
      }

      if (currentPermission !== "granted") {
        console.warn("Notification permission not granted");
        return null;
      }

      try {
        const notification = new Notification(title, {
          body,
          icon,
          tag,
          badge: "/favicon.ico",
          requireInteraction: false,
          silent: false,
        });

        if (onClick) {
          notification.onclick = () => {
            window.focus();
            onClick();
            notification.close();
          };
        }

        // Auto-cerrar después de 10 segundos
        setTimeout(() => notification.close(), 10000);

        return notification;
      } catch (error) {
        console.error("Error sending notification:", error);
        return null;
      }
    },
    [isSupported, permission, requestPermission]
  );

  // Notificación específica para proceso completado
  const notifyProcessComplete = useCallback(
    ({
      processName,
      totalSent,
      successful,
      failed,
      onClick,
    }: {
      processName: string;
      totalSent: number;
      successful: number;
      failed: number;
      onClick?: () => void;
    }) => {
      const successRate =
        totalSent > 0 ? Math.round((successful / totalSent) * 100) : 0;

      return sendNotification({
        title: `✅ ${processName} completado`,
        body: `Enviados: ${totalSent} | Exitosos: ${successful} (${successRate}%) | Fallidos: ${failed}`,
        tag: "process-complete",
        onClick,
      });
    },
    [sendNotification]
  );

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    notifyProcessComplete,
  };
}
