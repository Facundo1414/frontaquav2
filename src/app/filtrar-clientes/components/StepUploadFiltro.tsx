'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { PreviewModal, PreviewData } from './PreviewModal'
import { FiltrosAvanzados, FiltrosData } from './FiltrosAvanzados'

interface StepUploadFiltroProps {
  onSuccess: (jobId: string) => void
}

type ViewMode = 'upload' | 'preview' | 'filtros'

export function StepUploadFiltro({ onSuccess }: StepUploadFiltroProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('upload')
  
  // Preview state
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  
  // Filtros state
  const [filtros, setFiltros] = useState<FiltrosData>({
    minComprobantesVencidos: 3
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { getToken } = useGlobalContext()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Validar tipo de archivo
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        toast.error('Por favor seleccione un archivo Excel (.xlsx o .xls)')
        return
      }
      
      // Validar tamaño (max 30MB)
      if (selectedFile.size > 30 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 30MB.')
        return
      }
      
      setFile(selectedFile)
      
      // Automáticamente generar preview
      await generatePreview(selectedFile, filtros)
    }
  }

  const generatePreview = async (fileToPreview: File, currentFiltros: FiltrosData) => {
    setLoadingPreview(true)
    
    try {
      const formData = new FormData()
      formData.append('file', fileToPreview)
      
      // Agregar filtros si existen
      if (currentFiltros.minComprobantesVencidos) {
        formData.append('minComprobantesVencidos', currentFiltros.minComprobantesVencidos.toString())
      }
      if (currentFiltros.maxComprobantesVencidos) {
        formData.append('maxComprobantesVencidos', currentFiltros.maxComprobantesVencidos.toString())
      }
      if (currentFiltros.neighborhoods && currentFiltros.neighborhoods.length > 0) {
        formData.append('neighborhoods', JSON.stringify(currentFiltros.neighborhoods))
      }
      if (currentFiltros.maxPerNeighborhood) {
        formData.append('maxPerNeighborhood', JSON.stringify(currentFiltros.maxPerNeighborhood))
      }
      if (currentFiltros.minDebt) {
        formData.append('minDebt', currentFiltros.minDebt.toString())
      }
      if (currentFiltros.maxDebt) {
        formData.append('maxDebt', currentFiltros.maxDebt.toString())
      }

      const token = getToken()
      if (!token) {
        toast.error('Debe iniciar sesión para usar esta funcionalidad')
        return
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/comprobante-filtro/preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al generar preview')
      }

      const data = await response.json()
      
      if (data.success && data.preview) {
        setPreviewData(data.preview)
        setViewMode('preview')
        toast.success('Vista previa generada exitosamente')
      } else {
        throw new Error('Error inesperado al generar preview')
      }

    } catch (error: any) {
      console.error('Error generating preview:', error)
      toast.error(error.message || 'Error al generar vista previa')
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleAdjustFilters = () => {
    setViewMode('filtros')
  }

  const handleApplyFilters = async (newFiltros: FiltrosData) => {
    setFiltros(newFiltros)
    
    if (file) {
      await generatePreview(file, newFiltros)
    }
  }

  const handleCancelFilters = () => {
    setViewMode('preview')
  }

  const handleConfirmProcess = async () => {
    if (!file) {
      toast.error('No hay archivo seleccionado')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Agregar filtros al procesamiento
      if (filtros.minComprobantesVencidos) {
        formData.append('minComprobantesVencidos', filtros.minComprobantesVencidos.toString())
      }
      if (filtros.maxComprobantesVencidos) {
        formData.append('maxComprobantesVencidos', filtros.maxComprobantesVencidos.toString())
      }
      if (filtros.neighborhoods && filtros.neighborhoods.length > 0) {
        formData.append('neighborhoods', JSON.stringify(filtros.neighborhoods))
      }
      if (filtros.maxPerNeighborhood) {
        formData.append('maxPerNeighborhood', JSON.stringify(filtros.maxPerNeighborhood))
      }
      if (filtros.minDebt) {
        formData.append('minDebt', filtros.minDebt.toString())
      }
      if (filtros.maxDebt) {
        formData.append('maxDebt', filtros.maxDebt.toString())
      }

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
        toast.success('Procesamiento iniciado exitosamente')
        onSuccess(data.jobId)
      } else {
        throw new Error('Error inesperado al procesar archivo')
      }

    } catch (error: any) {
      console.error('Error uploading file:', error)
      toast.error(error.message || 'Error al procesar archivo')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      if (!droppedFile.name.match(/\.(xlsx|xls)$/)) {
        toast.error('Por favor seleccione un archivo Excel (.xlsx o .xls)')
        return
      }
      setFile(droppedFile)
      
      // Automáticamente generar preview
      await generatePreview(droppedFile, filtros)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleBackToUpload = () => {
    setFile(null)
    setPreviewData(null)
    setViewMode('upload')
    setFiltros({ minComprobantesVencidos: 3 })
  }

  // RENDER: Vista de Upload
  if (viewMode === 'upload') {
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
                Formatos soportados: .xlsx, .xls (máximo 30MB)
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

        {/* Loading Preview */}
        {loadingPreview && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Generando vista previa...</p>
                  <p className="text-sm text-blue-700">Analizando el archivo Excel</p>
                </div>
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
                  ✨ Nueva funcionalidad de Vista Previa:
                </h4>
                <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                  <li>• Al subir el archivo verás estadísticas estimadas ANTES de procesar</li>
                  <li>• Podrás ajustar filtros para segmentar mejor (barrios, deuda, etc.)</li>
                  <li>• Sabrás cuántos clientes se procesarán antes de ejecutar</li>
                  <li>• El Excel resultante incluirá fecha_proceso y estado</li>
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
      </div>
    )
  }

  // RENDER: Vista de Preview
  if (viewMode === 'preview' && previewData) {
    return (
      <div className="space-y-4">
        <PreviewModal
          preview={previewData}
          onConfirm={handleConfirmProcess}
          onAdjustFilters={handleAdjustFilters}
          isLoading={uploading}
        />
        
        {/* Botón para volver */}
        <div className="flex justify-start">
          <Button
            variant="ghost"
            onClick={handleBackToUpload}
            disabled={uploading}
          >
            ← Subir otro archivo
          </Button>
        </div>
      </div>
    )
  }

  // RENDER: Vista de Filtros
  if (viewMode === 'filtros' && previewData) {
    return (
      <div className="space-y-4">
        <FiltrosAvanzados
          filtros={filtros}
          barriosDisponibles={previewData.barrios}
          onChange={setFiltros}
          onApply={() => handleApplyFilters(filtros)}
          onCancel={handleCancelFilters}
        />
      </div>
    )
  }

  return null
}