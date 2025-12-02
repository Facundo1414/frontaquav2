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
   * @param setModalVisible - Callback para mostrar modal de QR si es necesario
   */
  const navigateWithWhatsappCheck = useCallback(
    (targetPath: string, setModalVisible: (v: boolean) => void) => {
      // CASO 1: Usuario modo personal - necesita su propia sesión (incluye admin si elige modo personal)
      if (userMode === "personal") {
        if (!isReady) {
          setModalVisible(true); // Mostrar modal para escanear su QR personal
          return;
        }
        router.push(targetPath);
        return;
      }

      // CASO 2: Usuario modo sistema (por defecto para todos, incluye admin)
      if (userMode === "system") {
        // Si es admin, verificar que el sistema esté listo
        if (isAdmin && !isReady) {
          toast.error(
            "❌ El WhatsApp del sistema no está conectado. Necesitás conectar el celular prepago primero.",
            {
              duration: 5000,
            }
          );
          // NO abrir modal de QR - redirigir a admin para que conecte el sistema
          router.push("/admin");
          return;
        }

        // Usuario normal o admin en modo sistema: redirige directo
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
