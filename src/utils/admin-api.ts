/**
 * Admin Panel API Client
 *
 * Helper para interactuar con el Admin Panel desde el frontend.
 *
 * Uso:
 * ```typescript
 * import { adminAPI } from '@/utils/admin-api';
 *
 * // Dashboard
 * const dashboard = await adminAPI.getDashboard();
 *
 * // WhatsApp System
 * const status = await adminAPI.whatsappSystem.getStatus();
 * await adminAPI.whatsappSystem.activate();
 * ```
 */

import { useState } from "react";

// Leer ADMIN_UID desde variables de entorno
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || "";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

if (!ADMIN_UID) {
  console.error("⚠️ NEXT_PUBLIC_ADMIN_UID not set in environment variables");
}

interface ApiOptions extends RequestInit {
  body?: any;
}

/**
 * Fetch helper con autenticación de admin
 */
async function adminFetch(endpoint: string, options: ApiOptions = {}) {
  const url = `${API_BASE_URL}/api${endpoint}`;

  // Obtener token JWT de localStorage
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Admin API Client
 */
export const adminAPI = {
  /**
   * Dashboard General
   */
  async getDashboard() {
    return adminFetch("/admin/dashboard");
  },

  async getHealth() {
    return adminFetch("/admin/health");
  },

  /**
   * WhatsApp System Control (Cloud API)
   */
  whatsappSystem: {
    async getStatus() {
      return adminFetch("/admin/whatsapp/status");
    },

    async activate() {
      return adminFetch("/admin/whatsapp/activate", { method: "POST" });
    },

    async deactivate() {
      return adminFetch("/admin/whatsapp/deactivate", { method: "POST" });
    },

    async init() {
      return adminFetch("/admin/whatsapp/init", { method: "POST" });
    },

    async logout() {
      return adminFetch("/admin/whatsapp/logout", { method: "POST" });
    },

    async saveSession() {
      return adminFetch("/admin/whatsapp/save-session", { method: "POST" });
    },

    async enableWorkingHours() {
      return adminFetch("/admin/whatsapp/working-hours/enable", {
        method: "POST",
      });
    },

    async disableWorkingHours() {
      return adminFetch("/admin/whatsapp/working-hours/disable", {
        method: "POST",
      });
    },
  },

  /**
   * 📢 Admin Broadcast - Notificaciones a usuarios
   */
  broadcast: {
    /**
     * Envía una notificación a TODOS los usuarios conectados
     */
    async sendToAll(notification: {
      type: "info" | "warning" | "success" | "error";
      title: string;
      message: string;
      duration?: number;
      dismissible?: boolean;
      action?: {
        label: string;
        url?: string;
      };
    }) {
      return adminFetch("/admin/broadcast", {
        method: "POST",
        body: notification,
      });
    },

    /**
     * Envía una notificación a usuarios específicos
     */
    async sendToUsers(
      userIds: string[],
      notification: {
        type: "info" | "warning" | "success" | "error";
        title: string;
        message: string;
        duration?: number;
        dismissible?: boolean;
      }
    ) {
      return adminFetch("/admin/notify-users", {
        method: "POST",
        body: {
          userIds,
          ...notification,
        },
      });
    },

    /**
     * Obtiene estadísticas de conexiones WebSocket
     */
    async getStats() {
      return adminFetch("/admin/broadcast/stats");
    },
  },
};

/**
 * React Hook para Admin Panel
 */
export function useAdminPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await fn();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Admin API error:", message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    execute,
    api: adminAPI,
  };
}

/**
 * Tipos de respuesta
 */
export interface WhatsAppSystemStatus {
  ready: boolean;
  authenticated: boolean;
  phone: string | null;
  qr: string | null;
  active: boolean;
  workingHoursEnabled?: boolean;
  stats?: {
    messagesToday: number;
    maxPerDay: number;
    isWorkingHours: boolean;
    percentageUsed: number;
  };
}

export interface SystemStatus {
  whatsapp: {
    ready: boolean;
    authenticated: boolean;
    active: boolean;
  };
  redis: {
    connected: boolean;
  };
}

/**
 * Ejemplo de uso en un componente
 */
/*
import { useAdminPanel } from '@/utils/admin-api';

export function AdminDashboard() {
  const { loading, error, execute, api } = useAdminPanel();
  const [status, setStatus] = useState<WhatsAppSystemStatus | null>(null);

  useEffect(() => {
    execute(async () => {
      const data = await api.whatsappSystem.getStatus();
      setStatus(data);
    });
  }, []);

  const handleActivate = () => {
    execute(async () => {
      await api.whatsappSystem.activate();
      alert('WhatsApp activado!');
    });
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Admin Panel</h1>
      <button onClick={handleActivate}>Activar WhatsApp</button>
    </div>
  );
}
*/
