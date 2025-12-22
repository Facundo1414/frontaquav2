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
   * Navega a la ruta especificada (sin validaciones - ahora usa WhatsApp Cloud API)
   * @param targetPath - Ruta de destino (/senddebts, /proximos-vencer, etc.)
   * @param setModalVisible - Callback (no usado, mantener por compatibilidad)
   */
  const navigateWithWhatsappCheck = useCallback(
    (targetPath: string, setModalVisible?: (v: boolean) => void) => {
      // Con WhatsApp Cloud API no se requiere validación de sesión
      router.push(targetPath);
    },
    [router]
  );

  return {
    navigateWithWhatsappCheck,
    userMode,
    isReady,
    isAdmin,
  };
}
