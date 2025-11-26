import { z } from "zod";

/**
 * Schema para datos de proximidad de vencimiento
 */
export const proximosVencerFormSchema = z.object({
  diasAnticipacion: z
    .number({ message: "Los días deben ser un número" })
    .min(1, { message: "Mínimo 1 día de anticipación" })
    .max(30, { message: "Máximo 30 días de anticipación" })
    .int({ message: "Los días deben ser un número entero" }),

  mensaje: z
    .string()
    .min(10, { message: "El mensaje debe tener al menos 10 caracteres" })
    .max(500, { message: "El mensaje no debe superar los 500 caracteres" })
    .trim()
    .transform((val) => val.replace(/\s+/g, " ")), // Normalizar espacios

  // Opcional: filtros adicionales
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

/**
 * Schema para validación de datos cargados desde Excel
 * Usa el mismo formato PYSE que senddebts para consistencia
 */
export const proximosVencerRowSchema = z.object({
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

  contrato: z
    .union([z.string(), z.number()])
    .transform((val) => val?.toString().trim() || "")
    .optional(),

  entrega: z
    .union([z.string(), z.number()])
    .transform((val) => val?.toString().trim() || "")
    .optional(),

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

export const proximosVencerDataSchema = z
  .array(proximosVencerRowSchema)
  .min(1)
  .max(10000, {
    message: "El archivo no puede contener más de 10,000 registros",
  });

export type ProximosVencerFormInput = z.infer<typeof proximosVencerFormSchema>;
export type ProximosVencerRow = z.infer<typeof proximosVencerRowSchema>;
export type ProximosVencerData = z.infer<typeof proximosVencerDataSchema>;
