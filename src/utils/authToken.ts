// utils/authToken.ts
import { tokenManager } from "../lib/tokenManager";

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;

  return tokenManager.getAccessToken();
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
};
