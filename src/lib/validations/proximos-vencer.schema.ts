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
 */
export const proximosVencerRowSchema = z.object({
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
