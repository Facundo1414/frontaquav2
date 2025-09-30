"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getAccessToken } from "@/utils/authToken";

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    // Evitar loops: no hacer nada en /login y sólo verificar una vez
    const isBrowser = typeof window !== "undefined";
    const onLoginRoute =
      isBrowser && window.location.pathname.startsWith("/login");
    if (onLoginRoute) return;

    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
    }
  }, [router]);
}
