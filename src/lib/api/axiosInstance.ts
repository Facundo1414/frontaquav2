// src/lib/apiClient.ts
import axios from "axios";
import { tokenManager } from "../tokenManager";

// Normalizamos la base URL para garantizar que termine en /api
let rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
// quitar slash final
rawBase = rawBase.replace(/\/$/, "");
// si no termina en /api lo añadimos
if (!/\/api$/i.test(rawBase)) {
  rawBase = rawBase + "/api";
}

const api = axios.create({
  baseURL: rawBase,
  withCredentials: true,
  timeout: 1800000,
});

// Interceptor para añadir token automáticamente
api.interceptors.request.use(
  async (config) => {
    // Intentar refrescar el token si es necesario
    try {
      if (tokenManager.needsRefreshSoon()) {
        await tokenManager.refreshTokenIfNeeded();
      }
    } catch (error) {
      console.warn("Failed to refresh token preemptively:", error);
    }

    // Obtener el token actual
    const token = tokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y refrescar tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar refrescar el token
        const newToken = await tokenManager.refreshTokenIfNeeded();

        if (newToken) {
          // Reintentar la petición con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          throw new Error("No token available");
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Limpiar sesión y redirigir al login
        tokenManager.clearTokens();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Si es otro error 401 o ya se intentó refrescar
    if (error.response?.status === 401) {
      tokenManager.clearTokens();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
