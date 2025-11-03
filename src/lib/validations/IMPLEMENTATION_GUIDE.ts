/**
 * Ejemplo de uso de validación con Zod en StepUploadFile
 *
 * Este archivo muestra cómo integrar los schemas de validación
 * en el componente existente de carga de archivos.
 *
 * INSTRUCCIONES DE IMPLEMENTACIÓN:
 * ================================
 *
 * 1. Importar schemas y utilidades:
 *
 * ```typescript
 * import { excelFileSchema } from '@/lib/validations/file-upload.schema'
 * import { debtsDataSchema } from '@/lib/validations/send-debts.schema'
 * import { validateExcelFile, sanitizeObject } from '@/lib/validations/validation-utils'
 * import { useFileValidation } from '@/hooks/useValidation'
 * ```
 *
 * 2. Usar el hook de validación:
 *
 * ```typescript
 * const { validateFile, fileError, clearFileError } = useFileValidation()
 * ```
 *
 * 3. Validar archivo antes de procesarlo:
 *
 * ```typescript
 * const processFile = async (selected: File) => {
 *   // Validar archivo con schema de Zod
 *   const isValid = validateFile(selected, validateExcelFile)
 *
 *   if (!isValid) {
 *     toast.error(fileError || 'Archivo inválido')
 *     return
 *   }
 *
 *   clearFileError()
 *   setFile(selected)
 *
 *   const fileData = await selected.arrayBuffer()
 *   const blob = new Blob([fileData], { type: selected.type })
 *   const parsedData = await parseExcelBlob(blob)
 *
 *   // Validar datos parseados con schema
 *   const validation = debtsDataSchema.safeParse(parsedData)
 *
 *   if (!validation.success) {
 *     toast.error('El archivo contiene datos inválidos')
 *     console.error(validation.error)
 *     return
 *   }
 *
 *   // Sanitizar datos antes de guardarlos
 *   const sanitizedData = validation.data.map(row => sanitizeObject(row))
 *   setRawData(sanitizedData)
 *   setActiveStep(0)
 * }
 * ```
 *
 * 4. Mostrar errores de validación:
 *
 * ```tsx
 * {fileError && (
 *   <div className="text-sm text-red-600 mt-2">
 *     {fileError}
 *   </div>
 * )}
 * ```
 *
 * 5. Validar antes de subir al backend:
 *
 * ```typescript
 * const handleUpload = async () => {
 *   if (!file) return toast.error('Seleccioná un archivo primero')
 *
 *   // Re-validar antes de enviar
 *   const isValid = validateFile(file, validateExcelFile)
 *   if (!isValid) {
 *     toast.error(fileError || 'Archivo inválido')
 *     return
 *   }
 *
 *   try {
 *     setUploading(true)
 *     const formData = new FormData()
 *     formData.append('file', file)
 *
 *     // ... resto del código de upload
 *   } catch (err) {
 *     console.error(err)
 *     toast.error('Error al procesar el archivo')
 *   } finally {
 *     setUploading(false)
 *   }
 * }
 * ```
 *
 * BENEFICIOS:
 * ===========
 * - ✅ Validación client-side antes de enviar al servidor
 * - ✅ Prevención de archivos maliciosos o corruptos
 * - ✅ Sanitización automática de datos
 * - ✅ Mensajes de error claros para el usuario
 * - ✅ Prevención de ataques XSS/injection
 * - ✅ Validación de tipos y rangos de datos
 *
 * SEGURIDAD:
 * ==========
 * - Validación de tamaño de archivo (máx 10 MB)
 * - Validación de extensión (.xlsx, .xls)
 * - Validación de MIME type
 * - Sanitización de strings (eliminación de < > y espacios extra)
 * - Validación de estructura de datos con Zod
 * - Límite de 10,000 registros por archivo
 */

export {};
