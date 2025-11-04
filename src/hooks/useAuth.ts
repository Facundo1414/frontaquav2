import { useState, useCallback, useEffect, useRef } from "react";
import { userLogin, checkValidateToken } from "../lib/api";
import { useGlobalContext } from "@/app/providers/context/GlobalContext";
import { useRouter } from "next/navigation";
import { tokenManager } from "@/lib/tokenManager";

export const useAuth = () => {
  const { setAccessToken, setRefreshToken, setUsernameGlobal } =
    useGlobalContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsSubmitting(true);
      try {
        const result = await userLogin(email, password);

        setAccessToken(result.accessToken);
        setRefreshToken(result.refreshToken);
        setUsernameGlobal(result.user.email || email);

        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken);
        localStorage.setItem("username", result.user.email || email);

        // Configurar el token manager con los nuevos tokens
        tokenManager.setTokens(result.accessToken, result.refreshToken);

        // Setear cookie para middleware
        document.cookie = `auth-token=${result.accessToken}; path=/; max-age=86400; SameSite=Strict`;

        console.log("✅ Login exitoso, redirigiendo a /home...");

        return { success: true, username: result.user.email || email };
      } catch (error: any) {
        console.error("❌ Error en login:", error);
        return {
          success: false,
          message: error?.response?.data?.message || "Error en login",
        };
      } finally {
        setIsSubmitting(false);
      }
    },
    [setAccessToken, setRefreshToken, setUsernameGlobal]
  );

  const checkAuth = useCallback(async () => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    // Primero intentar refrescar el token si es necesario
    try {
      await tokenManager.refreshTokenIfNeeded();
    } catch (error) {
      console.warn("Token refresh failed during auth check:", error);
    }

    const isValid = await checkValidateToken();
    if (!isValid) {
      tokenManager.clearTokens();
      router.push("/login");
    }
  }, [router]);

  return { login, isSubmitting, checkAuth };
};
