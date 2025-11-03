/**
 * 🚀 OPTIMIZED QRCODE UTILITIES
 *
 * Lazy-loaded QRCode library to reduce initial bundle size.
 * QRCode es ~50KB - solo cargar cuando se necesita generar QR.
 *
 * Usage:
 * ```tsx
 * import { generateQRCode } from '@/lib/qrcode'
 *
 * const qrDataURL = await generateQRCode('https://example.com')
 * ```
 */

/**
 * Generate QR code as Data URL
 * @param text Text to encode in QR
 * @param options QRCode options
 * @returns Promise<string> - Data URL (base64)
 */
export async function generateQRCode(
  text: string,
  options?: {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  }
): Promise<string> {
  // Lazy load QRCode only when needed
  const QRCode = await import("qrcode");

  return QRCode.toDataURL(text, {
    width: options?.width || 256,
    margin: options?.margin || 2,
    errorCorrectionLevel: options?.errorCorrectionLevel || "M",
  });
}

/**
 * Generate QR code as Canvas
 * @param canvas Canvas element reference
 * @param text Text to encode
 */
export async function generateQRCodeToCanvas(
  canvas: HTMLCanvasElement,
  text: string
): Promise<void> {
  const QRCode = await import("qrcode");
  await QRCode.toCanvas(canvas, text, { width: 256, margin: 2 });
}
