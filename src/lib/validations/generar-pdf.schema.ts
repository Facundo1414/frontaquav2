import { z } from "zod";

/**
 * Enum de tipos de PDF permitidos
 */
export const TipoPdfEnum = z.enum(["AVISO", "NOTIFICACION", "INTIMACION"]);

/**
 * Schema para comprobante individual en PDF
 */
export const comprobanteSchema = z.object({
  numero: z
    .union([z.string(), z.number()])
    .transform((val) => val.toString().trim())
    .refine((val) => val.length > 0, {
      message: "Número de comprobante requerido",
    }),

  monto: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 999999999, {
      message: "El monto debe ser un número válido entre 0 y 999,999,999",
    }),

  vencimiento: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, {
      message: "La fecha debe tener formato DD/MM/YYYY",
    })
    .refine(
      (dateStr) => {
        const [day, month, year] = dateStr.split("/").map(Number);
        const date = new Date(year, month - 1, day);
        return (
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
        );
      },
      { message: "Fecha inválida" }
    ),
});

/**
 * Schema para solicitud de generación de PDF individual
 */
export const generarPdfSchema = z.object({
  tipo: TipoPdfEnum,

  uf: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val) && val > 0 && val <= 999999999, {
      message: "UF debe ser un número válido entre 1 y 999,999,999",
    }),

  nombre: z
    .string()
    .trim()
    .min(1, { message: "El nombre es requerido" })
    .max(100),

  direccion: z
    .string()
    .trim()
    .min(1, { message: "La dirección es requerida" })
    .max(200),

  barrio: z.string().trim().max(100).optional(),

  comprobantes: z
    .array(comprobanteSchema)
    .min(1, { message: "Debe incluir al menos 1 comprobante" })
    .max(100, { message: "Máximo 100 comprobantes por PDF" }),

  fechaGeneracion: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, {
      message: "La fecha debe tener formato DD/MM/YYYY",
    })
    .optional(),
});

/**
 * Schema para generación masiva de PDFs
 */
export const generarBulkPdfSchema = z.object({
  pdfs: z
    .array(generarPdfSchema)
    .min(1, { message: "Debe incluir al menos 1 PDF" })
    .max(500, { message: "Máximo 500 PDFs por lote" }),

  opciones: z
    .object({
      // Comprimir PDFs en ZIP
      comprimirEnZip: z.boolean().default(false),

      // Nombre del archivo ZIP (si se comprime)
      nombreZip: z
        .string()
        .trim()
        .max(100)
        .regex(/^[a-zA-Z0-9_-]+$/, {
          message:
            "El nombre del ZIP solo puede contener letras, números, guiones y guiones bajos",
        })
        .optional(),

      // Incluir marca de agua
      marcaDeAgua: z.boolean().default(false),
    })
    .optional(),
});

/**
 * Schema para opciones de generación de PDF
 */
export const pdfOptionsSchema = z.object({
  incluirQr: z.boolean().default(false),
  incluirLogotipo: z.boolean().default(true),
  tamanioPagina: z.enum(["A4", "LETTER"]).default("A4"),
  orientacion: z.enum(["portrait", "landscape"]).default("portrait"),
});

export type TipoPdf = z.infer<typeof TipoPdfEnum>;
export type Comprobante = z.infer<typeof comprobanteSchema>;
export type GenerarPdfInput = z.infer<typeof generarPdfSchema>;
export type GenerarBulkPdfInput = z.infer<typeof generarBulkPdfSchema>;
export type PdfOptions = z.infer<typeof pdfOptionsSchema>;
