'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Loader2, AlertTriangle } from 'lucide-react'
import {
  uploadExcelFile,
  getFileByName,
} from '@/lib/api'
import { parseExcelBlob, parseExcelBlobWithIndexMapping } from '@/utils/parseExcelBlob'
import { useProximosVencerContext } from '@/app/providers/context/ProximosVencerContext'
import { proximosVencerDataSchema, validateProximosVencerData } from '@/lib/validations/proximos-vencer.schema'
import { validateExcelFile, sanitizeObject } from '@/lib/validations/validation-utils'
import { useFileValidation } from '@/hooks/useValidation'
import { ValidationPreviewProximosVencer } from './ValidationPreviewProximosVencer'
import { logger } from '@/lib/logger';

export default function StepUploadFileProximosVencer() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showValidationPreview, setShowValidationPreview] = useState(false)
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateProximosVencerData> | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { setActiveStep, setRawData, setFilteredData, setFileNameFiltered, setNotWhatsappData } = useProximosVencerContext()

  // 🛡️ Hook de validación
  const { validateFile, fileError, clearFileError } = useFileValidation()

  const processFile = async (selected: File) => {
    // 🛡️ Validar archivo
    const isValid = validateFile(selected, validateExcelFile)
    
    if (!isValid) {
      toast.error(fileError || 'Archivo inválido')
      return
    }

    clearFileError()
    setFile(selected)

    try {
      const fileData = await selected.arrayBuffer()
      const blob = new Blob([fileData], { type: selected.type })
      const parsedData = await parseExcelBlob(blob)

      // 🛡️ Validar contenido del Excel con helper detallado
      const detailedValidation = validateProximosVencerData(parsedData)
      
      logger.log('🔍 Validación detallada:', detailedValidation)

      // Si hay errores críticos o no hay clientes con teléfono, mostrar preview
      if (!detailedValidation.valid || detailedValidation.summary.withPhone === 0) {
        setValidationResult(detailedValidation)
        setShowValidationPreview(true)
        toast.warning('Se detectaron problemas en el archivo. Revisá el resumen.')
        return
      }

      // Si hay advertencias (algunos sin WhatsApp pero al menos 1 válido), mostrar preview opcional
      if (detailedValidation.summary.withoutPhone > 0 || detailedValidation.errors.length > 0) {
        setValidationResult(detailedValidation)
        setShowValidationPreview(true)
        toast.info('Archivo cargado con advertencias. Revisá el resumen antes de continuar.')
        return
      }

      // 🛡️ Validación con Zod schema (fallback)
      const validation = proximosVencerDataSchema.safeParse(parsedData)
      
      if (!validation.success) {
        console.error('Error de validación Zod:', validation.error)
        toast.error('El archivo contiene datos inválidos. Verifica el formato.')
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      // 🛡️ Sanitizar datos
      const sanitizedData = validation.data.map((row: any) => sanitizeObject(row))
      setRawData(sanitizedData)
      setActiveStep(0)
      toast.success('Archivo cargado correctamente')
    } catch (error) {
      console.error('Error al procesar archivo:', error)
      toast.error('Error al procesar el archivo')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    await processFile(selected)
  }

  const handleUpload = async () => {
    if (!file) return toast.error('Seleccioná un archivo primero')

    // 🛡️ Re-validar antes de enviar
    const isValid = validateFile(file, validateExcelFile)
    if (!isValid) {
      toast.error(fileError || 'Archivo inválido')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      toast.info('Archivo subido. Procesando...')

      const response = await uploadExcelFile(formData)
      const fileWithNoWsp = response.savedFileNames?.[0]
      const savedFile = response.savedFileNames?.[1]

      if (!savedFile) throw new Error('No se recibió el nombre del archivo procesado')

      setFileNameFiltered(savedFile)
      setNotWhatsappData(fileWithNoWsp)
      const blob = await getFileByName(savedFile)
      const parsedData = await parseExcelBlobWithIndexMapping(blob)

      setFilteredData(parsedData)
      toast.success('Archivo procesado correctamente')
      setActiveStep(1)
    } catch (err) {
      console.error(err)
      toast.error('Error al procesar el archivo')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setFile(null)
    setRawData([])
    setShowValidationPreview(false)
    setValidationResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleContinueAfterValidation = async () => {
    if (!file || !validationResult) return

    setShowValidationPreview(false)

    // Continuar con el flujo normal
    try {
      const fileData = await file.arrayBuffer()
      const blob = new Blob([fileData], { type: file.type })
      const parsedData = await parseExcelBlob(blob)

      // Sanitizar y guardar datos (el backend filtrará los sin WhatsApp)
      const sanitizedData = parsedData.map((row: any) => sanitizeObject(row))
      setRawData(sanitizedData)
      toast.success(`Archivo cargado: ${validationResult.summary.withPhone} cliente(s) con WhatsApp`)
    } catch (error) {
      console.error('Error al procesar archivo:', error)
      toast.error('Error al procesar el archivo')
      handleCancel()
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      await processFile(droppedFile)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex flex-col relative"
    >
      {/* Vista de Validación Preview */}
      {showValidationPreview && validationResult && (
        <div className="absolute inset-0 z-50 bg-white p-6 overflow-y-auto">
          <ValidationPreviewProximosVencer
            summary={validationResult.summary}
            errors={validationResult.errors}
            onContinue={handleContinueAfterValidation}
            onCancel={handleCancel}
            canContinue={validationResult.summary.withPhone > 0}
          />
        </div>
      )}

      {/* Overlay de filtrado (igual estilo que el de envío) */}
      {uploading && (
        <div className="absolute inset-0 z-50 flex flex-col justify-center items-center bg-black/30 backdrop-blur-sm">
          <Loader2 className="animate-spin h-12 w-12 text-white mb-4" />
          <p className="text-white font-semibold text-lg">
            Filtrando archivo, por favor espere...
          </p>
        </div>
      )}
      <div className="flex flex-col space-y-4 flex-1">
        <div className="space-y-1.5">
          <Label htmlFor="file" className="text-base font-semibold">Cargar archivo Excel</Label>

          {/* Zona de carga compacta */}
          <label
            htmlFor="file"
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition 
              ${isDragOver ? 'border-blue-600 bg-blue-100' : 'border-blue-400 bg-blue-50 hover:bg-blue-100'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-500 mb-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
            </svg>
            <span className="text-blue-700 font-medium text-sm">
              Haz clic o arrastra tu archivo aquí
            </span>
          </label>

          {/* Input real oculto */}
          <input
            ref={fileInputRef}
            id="file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />

          <p className="text-xs text-muted-foreground">
            Se filtrará automáticamente por clientes con WhatsApp. Los sin WhatsApp podrán descargarse después.
          </p>

          {/* 🛡️ Mostrar error de validación */}
          {fileError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 mt-1">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{fileError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Botones abajo */}
      <div className="border-t pt-3 mt-4">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={uploading} className='bg-red-50 hover:bg-red-100'>
            Eliminar
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? 'Filtrando...' : 'Filtrar archivo →'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
