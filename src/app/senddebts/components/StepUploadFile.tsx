'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  uploadExcelFile,
  getFileByName,
} from '@/lib/api'
import { parseExcelBlob, parseExcelBlobWithIndexMapping } from '@/utils/parseExcelBlob'
import { useSendDebtsContext } from '@/app/providers/context/SendDebtsContext'
import { useWhatsappSessionContext } from '@/app/providers/context/whatsapp/WhatsappSessionContext'

export default function StepUploadFile() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { setActiveStep, setRawData, setFilteredData, setFileNameFiltered, setNotWhatsappData } = useSendDebtsContext()
  const { snapshot } = useWhatsappSessionContext()
  const syncing = !snapshot?.ready

  const processFile = async (selected: File) => {
    setFile(selected)
    const fileData = await selected.arrayBuffer()
    const blob = new Blob([fileData], { type: selected.type })
    const parsedData = await parseExcelBlob(blob)
    setRawData(parsedData)
    setActiveStep(0)
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
      className="w-full h-full flex flex-col"
    >
      <div className="flex flex-col space-y-6 flex-1">
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
            El archivo seleccionado será filtrado para identificar clientes con y sin WhatsApp. Los que tienen WhatsApp se mostrarán en la tabla de abajo, mientras que los que no lo tienen podrán descargarse más adelante en formato excel.          
          </p>
        </div>
      </div>

      {/* Botones abajo */}
      <div className="mt-auto flex items-center gap-4 pt-4">
        <Button variant="secondary" onClick={handleCancel} disabled={uploading || syncing} className='bg-red-100'>
          Eliminar
        </Button>
        <Button onClick={handleUpload} disabled={!file || uploading || syncing}>
          {uploading ? 'Filtrando...' : 'Filtrar archivo'}
        </Button>
      </div>
      {syncing && (
        <p className="text-xs mt-2 text-amber-600">Sincronizando WhatsApp… Podés ver el estado arriba. Las acciones estarán disponibles en segundos.</p>
      )}
    </motion.div>
  )
}
