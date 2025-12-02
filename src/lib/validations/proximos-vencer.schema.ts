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
    })
    .refine((val) => val >= 100000 && val <= 99999999, {
      message: "UF debe tener entre 6 y 8 dígitos",
    }),

  Cliente_01: z
    .string()
    .trim()
    .min(1, { message: "El nombre del cliente es requerido" })
    .max(200)
    .refine((val) => val.length >= 3, {
      message: "El nombre debe tener al menos 3 caracteres",
    }),

  tel_uni: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const str = val?.toString().trim() || "";
      // Limpiar caracteres no numéricos excepto + inicial
      return str.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
    })
    .refine(
      (val) => {
        if (!val) return true; // Opcional
        // Regex: opcional +, luego 8-15 dígitos
        return /^\+?[0-9]{8,15}$/.test(val);
      },
      {
        message:
          "Teléfono inválido (debe tener 8-15 dígitos, opcionalmente + al inicio)",
      }
    )
    .optional(),

  tel_clien: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const str = val?.toString().trim() || "";
      // Limpiar caracteres no numéricos excepto + inicial
      return str.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
    })
    .refine(
      (val) => {
        if (!val) return true; // Opcional
        return /^\+?[0-9]{8,15}$/.test(val);
      },
      {
        message:
          "Teléfono inválido (debe tener 8-15 dígitos, opcionalmente + al inicio)",
      }
    )
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
  .min(1, { message: "El archivo debe contener al menos 1 registro" })
  .max(1000, {
    message:
      "El archivo no puede contener más de 1,000 registros por motivos de rendimiento",
  })
  .refine(
    (data) => {
      // Validar que no haya UFs duplicadas
      const ufs = data.map((row) => row.unidad);
      const uniqueUfs = new Set(ufs);
      return ufs.length === uniqueUfs.size;
    },
    {
      message:
        "El archivo contiene UFs duplicadas. Cada UF debe aparecer una sola vez.",
    }
  )
  .refine(
    (data) => {
      // Validar que al menos haya 1 cliente con teléfono válido
      const conTelefono = data.filter(
        (row) =>
          (row.tel_uni && /^\+?[0-9]{8,15}$/.test(row.tel_uni)) ||
          (row.tel_clien && /^\+?[0-9]{8,15}$/.test(row.tel_clien))
      );
      return conTelefono.length > 0;
    },
    {
      message:
        "El archivo debe contener al menos 1 cliente con número de teléfono válido",
    }
  );

export type ProximosVencerFormInput = z.infer<typeof proximosVencerFormSchema>;
export type ProximosVencerRow = z.infer<typeof proximosVencerRowSchema>;
export type ProximosVencerData = z.infer<typeof proximosVencerDataSchema>;

/**
 * 🛡️ Validador helper para detectar problemas específicos en los datos
 * Retorna un resumen detallado de errores por fila
 */
export function validateProximosVencerData(data: any[]): {
  valid: boolean;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    withPhone: number;
    withoutPhone: number;
    duplicateUfs: number;
  };
  errors: Array<{
    row: number;
    uf: string | number;
    cliente: string;
    errors: string[];
  }>;
} {
  const summary = {
    total: data.length,
    valid: 0,
    invalid: 0,
    withPhone: 0,
    withoutPhone: 0,
    duplicateUfs: 0,
  };

  const errors: Array<{
    row: number;
    uf: string | number;
    cliente: string;
    errors: string[];
  }> = [];

  const ufsSet = new Set<number>();
  const duplicateUfsSet = new Set<number>();

  data.forEach((row, index) => {
    const rowErrors: string[] = [];
    const rowNumber = index + 2; // +2 porque Excel empieza en 1 y la primera es header

    // Validar UF
    const ufRaw = row.unidad || row.UF || row.uf || row[0];
    const uf = typeof ufRaw === "string" ? parseInt(ufRaw, 10) : ufRaw;

    if (!uf || isNaN(uf) || uf <= 0) {
      rowErrors.push("UF inválida o vacía");
    } else if (uf < 100000 || uf > 99999999) {
      rowErrors.push("UF debe tener entre 6 y 8 dígitos");
    } else if (ufsSet.has(uf)) {
      rowErrors.push("UF duplicada en el archivo");
      duplicateUfsSet.add(uf);
      summary.duplicateUfs++;
    } else {
      ufsSet.add(uf);
    }

    // Validar Cliente
    const cliente = row.Cliente_01 || row.cliente || row[13] || "";
    if (!cliente || cliente.toString().trim().length < 3) {
      rowErrors.push("Nombre de cliente inválido (mínimo 3 caracteres)");
    }

    // Validar Teléfono (al menos uno debe ser válido)
    const telUni = (row.tel_uni || "").toString().replace(/[^\d+]/g, "");
    const telClien = (row.tel_clien || "").toString().replace(/[^\d+]/g, "");

    const telUniValid = /^\+?[0-9]{8,15}$/.test(telUni);
    const telClienValid = /^\+?[0-9]{8,15}$/.test(telClien);

    if (!telUniValid && !telClienValid) {
      rowErrors.push(
        "Sin teléfono válido (debe tener 8-15 dígitos en tel_uni o tel_clien)"
      );
      summary.withoutPhone++;
    } else {
      summary.withPhone++;
    }

    if (rowErrors.length > 0) {
      summary.invalid++;
      errors.push({
        row: rowNumber,
        uf: uf || ufRaw || "N/A",
        cliente: cliente.toString().substring(0, 30),
        errors: rowErrors,
      });
    } else {
      summary.valid++;
    }
  });

  return {
    valid: summary.invalid === 0 && summary.withPhone > 0,
    summary,
    errors,
  };
}
