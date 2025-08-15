import { getAccessToken } from "../../utils/authToken";
import api from "./axiosInstance";

export const initializeWhatsAppSession = async () => {
  const token = getAccessToken();
  const { data } = await api.get("/whatsapp/init", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data; // ya devuelve message, isAuthenticated, isNew
};

export const fetchQrCode = async () => {
  const token = getAccessToken();
  const { data } = await api.get("/whatsapp/qr", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data; // Devuelve { qr, message, status, isAuthenticated, timestamp }
};

export const getIsLoggedIn = async () => {
  const token = getAccessToken();
  const { data } = await api.get("/whatsapp/status", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data; // Devuelve { isActive, timestamp }
};

export const logoutWhatsappSession = async () => {
  const token = getAccessToken();
  const { data } = await api.get("/whatsapp/logout", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data; // Devuelve { message, timestamp }
};
