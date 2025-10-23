import { getAccessToken } from "../../utils/authToken";
import api from "./axiosInstance";

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
  const { data } = await api.get("/clients", {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return data;
};

/**
 * Obtener estadísticas de clientes
 */
export const getClientStats = async () => {
  const token = getAccessToken();
  const { data } = await api.get("/clients/stats", {
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
 * Eliminar un cliente
 */
export const deleteClient = async (id: string) => {
  const token = getAccessToken();
  const { data } = await api.delete(`/clients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
