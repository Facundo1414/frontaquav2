'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useGlobalContext } from '@/app/providers/context/GlobalContext'

interface StepUploadFiltroProps {
  onSuccess: (jobId: string) => void
}

export function StepUploadFiltro({ onSuccess }: StepUploadFiltroProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { getToken } = useGlobalContext()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Validar tipo de archivo
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        toast.error('Por favor seleccione un archivo Excel (.xlsx o .xls)')
        return
      }
      
      // Validar tamaño (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 10MB.')
        return
      }
      
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Por favor seleccione un archivo')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = getToken()
      if (!token) {
        toast.error('Debe iniciar sesión para usar esta funcionalidad')
        return
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/comprobante-filtro/upload-and-filter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al subir archivo')
      }

      const data = await response.json()
      
      if (data.success && data.jobId) {
        toast.success('Archivo subido correctamente. Iniciando procesamiento...')
        onSuccess(data.jobId)
      } else {
        throw new Error('Error inesperado al procesar archivo')
      }

    } catch (error: any) {
      console.error('Error uploading file:', error)
      toast.error(error.message || 'Error al subir archivo')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      if (!droppedFile.name.match(/\.(xlsx|xls)$/)) {
        toast.error('Por favor seleccione un archivo Excel (.xlsx o .xls)')
        return
      }
      setFile(droppedFile)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <div className="space-y-6">
      
      {/* File Upload Area */}
      <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-8">
          <div
            className="text-center cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Subir archivo Excel
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Arrastra tu archivo aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-500">
              Formatos soportados: .xlsx, .xls (máximo 10MB)
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected File Info */}
      {file && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-gray-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-700"
              >
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirements Info */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm text-yellow-800">
                Requisitos del archivo Excel:
              </h4>
              <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                <li>• Debe contener una columna llamada "unidad" con las UF</li>
                <li>• Puede incluir las demás columnas del formato actual</li>
                <li>• Se conservarán todas las columnas originales</li>
                <li>• Se agregará una columna con comprobantes vencidos de Aguas Córdoba</li>
              </ul>
              <div className="mt-3 pt-2 border-t border-yellow-300">
                <p className="text-xs text-yellow-800 font-medium">
                  ℹ️ Requiere estar logueado en el sistema AQUA (no WhatsApp)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-8"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Procesando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Subir y procesar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}