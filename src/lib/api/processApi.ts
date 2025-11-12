import { getAccessToken } from "../../utils/authToken";
import api from "./axiosInstance";
import { parseExcelBlobWithIndexMapping } from "../../utils/parseExcelBlob";
import { getFileByName } from "./uploadApi";

export const sendAndScrape = async (
  fileName: string,
  caption: string,
  tipoComprobante: "TODOS" | "PCB1" | "ATC2" = "TODOS",
  incluirIntimacion?: boolean,
  telefonoUsuario?: string
): Promise<{ message: string; file?: Blob; jobId?: string }> => {
  const token = getAccessToken();

  try {
    const response = await api.post(
      "/process/process-file",
      {
        filename: fileName,
        message: caption,
        expiration: 1,
        tipoComprobante,
        incluirIntimacion,
        telefonoUsuario,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // importante para recibir Excel
      }
    );

    const contentType = response.headers["content-type"];
    // Axios normaliza headers a minúsculas en respuestas blob
    const jobId = response.headers["x-job-id"] || response.headers["X-Job-Id"];

    console.log("📊 Headers recibidos:", response.headers);
    console.log("📊 JobId extraído:", jobId);

    if (contentType && contentType.includes("application/json")) {
      // Si vino un JSON de error o mensaje
      const text = await response.data.text(); // Blob → string
      const json = JSON.parse(text);
      return {
        message: json.message || "⚠️ Error inesperado",
        jobId: json.jobId || jobId,
      };
    }

    // Si vino un archivo Excel
    return {
      message: "✅ Procesamiento finalizado",
      file: response.data,
      jobId, // Incluir jobId para tracking
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || "❌ Error en el procesamiento";
    return { message: errorMessage };
  }
};

export const processFileProximosVencer = async (
  data: any[],
  diasAnticipacion: number
): Promise<{ data: any[] }> => {
  const token = getAccessToken();

  try {
    const response = await api.post(
      "/process/process-data-proximos-vencer",
      {
        data: data,
        diasAnticipacion: diasAnticipacion,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Error al procesar archivo"
    );
  }
};

export const sendProximosVencer = async (
  users: any[],
  diasAnticipacion: number
): Promise<Blob> => {
  const token = getAccessToken();

  try {
    const response = await api.post(
      "/whatsapp/send-proximos-vencer",
      {
        users: users,
        diasAnticipacion: diasAnticipacion,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Error al enviar mensajes"
    );
  }
};

export const sendAndScrapeProximosVencer = async (
  fileName: string,
  message: string,
  diasAnticipacion: number
): Promise<{ message: string; file?: Blob; jobId?: string }> => {
  const token = getAccessToken();

  try {
    const response = await api.post(
      "/process/process-file-proximos-vencer",
      {
        filename: fileName,
        message: message,
        expiration: 1,
        diasAnticipacion: diasAnticipacion,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // importante para recibir Excel
      }
    );

    const contentType = response.headers["content-type"];
    // Axios normaliza headers a minúsculas en respuestas blob
    const jobId = response.headers["x-job-id"] || response.headers["X-Job-Id"];

    console.log("📊 Headers recibidos (próximos a vencer):", response.headers);
    console.log("📊 JobId extraído (próximos a vencer):", jobId);

    if (contentType && contentType.includes("application/json")) {
      // Si vino un JSON de error o mensaje
      const text = await response.data.text(); // Blob → string
      const json = JSON.parse(text);
      return {
        message: json.message || "⚠️ Error inesperado",
        jobId: json.jobId || jobId,
      };
    }

    // Si vino un archivo Excel
    return {
      message: "✅ Procesamiento finalizado",
      file: response.data,
      jobId, // Incluir jobId para tracking
    };
  } catch (error: any) {
    console.error("Error en sendAndScrapeProximosVencer:", error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "❌ Error en el procesamiento";
    return { message: errorMessage };
  }
};

export const getUserPhone = async (): Promise<string | null> => {
  try {
    const response = await api.get("/process/user-phone");

    if (response.data?.success && response.data?.phoneNumber) {
      return response.data.phoneNumber;
    }

    return null;
  } catch (error: any) {
    console.error("Error obteniendo teléfono del usuario:", error);
    return null;
  }
};
