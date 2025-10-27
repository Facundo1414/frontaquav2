import { getAccessToken } from "../../utils/authToken";
import api from "./axiosInstance";

/**
 * 📂 API para Filtrado de Clientes - Sistema Nuevo
 */

// Obtener información del universo guardado
export const getUniverseInfo = async () => {
  const token = getAccessToken();
  try {
    const { data } = await api.get("/comprobante-filtro/universe-info", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error: any) {
    // Si no hay universo guardado (404), retornar null
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// 🔥 NUEVO: Obtener barrios con conteo de cuentas
export const getNeighborhoodsWithCount = async (): Promise<{
  neighborhoods: Array<{ neighborhood: string; accountCount: number }>;
  totalNeighborhoods: number;
  totalAccounts: number;
} | null> => {
  const token = getAccessToken();
  try {
    const { data } = await api.get(
      "/comprobante-filtro/neighborhoods-with-count",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error: any) {
    // Si no hay universo guardado (404), retornar null
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// Paso 1: Subir archivo universo (una sola vez)
export const uploadUniverseFile = async (formData: FormData) => {
  const token = getAccessToken();
  const { data } = await api.post(
    "/comprobante-filtro/upload-universe",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

// Paso 3: Verificar deuda por barrios seleccionados (con filtros opcionales)
export const checkDebtByNeighborhoods = async (
  neighborhoods: string[],
  filtros?: {
    limitesPorBarrio?: Record<string, number>;
    offsetsPorBarrio?: Record<string, number>; // 🔥 Nuevo
    minComprobantesVencidos?: number;
    maxComprobantesVencidos?: number;
    minDeuda?: number;
    maxDeuda?: number;
  }
) => {
  const token = getAccessToken();
  const payload: any = { neighborhoods };

  // Agregar filtros opcionales si están presentes
  if (filtros) {
    if (filtros.limitesPorBarrio) {
      payload.maxPerNeighborhood = filtros.limitesPorBarrio;
    }
    if (filtros.offsetsPorBarrio) {
      payload.offsetPerNeighborhood = filtros.offsetsPorBarrio; // 🔥 Nuevo
    }
    if (filtros.minComprobantesVencidos) {
      payload.minComprobantesVencidos = filtros.minComprobantesVencidos;
    }
    if (filtros.maxComprobantesVencidos) {
      payload.maxComprobantesVencidos = filtros.maxComprobantesVencidos;
    }
    if (filtros.minDeuda) {
      payload.minDeuda = filtros.minDeuda;
    }
    if (filtros.maxDeuda) {
      payload.maxDeuda = filtros.maxDeuda;
    }
  }

  const { data } = await api.post(
    "/comprobante-filtro/check-by-neighborhoods",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

// 🔥 NUEVO: Verificar deuda por unidades específicas (más eficiente que por barrios)
export const checkDebtByUnits = async (
  unidades: number[],
  filtros?: {
    minComprobantesVencidos?: number;
    maxComprobantesVencidos?: number;
    minDeuda?: number;
    maxDeuda?: number;
  },
  clientData?: {
    uf: number;
    barrio?: string;
    domicilio?: string;
    titular?: string;
  }[] // 🔥 Nuevo parámetro
) => {
  const token = getAccessToken();
  const payload: any = { unidades };

  // 🔥 Agregar clientData si está presente
  if (clientData && clientData.length > 0) {
    payload.clientData = clientData;
  }

  // Agregar filtros opcionales si están presentes
  if (filtros) {
    if (filtros.minComprobantesVencidos) {
      payload.minComprobantesVencidos = filtros.minComprobantesVencidos;
    }
    if (filtros.maxComprobantesVencidos) {
      payload.maxComprobantesVencidos = filtros.maxComprobantesVencidos;
    }
    if (filtros.minDeuda) {
      payload.minDeuda = filtros.minDeuda;
    }
    if (filtros.maxDeuda) {
      payload.maxDeuda = filtros.maxDeuda;
    }
  }

  const { data } = await api.post(
    "/comprobante-filtro/check-by-units",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

// Paso 4: Generar archivos Excel APTOS y NO_APTOS
export const generateExcelFiles = async (results: any[]) => {
  const token = getAccessToken();
  const response = await api.post(
    "/comprobante-filtro/generate-excel",
    { results },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob", // Importante para recibir el archivo ZIP
    }
  );
  return response.data; // Retorna el Blob del ZIP
};

// 🔥 NUEVO: Generar archivo Excel APTOS solamente
export const generateAptosExcel = async (results: any[]): Promise<Blob> => {
  const token = getAccessToken();
  const response = await api.post(
    "/comprobante-filtro/generate-aptos-excel",
    { results },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    }
  );
  return response.data;
};

// 🔥 NUEVO: Generar archivo Excel NO APTOS solamente
export const generateNoAptosExcel = async (results: any[]): Promise<Blob> => {
  const token = getAccessToken();
  const response = await api.post(
    "/comprobante-filtro/generate-no-aptos-excel",
    { results },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    }
  );
  return response.data;
};

/**
 * 📂 API para Filtrado de Clientes - Sistema Viejo (legacy)
 */

// Upload y filtrado en un solo paso (sistema antiguo)
export const uploadAndFilterFile = async (formData: FormData) => {
  const token = getAccessToken();
  const { data } = await api.post(
    "/comprobante-filtro/upload-and-filter",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

// Obtener estado del job de procesamiento
export const getJobStatus = async (jobId: string) => {
  const token = getAccessToken();
  const { data } = await api.get(`/comprobante-filtro/status/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Descargar resultado (APTOS o NO_APTOS)
export const downloadJobResult = async (
  jobId: string,
  tipo: "aptos" | "no-aptos"
): Promise<Blob> => {
  const token = getAccessToken();
  const { data } = await api.get(
    `/comprobante-filtro/download/${jobId}/${tipo}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    }
  );
  return data;
};

/**
 * 📂 API para Recuperar Archivos de Respaldo
 */

// Listar archivos de respaldo del usuario
export const getUserFiles = async (): Promise<
  Array<{
    name: string;
    size: number;
    createdAt: string;
  }>
> => {
  const token = getAccessToken();
  const { data } = await api.get("/comprobante-filtro/files", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// Descargar archivo de respaldo específico
export const downloadUserFile = async (fileName: string): Promise<Blob> => {
  const token = getAccessToken();
  const { data } = await api.get(`/comprobante-filtro/files/${fileName}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  });
  return data;
};
