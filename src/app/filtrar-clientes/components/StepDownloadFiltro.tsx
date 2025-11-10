'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Users, CheckCircle, AlertTriangle, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { useGlobalContext } from '@/app/providers/context/GlobalContext'

interface FiltroResultados {
  clientesAptos: number
  clientesDescartados: number
  totalProcesados: number
  errores: string[]
}

interface StepDownloadFiltroProps {
  jobId: string
  resultados: FiltroResultados
  onReset: () => void
}

export function StepDownloadFiltro({ jobId, resultados, onReset }: StepDownloadFiltroProps) {
  const [downloading, setDownloading] = useState<'aptos' | 'descartados' | null>(null)
  const { getToken } = useGlobalContext()

  const downloadFile = async (tipo: 'aptos' | 'descartados') => {
    setDownloading(tipo)

    try {
      const token = getToken()
      if (!token) {
        toast.error('Debe iniciar sesión para usar esta funcionalidad')
        return
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/comprobante-filtro/status/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
        throw new Error(errorData.message || `Error al descargar archivo ${tipo}`)
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Extract filename from response headers or generate one
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 
                     `clientes_${tipo}_${new Date().toISOString().slice(0, 10)}.xlsx`
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`Archivo ${tipo} descargado exitosamente`)

    } catch (error: any) {
      console.error(`Error downloading ${tipo}:`, error)
      toast.error(error.message || `Error al descargar archivo ${tipo}`)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Results Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Procesamiento completado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{resultados.totalProcesados}</p>
              <p className="text-sm text-gray-600">Total procesados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{resultados.clientesAptos}</p>
              <p className="text-sm text-gray-600">Aptos PYSE</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{resultados.clientesDescartados}</p>
              <p className="text-sm text-gray-600">Descartados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{resultados.errores.length}</p>
              <p className="text-sm text-gray-600">Errores</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Clientes Aptos */}
        <Card className="border-green-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="font-semibold text-lg text-green-800">
                  Clientes Aptos para PYSE
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {resultados.clientesAptos} clientes con ≥ 3 comprobantes vencidos
                </p>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Listos para imprimir en PYSE</p>
                <p>• Incluye columna de comprobantes vencidos</p>
                <p>• Conserva todas las columnas originales</p>
              </div>

              <Button
                onClick={() => downloadFile('aptos')}
                disabled={downloading !== null || resultados.clientesAptos === 0}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {downloading === 'aptos' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Descargando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Aptos
                  </>
                )}
              </Button>

              {resultados.clientesAptos === 0 && (
                <p className="text-xs text-orange-600">
                  No hay clientes aptos en este lote
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Clientes Descartados */}
        <Card className="border-orange-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
              
              <div>
                <h3 className="font-semibold text-lg text-orange-800">
                  Clientes Descartados
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {resultados.clientesDescartados} clientes con &lt; 3 comprobantes
                </p>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Para referencia y seguimiento</p>
                <p>• Incluye motivo del descarte</p>
                <p>• Datos completos para análisis</p>
              </div>

              <Button
                onClick={() => downloadFile('descartados')}
                disabled={downloading !== null || resultados.clientesDescartados === 0}
                variant="outline"
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                {downloading === 'descartados' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                    Descargando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Descartados
                  </>
                )}
              </Button>

              {resultados.clientesDescartados === 0 && (
                <p className="text-xs text-green-600">
                  ¡Todos los clientes califican para PYSE!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Errors Section */}
      {resultados.errores.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800 text-base">
              <AlertTriangle className="h-5 w-5" />
              Errores encontrados ({resultados.errores.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {resultados.errores.slice(0, 10).map((error, index) => (
                <p key={index} className="text-xs text-red-700">
                  • {error}
                </p>
              ))}
              {resultados.errores.length > 10 && (
                <p className="text-xs text-red-600 font-medium mt-2">
                  ... y {resultados.errores.length - 10} errores más
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-sm text-blue-800 mb-2">
            Próximos pasos:
          </h4>
          <ol className="text-xs text-blue-700 space-y-1">
            <li>1. Descarga el archivo &quot;Clientes Aptos&quot; para usar en PYSE</li>
            <li>2. Usa el archivo &quot;Descartados&quot; para hacer seguimiento</li>
            <li>3. Los clientes aptos tienen 3 o más comprobantes vencidos</li>
            <li>4. La columna &quot;comprobantes_vencidos_aguas&quot; muestra el conteo exacto</li>
          </ol>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Procesar otro archivo
        </Button>

        <div className="text-xs text-gray-500">
          Job ID: <span className="font-mono">{jobId}</span>
        </div>
      </div>
    </div>
  )
}