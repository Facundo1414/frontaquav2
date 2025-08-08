import { getAccessToken } from "../../utils/authToken";
import api from "./axiosInstance";

export const initializeWhatsAppSession = async () => {
  const token = getAccessToken();
  const { data } = await api.get("/whatsapp/init", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const fetchQrCode = async () => {
  const token = getAccessToken();
  const { data } = await api.get("/whatsapp/qr", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.qr;
};

export const getIsLoggedIn = async () => {
  const token = getAccessToken();
  const { data } = await api.get("/whatsapp/status", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.isActive;
};

export const logoutWhatsappSession = async () => {
  const token = getAccessToken();
  const { data } = await api.get("/whatsapp/logout", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

