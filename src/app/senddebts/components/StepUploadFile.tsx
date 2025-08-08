'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  uploadExcelFile,
  checkFileStatus,
  getFileByName,
} from '@/lib/api'
import { parseExcelBlob, parseExcelBlobWithIndexMapping } from '@/utils/parseExcelBlob'
import { useSendDebtsContext } from '@/app/providers/context/SendDebtsContext'


export default function StepUploadFile() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const { setActiveStep, setRawData, setFilteredData , setFileNameFiltered , setNotWhatsappData} = useSendDebtsContext()
  
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {



  const selected = e.target.files?.[0]
  if (!selected) return

  setFile(selected)

  // Mostrar tabla del archivo cargado localmente (sin filtrar aún)
  const fileData = await selected.arrayBuffer()
  const blob = new Blob([fileData], { type: selected.type })
  const parsedData = await parseExcelBlob(blob)
  console.log('📦 Blob recibido - tamaño:', blob.size)
  console.log('✅ Datos parseados:', parsedData)

  setRawData(parsedData)
  setActiveStep(0)

}

const handleUpload = async () => {
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

    // ✅ Guardar datos en el contexto
    setFilteredData(parsedData)

    toast.success('Archivo procesado correctamente')
    setActiveStep(1) // ir al siguiente paso
  } catch (err) {
    console.error(err)
    toast.error('Error al procesar el archivo')
  } finally {
    setUploading(false)
  }
}


  const handleCancel = () => {
    setFile(null)
    //setFileNameFiltered("")
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
        <Input
          id="file"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
        />
        <p className="text-sm text-muted-foreground ">
          El archivo seleccionado será filtrado para identificar clientes con y sin WhatsApp.
          Los que tienen WhatsApp se mostrarán en la tabla de abajo, mientras que los que no lo tienen
          podrán descargarse más adelante en formato excel.
        </p>
      </div>
    </div>

    {/* Botones abajo */}
    <div className="mt-auto flex items-center gap-4 pt-4">
      <Button variant="secondary" onClick={handleCancel} disabled={uploading} className='bg-red-100'>
        Eliminar
      </Button>
      <Button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Filtrando...' : 'Filtrar archivo'}
      </Button>
    </div>
  </motion.div>
)


}


