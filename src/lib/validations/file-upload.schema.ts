import { z } from "zod";

/**
 * Schema para validación de archivos Excel
 * Valida tamaño, extensión y tipo MIME
 */
export const excelFileSchema = z.object({
  file: z
    .instanceof(File, { message: "Debe seleccionar un archivo" })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "El archivo no debe superar los 10 MB",
    })
    .refine(
      (file) => {
        const validExtensions = [".xlsx", ".xls"];
        return validExtensions.some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        );
      },
      { message: "El archivo debe ser un Excel (.xlsx o .xls)" }
    )
    .refine(
      (file) => {
        const validMimeTypes = [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          "application/vnd.ms-excel", // .xls
        ];
        return validMimeTypes.includes(file.type);
      },
      { message: "Tipo de archivo inválido" }
    ),
});

/**
 * Schema para validación de PDFs
 */
export const pdfFileSchema = z.object({
  file: z
    .instanceof(File, { message: "Debe seleccionar un archivo" })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "El archivo no debe superar los 5 MB",
    })
    .refine((file) => file.name.toLowerCase().endsWith(".pdf"), {
      message: "El archivo debe ser un PDF",
    })
    .refine((file) => file.type === "application/pdf", {
      message: "Tipo de archivo inválido",
    }),
});

/**
 * Schema para validación de imágenes (para envío por WhatsApp)
 */
export const imageFileSchema = z.object({
  file: z
    .instanceof(File, { message: "Debe seleccionar un archivo" })
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: "La imagen no debe superar los 2 MB",
    })
    .refine(
      (file) => {
        const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];
        return validExtensions.some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        );
      },
      { message: "El archivo debe ser una imagen (.jpg, .png, .webp)" }
    )
    .refine(
      (file) => {
        const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];
        return validMimeTypes.includes(file.type);
      },
      { message: "Tipo de imagen inválido" }
    ),
});

export type ExcelFileInput = z.infer<typeof excelFileSchema>;
export type PdfFileInput = z.infer<typeof pdfFileSchema>;
export type ImageFileInput = z.infer<typeof imageFileSchema>;
