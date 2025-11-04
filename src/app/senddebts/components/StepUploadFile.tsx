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
import { useSendDebtsContext } from '@/app/providers/context/SendDebtsContext'
import { useWhatsappSessionContext } from '@/app/providers/context/whatsapp/WhatsappSessionContext'
import { debtsDataSchema } from '@/lib/validations/send-debts.schema'
import { validateExcelFile, sanitizeObject } from '@/lib/validations/validation-utils'
import { useFileValidation } from '@/hooks/useValidation'
import { ProgressCard } from './ProgressCard'
import { useProgressTracking } from '@/hooks/useProgressTracking'

export default function StepUploadFile() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { setActiveStep, setRawData, setFilteredData, setFileNameFiltered, setNotWhatsappData } = useSendDebtsContext()
  const { snapshot } = useWhatsappSessionContext()
  const syncing = !snapshot?.ready

  // Hook de validación de archivos
  const { validateFile, fileError, clearFileError } = useFileValidation()

  // 🔌 Hook de progreso en tiempo real
  const {
    progress: wsProgress,
    connected: wsConnected,
    currentPhase,
    currentStats,
    timeRemaining,
    overallProgress,
  } = useProgressTracking({
    jobId,
    enabled: !!jobId,
    onCompleted: (result) => {
      console.log('✅ Upload completado:', result)
      setUploading(false)
      setJobId(null)
    },
    onError: (error) => {
      console.error('❌ Error en upload:', error)
      setUploading(false)
      setJobId(null)
      toast.error('Error al procesar el archivo')
    },
  })

  const processFile = async (selected: File) => {
    // 🛡️ Validar archivo antes de procesarlo
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

      // 🛡️ Validar datos parseados con schema de Zod
      const validation = debtsDataSchema.safeParse(parsedData)
      
      if (!validation.success) {
        console.error('Error de validación:', validation.error)
        toast.error('El archivo contiene datos inválidos. Verifica el formato.')
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      // 🛡️ Sanitizar datos antes de guardarlos
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
    if (syncing) {
      return toast.info('Esperá a que termine la sincronización de WhatsApp antes de filtrar.');
    }
    if (!file) return toast.error('Seleccioná un archivo primero')

    // 🛡️ Re-validar antes de enviar al backend
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
      
      // 🎯 Backend siempre devuelve jobId para tracking en tiempo real
      if (response.jobId) {
        console.log('📊 JobId recibido:', response.jobId)
        setJobId(response.jobId)
      } else {
        console.warn('⚠️ Backend no retornó jobId, no habrá progreso en tiempo real')
      }
      
      const fileWithNoWsp = response.savedFileNames?.[0]
      const savedFile = response.savedFileNames?.[1]

      if (!savedFile) throw new Error('No se recibió el nombre del archivo procesado')

      setFileNameFiltered(savedFile)
      setNotWhatsappData(fileWithNoWsp)
      const blob = await getFileByName(savedFile)
      const parsedData = await parseExcelBlobWithIndexMapping(blob)

      setFilteredData(parsedData)
      toast.success(`✅ Archivo procesado. ${parsedData.length} clientes con WhatsApp`)
      // Ir directo a paso 1 (enviar) - la verificación de WhatsApp ya se hizo
      setActiveStep(1)
    } catch (err) {
      console.error(err)
      toast.error('Error al procesar el archivo')
    } finally {
      setUploading(false)
      setJobId(null)
    }
  }

  const handleCancel = () => {
    setFile(null)
    setRawData([])
    if (fileInputRef.current) fileInputRef.current.value = ''
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
      className="space-y-6"
    >
      {/* Progress Card durante la carga */}
      {uploading && (
        <div className="mb-4">
          <ProgressCard
            title={currentPhase?.label || "Procesando archivo Excel"}
            description={file?.name || 'Cargando archivo...'}
            progress={overallProgress || 0}
            stats={currentStats || undefined}
            status="processing"
            estimatedTime={timeRemaining || undefined}
            showDetails={!!currentStats}
          />
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">Archivo Excel</Label>

          {/* Zona de carga */}
          <label
            htmlFor="file"
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition 
              ${isDragOver ? 'border-blue-600 bg-blue-100' : 'border-blue-400 bg-blue-50 hover:bg-blue-100'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-blue-500 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
            </svg>
            <span className="text-blue-700 font-medium">
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

          <p className="text-sm text-muted-foreground">
            El sistema <strong>automáticamente</strong>:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
            <li>Busca números en tu base de datos de clientes (más actualizados)</li>
            <li>Verifica cuáles tienen WhatsApp activo</li>
            <li>Filtra solo los que pueden recibir mensajes</li>
            <li>Guarda resultados para futuras cargas (90% más rápido)</li>
          </ul>

          {/* 🛡️ Mostrar error de validación si existe */}
          {fileError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 mt-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{fileError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t mt-6">
        <div>
          {file && (
            <p className="text-sm text-gray-600">
              📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel} 
            disabled={uploading || syncing} 
            className='bg-red-50 hover:bg-red-100'
          >
            Eliminar archivo
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading || syncing}
          >
            {uploading ? '⏳ Procesando...' : '🚀 Filtrar y verificar →'}
          </Button>
        </div>
      </div>
      
      {syncing && (
        <p className="text-xs text-amber-600 text-center py-2">
          ⚠️ Sincronizando WhatsApp… Las acciones estarán disponibles en segundos.
        </p>
      )}
    </motion.div>
  )
}
