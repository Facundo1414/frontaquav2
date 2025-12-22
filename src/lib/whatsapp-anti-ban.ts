/**
 * 🛡️ UTILIDADES ANTI-BAN WHATSAPP
 *
 * Sistema de protección para operadores humanos que envían mensajes
 * manualmente desde WhatsApp Web, con el objetivo de evitar bloqueos.
 */

export interface MessageVariant {
  id: number;
  greeting: string;
  mainText: string;
  paymentMethods: string;
  closing: string;
  disclaimer?: string;
}

// 📝 6 variantes de mensajes realmente diferentes
export const MESSAGE_VARIANTS: MessageVariant[] = [
  {
    id: 1,
    greeting: "Hola",
    mainText:
      "te comparto el comprobante actualizado de tu cuota del plan de pagos.",
    paymentMethods: "Podés abonar por Mercado Pago, Rapipago o Pago Fácil.",
    closing: "🌐 Cclip • Al servicio de Aguas Cordobesas",
    disclaimer: "Si ya realizaste el pago, podés ignorar este mensaje.",
  },
  {
    id: 2,
    greeting: "Buen día",
    mainText:
      "te envío el detalle de la cuota del plan de pagos que tenés pendiente.",
    paymentMethods: "Se puede pagar en Mercado Pago, Rapipago y Pago Fácil.",
    closing: "🌐 Cclip • Aguas Cordobesas",
  },
  {
    id: 3,
    greeting: "Hola, ¿cómo estás?",
    mainText: "Te paso el comprobante de la cuota de tu plan de pagos.",
    paymentMethods:
      "Lo podés abonar por Mercado Pago, Rapipago o Pago Fácil antes del vencimiento.",
    closing: "Saludos, Cclip - Aguas Cordobesas",
    disclaimer:
      "En caso de que ya hayas abonado, no te preocupes por este mensaje.",
  },
  {
    id: 4,
    greeting: "Buenos días",
    mainText: "te mando el estado actualizado de tu cuota del plan.",
    paymentMethods:
      "Recordá que podés pagar en Mercado Pago, Rapipago y Pago Fácil.",
    closing: "🌐 Cclip al servicio de Aguas Cordobesas",
  },
  {
    id: 5,
    greeting: "Hola",
    mainText:
      "te adjunto el comprobante de la cuota de tu plan de pagos vigente.",
    paymentMethods: "Aceptamos Mercado Pago, Rapipago y Pago Fácil.",
    closing: "Cclip • Aguas Cordobesas",
    disclaimer: "Si ya abonaste, podés hacer caso omiso a este aviso.",
  },
  {
    id: 6,
    greeting: "Buenas tardes",
    mainText: "te comparto la información de tu cuota del plan de pagos.",
    paymentMethods: "Para abonar: Mercado Pago, Rapipago o Pago Fácil.",
    closing: "🌐 Cclip - Al servicio de Aguas Cordobesas",
  },
];

/**
 * Seleccionar variante de mensaje de forma secuencial
 * Cambia cada 4-5 clientes para no repetir el mismo patrón
 */
export class MessageVariantSelector {
  private static currentIndex = 0;
  private static messagesSinceLastChange = 0;
  private static nextChangeThreshold = Math.floor(Math.random() * 2) + 4; // 4 o 5

  static getNextVariant(clientName: string): {
    text: string;
    variantId: number;
  } {
    // Rotar cada 4-5 mensajes
    if (this.messagesSinceLastChange >= this.nextChangeThreshold) {
      this.currentIndex = (this.currentIndex + 1) % MESSAGE_VARIANTS.length;
      this.messagesSinceLastChange = 0;
      this.nextChangeThreshold = Math.floor(Math.random() * 2) + 4; // Nuevo threshold
    }

    this.messagesSinceLastChange++;

    const variant = MESSAGE_VARIANTS[this.currentIndex];

    // Construir mensaje completo
    const parts = [
      `${variant.greeting} ${clientName},`,
      variant.mainText,
      variant.paymentMethods,
      "",
      variant.closing,
    ];

    // Agregar disclaimer si existe (1 de cada 2)
    if (variant.disclaimer && Math.random() > 0.5) {
      parts.splice(3, 0, variant.disclaimer);
    }

    const fullMessage = parts.filter(Boolean).join("\n");

    return {
      text: fullMessage,
      variantId: variant.id,
    };
  }

  static reset() {
    this.currentIndex = 0;
    this.messagesSinceLastChange = 0;
    this.nextChangeThreshold = Math.floor(Math.random() * 2) + 4;
  }
}

/**
 * Generar delay recomendado entre envíos (en segundos)
 */
export function getRecommendedDelay(): number {
  // Entre 15 y 45 segundos
  return Math.floor(Math.random() * 30) + 15;
}

/**
 * Obtener franja horaria actual
 */
export function getCurrentTimeSlot(): string {
  const hour = new Date().getHours();

  if (hour >= 8 && hour < 11) return "mañana";
  if (hour >= 11 && hour < 14) return "media mañana";
  if (hour >= 14 && hour < 18) return "tarde";
  if (hour >= 18 && hour < 21) return "noche";

  return "fuera de horario";
}

/**
 * Verificar si estamos en horario recomendado (8am - 9pm)
 */
export function isWithinRecommendedHours(): boolean {
  const hour = new Date().getHours();
  return hour >= 8 && hour <= 21;
}

/**
 * Obtener mensaje de advertencia si es fuera de horario
 */
export function getTimeWarning(): string | null {
  const hour = new Date().getHours();

  if (hour < 8) {
    return "⚠️ Es muy temprano (antes de 8am). Se recomienda esperar para evitar molestias.";
  }

  if (hour > 21) {
    return "⚠️ Es muy tarde (después de 9pm). Se recomienda continuar mañana.";
  }

  return null;
}

/**
 * Formatear tiempo restante para mostrar
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "Listo";
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}
