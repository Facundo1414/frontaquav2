// src/lib/apiClient.ts
import axios from "axios";

// Normalizamos la base URL para garantizar que termine en /api
let rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
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

// 🎯 Interceptor para manejar expiración de sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar sesión
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");

      // Redirigir al login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
