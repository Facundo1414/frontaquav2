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
 * **Sistema Centralizado (whatsapp-worker en puerto 3002):**
 * - Todos los usuarios usan este sistema
 * - Polling HTTP cada 30s a /wa/state (un solo polling para toda la app)
 * - Límite: 300 mensajes/día por usuario
 * - Horario: 9-16hs
 *
 * **Admin con cuenta propia (opcional):**
 * - Puede elegir usar su propia cuenta WhatsApp
 * - También usa whatsapp-web.js
 * - Sin límites de 300 msg/día
 */

import { useWhatsAppUnifiedContext } from '@/app/providers/context/WhatsAppUnifiedContext';

export function useWhatsAppUnified() {
  return useWhatsAppUnifiedContext();
}
