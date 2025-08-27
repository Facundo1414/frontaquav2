import { getAccessToken } from "../../utils/authToken";
import api from "./axiosInstance";

export const initializeWhatsAppSession = async () => {
  const token = getAccessToken();
  const { data } = await api.get("/api/whatsapp/init", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data; // ya devuelve message, isAuthenticated, isNew
};

export const fetchQrCode = async () => {
  const token = getAccessToken();
  const { data } = await api.get("/api/whatsapp/qr", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data; // Devuelve { qr, message, status, isAuthenticated, timestamp }
};

// Devuelve status detallado
export const getWhatsappStatus = async () => {
  const token = getAccessToken();
  const { data } = await api.get("/api/whatsapp/status", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data; // { status, qr, isActive, ... }
};

export const logoutWhatsappSession = async () => {
  const token = getAccessToken();
  const { data } = await api.get("/api/whatsapp/logout", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data; // Devuelve { message, timestamp }
};

export const status = async () => {
  const token = getAccessToken();
  const { data } = await api.get("/api/whatsapp/status", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data; // Devuelve { isActive, timestamp }
};
