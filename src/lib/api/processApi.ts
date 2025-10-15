import { getAccessToken } from "../../utils/authToken";
import api from "./axiosInstance";
import { parseExcelBlobWithIndexMapping } from "../../utils/parseExcelBlob";
import { getFileByName } from "./uploadApi";

export const sendAndScrape = async (
  fileName: string,
  caption: string
): Promise<{ message: string; file?: Blob }> => {
  const token = getAccessToken();

  try {
    const response = await api.post(
      "/process/process-file",
      {
        filename: fileName,
        message: caption,
        expiration: 1,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // importante para recibir Excel
      }
    );

    const contentType = response.headers["content-type"];

    if (contentType.includes("application/json")) {
      // Si vino un JSON de error o mensaje
      const text = await response.data.text(); // Blob → string
      const json = JSON.parse(text);
      return { message: json.message || "⚠️ Error inesperado" };
    }

    // Si vino un archivo Excel
    return {
      message: "✅ Procesamiento finalizado",
      file: response.data,
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
): Promise<{ message: string; file?: Blob }> => {
  const token = getAccessToken();

  try {
    // Paso 1: Obtener el archivo filtrado y convertirlo a datos
    const blob = await getFileByName(fileName);
    const parsedData = await parseExcelBlobWithIndexMapping(blob);

    // Paso 2: Enviar los datos al endpoint de próximos a vencer
    const response = await api.post(
      "/wa/send-proximos-vencer",
      {
        users: parsedData,
        diasAnticipacion: diasAnticipacion,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // importante para recibir Excel
      }
    );

    console.log(
      "Respuesta recibida - Content-Type:",
      response.headers["content-type"]
    );
    console.log("Tamaño de respuesta:", response.data.size, "bytes");

    const contentType = response.headers["content-type"];

    // Verificar si la respuesta es muy pequeña (posible error)
    if (response.data.size < 100) {
      console.warn("Respuesta muy pequeña, posible error");
      try {
        const text = await response.data.text();
        const json = JSON.parse(text);
        return { message: json.message || "⚠️ Error inesperado" };
      } catch {
        // Si no se puede parsear como JSON, continuar como Excel
      }
    }

    if (contentType && contentType.includes("application/json")) {
      // Si vino un JSON de error o mensaje
      const text = await response.data.text(); // Blob → string
      const json = JSON.parse(text);
      return { message: json.message || "⚠️ Error inesperado" };
    }

    // Si vino un archivo Excel (o se asume que es Excel)
    return {
      message: "✅ Procesamiento finalizado",
      file: response.data,
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
