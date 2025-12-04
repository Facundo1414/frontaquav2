import { getAccessToken } from "../../utils/authToken";
import api from "./axiosInstance";
import { logger } from '@/lib/logger';

/**
 * Preview de importación PYSE (sin ejecutar cambios)
 */
export const previewPYSEImport = async (
  file: File,
  options?: {
    updateExisting?: boolean;
    preserveManualPhones?: boolean;
  }
) => {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("file", file);

  if (options?.updateExisting !== undefined) {
    formData.append("updateExisting", String(options.updateExisting));
  }
  if (options?.preserveManualPhones !== undefined) {
    formData.append(
      "preserveManualPhones",
      String(options.preserveManualPhones)
    );
  }

  const { data } = await api.post("/clients/import/pyse/preview", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

/**
 * Preview de importación Deudas (sin ejecutar cambios)
 */
export const previewDeudasImport = async (
  file: File,
  options?: {
    updateExisting?: boolean;
    preserveManualPhones?: boolean;
  }
) => {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("file", file);

  if (options?.updateExisting !== undefined) {
    formData.append("updateExisting", String(options.updateExisting));
  }
  if (options?.preserveManualPhones !== undefined) {
    formData.append(
      "preserveManualPhones",
      String(options.preserveManualPhones)
    );
  }

  const { data } = await api.post("/clients/import/deudas/preview", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

/**
 * Importar clientes desde archivo Excel PYSE (Universo de Cuentas)
 */
export const importPYSEClients = async (
  file: File,
  options?: {
    updateExisting?: boolean;
    preserveManualPhones?: boolean;
  }
) => {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("file", file);

  if (options?.updateExisting !== undefined) {
    formData.append("updateExisting", String(options.updateExisting));
  }
  if (options?.preserveManualPhones !== undefined) {
    formData.append(
      "preserveManualPhones",
      String(options.preserveManualPhones)
    );
  }

  const { data } = await api.post("/clients/import/pyse", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

/**
 * Importar clientes con deudas/planes de pago desde Excel
 */
export const importDeudasClients = async (
  file: File,
  options?: {
    updateExisting?: boolean;
    preserveManualPhones?: boolean;
  }
) => {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("file", file);

  if (options?.updateExisting !== undefined) {
    formData.append("updateExisting", String(options.updateExisting));
  }
  if (options?.preserveManualPhones !== undefined) {
    formData.append(
      "preserveManualPhones",
      String(options.preserveManualPhones)
    );
  }

  const { data } = await api.post("/clients/import/deudas", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

/**
 * Importar solo teléfonos por UF desde Excel
 */
export const importPhones = async (file: File) => {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/clients/import/phones", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

/**
 * Obtener lista de clientes
 */
export const getClients = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  hasPhone?: boolean;
  status?: string;
}) => {
  const token = getAccessToken();
  const response = await api.get("/clients", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });

  logger.log("🔍 Response headers:", response.headers);
  logger.log("🔍 X-Total-Count:", response.headers["x-total-count"]);
  logger.log("🔍 All header keys:", Object.keys(response.headers));

  // El backend devuelve los clientes en response.data
  // Y la información de paginación en los headers
  const clients = response.data;
  const total = response.headers["x-total-count"]
    ? parseInt(response.headers["x-total-count"], 10)
    : clients.length;

  logger.log("🔍 Total calculado:", total);
  logger.log("🔍 Clientes length:", clients.length);

  return {
    clients,
    total,
    page: response.headers["x-page"]
      ? parseInt(response.headers["x-page"], 10)
      : 1,
    perPage: response.headers["x-per-page"]
      ? parseInt(response.headers["x-per-page"], 10)
      : 50,
    totalPages: response.headers["x-total-pages"]
      ? parseInt(response.headers["x-total-pages"], 10)
      : 1,
  };
};

/**
 * Obtener estadísticas de clientes
 */
export const getClientStats = async () => {
  const token = getAccessToken();
  const { data } = await api.get("/clients/stats/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

/**
 * Obtener un cliente por ID
 */
export const getClientById = async (id: string) => {
  const token = getAccessToken();
  const { data } = await api.get(`/clients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

/**
 * Obtener teléfonos enriquecidos desde la base de datos por UFs
 * Retorna mapa de UF → teléfono actualizado
 */
export const getPhonesByUFs = async (
  ufs: number[]
): Promise<Record<number, string>> => {
  const token = getAccessToken();

  // Buscar clientes por UFs en lotes de 100
  const phoneMap: Record<number, string> = {};
  const batchSize = 100;

  for (let i = 0; i < ufs.length; i += batchSize) {
    const batch = ufs.slice(i, i + batchSize);

    try {
      const { data } = await api.post(
        "/clients/phones/by-ufs",
        { ufs: batch },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Merge results
      Object.assign(phoneMap, data);
    } catch (error) {
      logger.warn(
        `Error obteniendo teléfonos para lote ${i}-${i + batch.length}:`,
        error
      );
    }
  }

  return phoneMap;
};

/**
 * Actualizar un cliente
 */
export const updateClient = async (id: string, updates: any) => {
  const token = getAccessToken();
  const { data } = await api.patch(`/clients/${id}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

/**
 * Obtener trabajos (client_works) de un cliente específico
 */
export const getClientWorks = async (clientId: string) => {
  const token = getAccessToken();
  const { data } = await api.get(`/clients/${clientId}/works`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

/**
 * Eliminar un cliente
 */
export const deleteClient = async (id: string) => {
  const token = getAccessToken();
  const { data } = await api.delete(`/clients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
