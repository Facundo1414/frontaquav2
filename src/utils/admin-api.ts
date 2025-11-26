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
 * // Baileys
 * await adminAPI.baileys.enable();
 * const metrics = await adminAPI.baileys.getMetrics();
 * await adminAPI.baileys.addBetaUser(userId, 'admin', 'Testing');
 * ```
 */

import { useState } from "react";

// Leer ADMIN_UID desde variables de entorno
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || "";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const WHATSAPP_WORKER_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_WORKER_URL || "http://localhost:3010";

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

  async getServices() {
    return adminFetch("/admin/services");
  },

  async getHealth() {
    return adminFetch("/admin/health");
  },

  /**
   * Services Management
   */
  services: {
    // Info
    async getAllInfo() {
      return adminFetch("/admin/services/info");
    },

    async getInfo(serviceId: string) {
      return adminFetch(`/admin/services/info/${serviceId}`);
    },

    // Logs
    async getLogs(serviceId?: string, limit: number = 100) {
      const params = new URLSearchParams();
      if (serviceId) params.append("service", serviceId);
      params.append("limit", limit.toString());

      return adminFetch(`/admin/services/logs?${params.toString()}`);
    },

    // Restart
    async restart(serviceId: string) {
      return adminFetch(`/admin/services/restart/${serviceId}`, {
        method: "POST",
      });
    },

    // Export
    async exportLogs(serviceId: string) {
      return adminFetch(`/admin/services/export/${serviceId}`);
    },

    // Clear
    async clearLogs(serviceId: string) {
      return adminFetch(`/admin/services/logs/clear/${serviceId}`, {
        method: "POST",
      });
    },
  },

  /**
   * Baileys Worker Management
   */
  baileys: {
    // Status
    async getStatus() {
      return adminFetch("/admin/baileys/status");
    },

    // Feature Flags
    async enable() {
      return adminFetch("/admin/baileys/enable", { method: "POST" });
    },

    async disable() {
      return adminFetch("/admin/baileys/disable", { method: "POST" });
    },

    async toggle() {
      return adminFetch("/admin/baileys/toggle", { method: "POST" });
    },

    // Beta Users
    async getBetaUsers() {
      return adminFetch("/admin/baileys/beta-users");
    },

    async addBetaUser(userId: string, enabledBy: string, notes?: string) {
      return adminFetch("/admin/baileys/beta-users", {
        method: "POST",
        body: { userId, enabledBy, notes },
      });
    },

    async removeBetaUser(userId: string) {
      return adminFetch(`/admin/baileys/beta-users/${userId}`, {
        method: "DELETE",
      });
    },

    async checkBetaUser(userId: string) {
      return adminFetch(`/admin/baileys/beta-users/${userId}/check`);
    },

    async clearBetaUsers() {
      return adminFetch("/admin/baileys/beta-users", { method: "DELETE" });
    },

    // Rollout
    async getRollout() {
      return adminFetch("/admin/baileys/rollout");
    },

    async setRollout(percentage: number) {
      if (percentage < 0 || percentage > 100) {
        throw new Error("Percentage must be between 0 and 100");
      }
      return adminFetch("/admin/baileys/rollout", {
        method: "POST",
        body: { percentage },
      });
    },

    async shouldUseBaileys(userId: string) {
      return adminFetch(`/admin/baileys/should-use/${userId}`);
    },

    // Metrics
    async getMetrics() {
      return adminFetch("/admin/baileys/metrics");
    },

    async getWorkerMetrics(workerType: "puppeteer" | "baileys") {
      return adminFetch(`/admin/baileys/metrics/${workerType}`);
    },

    // Emergency
    async emergencyRollback(reason: string) {
      return adminFetch("/admin/baileys/emergency-rollback", {
        method: "POST",
        body: { reason },
      });
    },

    async getRollbackInfo() {
      return adminFetch("/admin/baileys/rollback-info");
    },

    async clearRollback() {
      return adminFetch("/admin/baileys/clear-rollback", { method: "POST" });
    },

    // Maintenance
    async cleanupMetrics() {
      return adminFetch("/admin/baileys/cleanup", { method: "POST" });
    },
  },

  /**
   * WhatsApp System Control
   */
  whatsappSystem: {
    /**
     * Obtener estado del sistema WhatsApp
     */
    async getStatus() {
      return adminFetch("/wa/system/status");
    },

    /**
     * Activar sistema WhatsApp (cargar en memoria)
     */
    async activate() {
      return adminFetch("/wa/system/activate", { method: "POST" });
    },

    /**
     * Desactivar sistema WhatsApp (liberar memoria)
     */
    async deactivate() {
      return adminFetch("/wa/system/deactivate", { method: "POST" });
    },

    /**
     * Inicializar sistema WhatsApp (genera QR si es necesario)
     */
    async init() {
      return adminFetch("/wa/system/init", { method: "POST" });
    },

    /**
     * Obtener QR code actual
     */
    async getQR() {
      return adminFetch("/wa/system/qr");
    },

    /**
     * Cerrar sesión del sistema
     */
    async logout() {
      return adminFetch("/wa/system/logout", { method: "POST" });
    },

    /**
     * Guardar sesión manualmente en Supabase
     */
    async saveSession() {
      return adminFetch("/wa/system/save-session", { method: "POST" });
    },

    /**
     * Obtener configuración de horario laboral
     */
    async getWorkingHoursConfig() {
      return adminFetch("/wa/system/working-hours");
    },

    /**
     * Habilitar horario laboral (9-16hs)
     */
    async enableWorkingHours() {
      return adminFetch("/wa/system/working-hours/enable", { method: "POST" });
    },

    /**
     * Deshabilitar horario laboral (24/7)
     */
    async disableWorkingHours() {
      return adminFetch("/wa/system/working-hours/disable", { method: "POST" });
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
export interface BetaUser {
  userId: string;
  enabledAt: number;
  enabledBy: string;
  notes?: string;
}

export interface MetricsData {
  comparison: {
    puppeteer: WorkerMetrics;
    baileys: WorkerMetrics;
    improvement: {
      successRate: number;
      averageDuration: number;
      errorRate: number;
    };
  };
  currentErrorRate: number;
}

export interface WorkerMetrics {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  averageDuration: number;
  p95Duration: number;
  p99Duration: number;
  errorsByType: Record<string, number>;
}

export interface SystemStatus {
  baileys: {
    enabled: boolean;
    rolloutPercentage: number;
    betaUsersCount: number;
  };
  emergencyRollback: {
    active: boolean;
    info: {
      timestamp: number;
      reason: string;
    } | null;
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
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  useEffect(() => {
    execute(async () => {
      const data = await api.baileys.getMetrics();
      setMetrics(data);
    });
  }, []);

  const handleEnable = () => {
    execute(async () => {
      await api.baileys.enable();
      alert('Baileys habilitado!');
    });
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Admin Panel</h1>
      <button onClick={handleEnable}>Habilitar Baileys</button>
      {metrics && <MetricsChart data={metrics} />}
    </div>
  );
}
*/
