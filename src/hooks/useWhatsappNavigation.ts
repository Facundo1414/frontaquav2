import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWhatsappSessionContext } from "@/app/providers/context/whatsapp/WhatsappSessionContext";
import { useGlobalContext } from "@/app/providers/context/GlobalContext";

/**
 * Hook para centralizar la lógica de validación de sesión WhatsApp antes de navegar
 * Elimina duplicación de código en múltiples handlers de navegación
 */
export function useWhatsappNavigation() {
  const router = useRouter();
  const { snapshot } = useWhatsappSessionContext();
  const { userId } = useGlobalContext();

  // Leer userMode desde localStorage
  const [userMode] = useState<"system" | "personal">(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem("whatsapp_mode") as "system" | "personal") ||
        "system"
      );
    }
    return "system";
  });

  // Verificar si es admin
  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || "";
  const isAdmin = userId === ADMIN_UID;
  const isReady = !!snapshot?.ready;

  /**
   * Navega a la ruta especificada validando sesión WhatsApp según el modo del usuario
   * @param targetPath - Ruta de destino (/senddebts, /proximos-vencer, etc.)
   * @param setModalVisible - Callback para mostrar modal de QR si es necesario (NO USADO, mantener por compatibilidad)
   */
  const navigateWithWhatsappCheck = useCallback(
    (targetPath: string, setModalVisible: (v: boolean) => void) => {
      // CASO 1: Modo personal - TODOS (incluido admin) deben usar su sesión personal
      if (userMode === "personal") {
        if (!isReady) {
          // Toast genérico para cualquier usuario (admin o no) - NO redirigir, NO abrir modal
          toast.warning(
            "⚠️ Necesitás iniciar sesión de WhatsApp personal. Usá el botón 'Conectar WhatsApp' en el inicio.",
            {
              duration: 6000,
            }
          );
          return;
        }
        router.push(targetPath);
        return;
      }

      // CASO 2: Modo sistema - requiere WhatsApp del sistema (celular prepago)
      if (userMode === "system") {
        // Si NO está listo el sistema
        if (!isReady) {
          // Si es admin: redirigir a admin para conectar el sistema
          if (isAdmin) {
            toast.error(
              "❌ Deberás iniciar sesión al WhatsApp del sistema para continuar. Redirigiendo al panel de admin...",
              {
                duration: 5000,
              }
            );
            router.push("/admin");
            return;
          }

          // Si es usuario normal: solo avisar, NO tiene acceso a admin
          toast.error(
            "❌ El administrador deberá iniciar sesión al WhatsApp del sistema para continuar. Contactá al administrador.",
            {
              duration: 6000,
            }
          );
          return;
        }

        // Sistema listo: redirige directo
        router.push(targetPath);
        return;
      }

      // Fallback: modo sistema por defecto
      router.push(targetPath);
    },
    [userMode, isAdmin, isReady, router]
  );

  return {
    navigateWithWhatsappCheck,
    userMode,
    isReady,
    isAdmin,
  };
}
