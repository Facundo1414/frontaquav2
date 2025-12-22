import axios from "./axiosInstance";
import { getAccessToken } from "@/utils/authToken";

export interface ActiveJob {
  jobId: string;
  type: "senddebts" | "proximos_vencer";
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  totalItems?: number;
  processedItems?: number;
  failedItems?: number;
  currentPhase?: string;
  inputFilename?: string;
  resultFilename?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  source: "memory" | "database";
}

export interface JobHistory {
  jobId: string;
  type: "senddebts" | "proximos_vencer";
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  progress?: number;
  totalItems?: number;
  processedItems?: number;
  failedItems?: number;
  successItems?: number;
  inputFilename?: string;
  resultFilename?: string;
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Obtener jobs activos del usuario (pending o processing)
 * Útil para recuperar jobs cuando el usuario vuelve a la página
 */
export const getActiveJobs = async (): Promise<ActiveJob[]> => {
  const token = getAccessToken();

  try {
    const response = await axios.get("/jobs/active", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.jobs || [];
  } catch (error: any) {
    console.error("Error obteniendo jobs activos:", error);
    throw new Error(
      error?.response?.data?.message || "Error al obtener jobs activos"
    );
  }
};

/**
 * Obtener historial de jobs del usuario
 */
export const getJobHistory = async (
  limit: number = 50
): Promise<JobHistory[]> => {
  const token = getAccessToken();

  try {
    const response = await axios.get(`/jobs/history?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.jobs || [];
  } catch (error: any) {
    console.error("Error obteniendo historial de jobs:", error);
    throw new Error(
      error?.response?.data?.message || "Error al obtener historial"
    );
  }
};

/**
 * Obtener detalle de un job específico
 */
export const getJobDetails = async (jobId: string): Promise<any> => {
  const token = getAccessToken();

  try {
    const response = await axios.get(`/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.job;
  } catch (error: any) {
    console.error(`Error obteniendo job ${jobId}:`, error);
    throw new Error(error?.response?.data?.message || "Error al obtener job");
  }
};

/**
 * Cancelar un job en progreso
 */
export const cancelJob = async (jobId: string): Promise<boolean> => {
  const token = getAccessToken();

  try {
    const response = await axios.post(
      `/jobs/${jobId}/cancel`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.success;
  } catch (error: any) {
    console.error(`Error cancelando job ${jobId}:`, error);
    throw new Error(error?.response?.data?.message || "Error al cancelar job");
  }
};
