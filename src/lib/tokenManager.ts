// src/lib/tokenManager.ts
import { refreshToken as apiRefreshToken } from "./api/authApi";

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp
}

class TokenManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  // Configuración: minutos antes de la expiración para refrescar
  private readonly REFRESH_BEFORE_EXPIRY_MINUTES = parseInt(
    process.env.NEXT_PUBLIC_TOKEN_REFRESH_BEFORE_MINUTES || "10"
  );
  private readonly MIN_TOKEN_VALIDITY_MINUTES = parseInt(
    process.env.NEXT_PUBLIC_MIN_TOKEN_VALIDITY_MINUTES || "5"
  );

  private decodeJWT(token: string) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }

  private getTokenExpiration(accessToken: string): number {
    const decoded = this.decodeJWT(accessToken);
    if (decoded && decoded.exp) {
      return decoded.exp * 1000; // Convert to milliseconds
    }

    // Si no podemos decodificar, asumimos duración por defecto configurada
    const defaultHours = parseInt(
      process.env.NEXT_PUBLIC_DEFAULT_TOKEN_HOURS || "8"
    );
    return Date.now() + defaultHours * 60 * 60 * 1000;
  }

  setTokens(accessToken: string, refreshToken: string) {
    const expiresAt = this.getTokenExpiration(accessToken);

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("tokenExpiresAt", expiresAt.toString());

    this.scheduleRefresh(expiresAt);

    console.log(
      `Token set. Expires at: ${new Date(expiresAt).toLocaleString()}`
    );
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem("accessToken");
    const expiresAt = localStorage.getItem("tokenExpiresAt");

    if (!token || !expiresAt) {
      return null;
    }

    const expires = parseInt(expiresAt);
    const now = Date.now();

    // Si el token expira en menos de X minutos, considéralo expirado
    if (expires - now < this.MIN_TOKEN_VALIDITY_MINUTES * 60 * 1000) {
      console.log("Token expiring soon, will refresh");
      return null;
    }

    return token;
  }

  private scheduleRefresh(expiresAt: number) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const now = Date.now();
    const timeUntilRefresh =
      expiresAt - now - this.REFRESH_BEFORE_EXPIRY_MINUTES * 60 * 1000;

    if (timeUntilRefresh > 0) {
      const minutesUntilRefresh = Math.round(timeUntilRefresh / 1000 / 60);
      console.log(`Token will be refreshed in ${minutesUntilRefresh} minutes`);

      this.refreshTimer = setTimeout(() => {
        this.refreshTokenIfNeeded();
      }, timeUntilRefresh);
    } else {
      // Token is already close to expiry, refresh immediately
      console.log("Token close to expiry, refreshing immediately");
      this.refreshTokenIfNeeded();
    }
  }

  async refreshTokenIfNeeded(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const currentToken = localStorage.getItem("accessToken");
    const refreshTokenValue = localStorage.getItem("refreshToken");
    const expiresAt = localStorage.getItem("tokenExpiresAt");

    if (!currentToken || !refreshTokenValue || !expiresAt) {
      return null;
    }

    const expires = parseInt(expiresAt);
    const now = Date.now();

    // Si el token aún tiene más de X minutos, no refrescar
    if (expires - now > this.REFRESH_BEFORE_EXPIRY_MINUTES * 60 * 1000) {
      return currentToken;
    }

    console.log("Refreshing token...");
    this.isRefreshing = true;

    this.refreshPromise = this.performTokenRefresh(refreshTokenValue);

    try {
      const newToken = await this.refreshPromise;
      this.isRefreshing = false;
      this.refreshPromise = null;
      return newToken;
    } catch (error) {
      this.isRefreshing = false;
      this.refreshPromise = null;
      throw error;
    }
  }

  private async performTokenRefresh(
    refreshTokenValue: string
  ): Promise<string> {
    try {
      const newAccessToken = await apiRefreshToken();

      if (newAccessToken) {
        const newExpiresAt = this.getTokenExpiration(newAccessToken);

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("tokenExpiresAt", newExpiresAt.toString());

        this.scheduleRefresh(newExpiresAt);

        console.log("Token refreshed successfully");
        return newAccessToken;
      } else {
        throw new Error("No new token received");
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.clearTokens();
      throw error;
    }
  }

  clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("tokenExpiresAt");

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    console.log("Tokens cleared");
  }

  // Inicializar el manager al cargar la aplicación
  init() {
    const accessToken = localStorage.getItem("accessToken");
    const expiresAt = localStorage.getItem("tokenExpiresAt");

    if (accessToken && expiresAt) {
      const expires = parseInt(expiresAt);
      this.scheduleRefresh(expires);
      console.log(
        `Token manager initialized. Token expires at: ${new Date(
          expires
        ).toLocaleString()}`
      );
    } else {
      console.log("No valid tokens found during initialization");
    }
  }

  // Obtener tiempo restante hasta la expiración
  getTimeUntilExpiry(): number | null {
    const expiresAt = localStorage.getItem("tokenExpiresAt");
    if (!expiresAt) return null;

    const expires = parseInt(expiresAt);
    const now = Date.now();
    return Math.max(0, expires - now);
  }

  // Verificar si el token necesita refresh pronto
  needsRefreshSoon(): boolean {
    const timeLeft = this.getTimeUntilExpiry();
    if (!timeLeft) return false;

    // Necesita refresh si quedan menos de X minutos
    return timeLeft < (this.REFRESH_BEFORE_EXPIRY_MINUTES + 5) * 60 * 1000;
  }
}

export const tokenManager = new TokenManager();
