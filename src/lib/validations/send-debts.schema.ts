import { z } from "zod";

/**
 * Schema para row de deuda individual (formato PYSE)
 * Corresponde al Excel con columnas: unidad, tel_uni, tel_clien, tipo_plan, etc.
 */
export const debtRowSchema = z.object({
  // Columnas requeridas del formato PYSE
  unidad: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Unidad debe ser un número válido mayor a 0",
    }),

  Cliente_01: z
    .string()
    .trim()
    .min(1, { message: "El nombre del cliente es requerido" })
    .max(200),

  tel_uni: z
    .union([z.string(), z.number()])
    .transform((val) => val?.toString().trim() || "")
    .optional(),

  tel_clien: z
    .union([z.string(), z.number()])
    .transform((val) => val?.toString().trim() || "")
    .optional(),

  tipo_plan: z.string().trim().optional(),

  plan_num: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .optional(),

  cod_mot_gen: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .optional(),

  Criterios: z.string().trim().optional(),

  contrato: z.string().trim().optional(),

  entrega: z.string().trim().optional(),

  situ_actual: z.string().trim().optional(),

  situ_uni: z.string().trim().optional(),

  cant_venci: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .optional(),

  cant_cuot: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .optional(),

  EjecutivoCta: z
    .union([z.string(), z.number()])
    .transform((val) => val?.toString().trim() || "")
    .optional(),

  // Campos opcionales adicionales
  barrio: z.string().trim().max(100).optional(),
  comprobantes_vencidos_aguas: z.number().optional(),
  totalDeuda: z.number().optional(),
});

/**
 * Schema para array de deudas (validar Excel completo)
 */
export const debtsDataSchema = z.array(debtRowSchema).min(1).max(10000, {
  message: "El archivo no puede contener más de 10,000 registros",
});

/**
 * Schema para opciones de envío de deudas
 */
export const sendDebtsOptionsSchema = z.object({
  enviarPdf: z.boolean().default(true),
  incluirMensajeAdicional: z.boolean().default(false),
  mensajeAdicional: z
    .string()
    .max(200, {
      message: "El mensaje adicional no debe superar los 200 caracteres",
    })
    .trim()
    .optional(),

  // Opcional: retraso entre mensajes (segundos)
  retardoEntreEnvios: z
    .number()
    .min(0)
    .max(10)
    .default(1)
    .optional()
    .describe("Retraso en segundos entre cada envío"),
});

/**
 * Schema para filtros de envío
 */
export const sendDebtsFiltersSchema = z.object({
  // Filtrar por rango de UF
  rangoUf: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
    })
    .optional()
    .refine(
      (data) => {
        if (data?.min !== undefined && data?.max !== undefined) {
          return data.min <= data.max;
        }
        return true;
      },
      { message: "El UF mínimo no puede ser mayor al máximo" }
    ),

  // Filtrar por barrio
  barrios: z.array(z.string().trim().max(100)).max(50).optional(),

  // Filtrar por rango de monto
  rangoMonto: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
    })
    .optional()
    .refine(
      (data) => {
        if (data?.min !== undefined && data?.max !== undefined) {
          return data.min <= data.max;
        }
        return true;
      },
      { message: "El monto mínimo no puede ser mayor al máximo" }
    ),
});

export type DebtRow = z.infer<typeof debtRowSchema>;
export type DebtsData = z.infer<typeof debtsDataSchema>;
export type SendDebtsOptions = z.infer<typeof sendDebtsOptionsSchema>;
export type SendDebtsFilters = z.infer<typeof sendDebtsFiltersSchema>;
