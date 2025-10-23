'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, AlertCircle, Info } from "lucide-react"
import { toast } from "sonner"
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { uploadUniverseFile } from '@/lib/api'

interface StepUploadUniversoProps {
  onSuccess: (info: { neighborhoods: string[], totalAccounts: number, fileName: string }) => void
}

export function StepUploadUniverso({ onSuccess }: StepUploadUniversoProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { getToken } = useGlobalContext()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        toast.error('Por favor seleccione un archivo Excel (.xlsx o .xls)')
        return
      }
      
      if (selectedFile.size > 30 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 30MB.')
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

    const token = getToken()
    if (!token) {
      toast.error('Debe iniciar sesión para usar esta funcionalidad')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const data = await uploadUniverseFile(formData)
      
      toast.success(`✅ Universo cargado: ${data.neighborhoods.length} barrios, ${data.totalAccounts} cuentas`)
      onSuccess({
        neighborhoods: data.neighborhoods,
        totalAccounts: data.totalAccounts,
        fileName: data.fileName
      })

    } catch (error: any) {
      console.error('Error uploading universe:', error)
      toast.error(error.response?.data?.message || error.message || 'Error al subir archivo')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.match(/\.(xlsx|xls)$/)) {
      if (droppedFile.size > 30 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 30MB.')
        return
      }
      setFile(droppedFile)
    } else {
      toast.error('Por favor seleccione un archivo Excel (.xlsx o .xls)')
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <div className="space-y-6">
      {/* Explicación Principal */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-900 mb-3">
                📂 Paso 1: Sube tu Universo de Cuentas
              </h3>
              <div className="space-y-2 text-sm text-green-900">
                <p className="font-medium">
                  🎯 <strong>¿Qué hace este paso?</strong>
                </p>
                <p className="text-green-800">
                  Carga tu archivo Excel con TODAS las cuentas que quieres analizar. 
                  El sistema lo guardará de forma segura y <strong className="underline">NO necesitarás subirlo otra vez</strong>.
                </p>
                
                <p className="font-medium mt-3">
                  ✅ <strong>Ventajas del nuevo sistema:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-green-800 ml-4">
                  <li><strong>Sube una vez</strong>, procesa múltiples veces</li>
                  <li>El archivo se guarda en tu espacio personal</li>
                  <li>En los siguientes pasos elegirás QUÉ barrios procesar</li>
                  <li>Ideal para procesar ~300 cuentas por día sin saturar el sistema</li>
                </ul>

                <div className="mt-4 p-3 bg-white border-2 border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900">
                    📋 <strong>Formato del archivo Excel:</strong>
                  </p>
                  <p className="text-sm text-green-800 mt-1">
                    Debe contener las columnas: <code className="bg-green-100 px-2 py-0.5 rounded">UF</code>, 
                    <code className="bg-green-100 px-2 py-0.5 rounded ml-1">BARRIO</code>, y datos del cliente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Area */}
      <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
        <CardContent className="p-8">
          <div
            className="text-center cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              📤 Arrastra tu archivo Excel aquí
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              o haz clic para seleccionar desde tu computadora
            </p>
            <p className="text-xs text-gray-500">
              Formatos: .xlsx, .xls (máximo 30MB)
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
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setFile(null)}
                variant="ghost"
                size="sm"
              >
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          size="lg"
          className="w-full sm:w-auto"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Subiendo universo...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir y Continuar
            </>
          )}
        </Button>
      </div>

      {/* Format Example */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-gray-900 mb-2">
            📋 Formato esperado del Excel:
          </p>
          <div className="bg-white p-3 rounded border text-xs font-mono overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1 text-left">UF</th>
                  <th className="px-2 py-1 text-left">BARRIO</th>
                  <th className="px-2 py-1 text-left">NOMBRE</th>
                  <th className="px-2 py-1 text-left">...</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1">1234567</td>
                  <td className="px-2 py-1">ALTO ALBERDI</td>
                  <td className="px-2 py-1">Juan Pérez</td>
                  <td className="px-2 py-1">...</td>
                </tr>
                <tr>
                  <td className="px-2 py-1">7654321</td>
                  <td className="px-2 py-1">NUEVA CÓRDOBA</td>
                  <td className="px-2 py-1">María García</td>
                  <td className="px-2 py-1">...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
