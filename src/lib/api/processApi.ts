import { getAccessToken } from "../../utils/authToken";
import api from "./axiosInstance";

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
