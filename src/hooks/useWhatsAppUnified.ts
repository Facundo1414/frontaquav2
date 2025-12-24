/**
 * 🔗 useWhatsAppUnified
 *
 * Hook unificado para obtener estado de WhatsApp
 *
 * **MIGRADO A CONTEXT API (2025-01-XX)**
 *
 * Este hook ahora es un wrapper del Context Provider para mantener
 * compatibilidad con el código existente.
 *
 * **Importante:** Asegúrate de tener <WhatsAppUnifiedProvider> en tu árbol de componentes.
 *
 * **Sistema Centralizado (WhatsApp Cloud API):**
 * - Todos los usuarios usan este sistema
 * - Usa la API oficial de Meta (WhatsApp Business API)
 * - Límite: 300 mensajes/día por usuario
 * - Horario: 9-16hs
 *
 * **Admin con cuenta propia (opcional):**
 * - Puede elegir usar su propia cuenta WhatsApp
 * - Sin límites de 300 msg/día
 */

import { useWhatsAppUnifiedContext } from "@/app/providers/context/WhatsAppUnifiedContext";

export function useWhatsAppUnified() {
  return useWhatsAppUnifiedContext();
}
