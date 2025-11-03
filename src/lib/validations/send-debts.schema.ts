import { z } from "zod";

/**
 * Schema para row de deuda individual
 */
export const debtRowSchema = z.object({
  uf: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "UF debe ser un número válido mayor a 0",
    }),

  nombre: z
    .string()
    .trim()
    .min(1, { message: "El nombre es requerido" })
    .max(100),

  nroComprobante: z
    .union([z.string(), z.number()])
    .transform((val) => val.toString().trim()),

  monto: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "El monto debe ser un número válido",
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

  telefono: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, {
      message: "El teléfono debe tener entre 10 y 15 dígitos",
    })
    .optional(),

  // Campos opcionales
  barrio: z.string().trim().max(100).optional(),
  sector: z.string().trim().max(50).optional(),
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
