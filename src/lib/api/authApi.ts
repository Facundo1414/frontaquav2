import { getAccessToken, getRefreshToken } from "@/utils/authToken";
import api from "./axiosInstance";

export const userLogin = async (email: string, password: string) => {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data;
};

export const userLogout = async () => {
  const accessToken = getAccessToken();
  await api.post("/api/auth/logout", { accessToken });
};

export const refreshToken = async () => {
  const refreshToken = getRefreshToken();
  const { data } = await api.post("/api/auth/refresh", { refreshToken });
  return data.accessToken;
};

export const checkValidateToken = async (): Promise<boolean> => {
  const token = getAccessToken();

  try {
    const response = await api.post("/api/auth/validate-token", {
      accessToken: token,
    });
    return response.status === 200;
  } catch {
    return false;
  }
};
