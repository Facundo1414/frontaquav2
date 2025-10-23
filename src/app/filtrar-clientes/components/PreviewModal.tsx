'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  DollarSign,
  Filter,
  Play,
  TrendingUp,
  TrendingDown
} from "lucide-react"

export interface PreviewData {
  totalClientes: number
  clientesValidos: number
  estimadoAptos: number
  estimadoDescartados: number
  barrios: { nombre: string; cantidad: number }[]
  rangoDeuda?: {
    min: number
    max: number
    promedio: number
  }
  filtrosAplicados?: {
    minComprobantesVencidos?: number
    maxComprobantesVencidos?: number
    neighborhoods?: string[]
    minDebt?: number
    maxDebt?: number
  }
}

interface PreviewModalProps {
  preview: PreviewData
  onConfirm: () => void
  onAdjustFilters: () => void
  isLoading?: boolean
}

export function PreviewModal({ 
  preview, 
  onConfirm, 
  onAdjustFilters,
  isLoading = false 
}: PreviewModalProps) {
  
  const hasFiltros = preview.filtrosAplicados && (
    preview.filtrosAplicados.minComprobantesVencidos ||
    preview.filtrosAplicados.maxComprobantesVencidos ||
    preview.filtrosAplicados.neighborhoods ||
    preview.filtrosAplicados.minDebt ||
    preview.filtrosAplicados.maxDebt
  )

  const porcentajeAptos = preview.clientesValidos > 0 
    ? Math.round((preview.estimadoAptos / preview.clientesValidos) * 100)
    : 0

  const porcentajeDescartados = preview.clientesValidos > 0
    ? Math.round((preview.estimadoDescartados / preview.clientesValidos) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header con título y badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Vista Previa del Procesamiento
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Análisis del archivo sin ejecutar el procesamiento completo
          </p>
        </div>
        {hasFiltros && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <Filter className="h-3 w-3 mr-1" />
            Filtros aplicados
          </Badge>
        )}
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Clientes */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">
                  Total Clientes
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {preview.totalClientes}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  En el archivo Excel
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        {/* Clientes Válidos */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">
                  Clientes Válidos
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {preview.clientesValidos}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Con datos completos
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        {/* Estimado Aptos */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">
                  Aptos Estimados
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {preview.estimadoAptos}
                </p>
                <div className="flex items-center mt-1 space-x-2">
                  <Badge variant="secondary" className="bg-green-200 text-green-800 text-xs">
                    {porcentajeAptos}%
                  </Badge>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        {/* Estimado Descartados */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 mb-1">
                  Descartados
                </p>
                <p className="text-3xl font-bold text-orange-900">
                  {preview.estimadoDescartados}
                </p>
                <div className="flex items-center mt-1 space-x-2">
                  <Badge variant="secondary" className="bg-orange-200 text-orange-800 text-xs">
                    {porcentajeDescartados}%
                  </Badge>
                  <TrendingDown className="h-3 w-3 text-orange-600" />
                </div>
              </div>
              <XCircle className="h-8 w-8 text-orange-600 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barrios detectados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            Barrios Detectados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {preview.barrios.length > 0 ? (
            <div className="space-y-3">
              {preview.barrios.slice(0, 10).map((barrio, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <Badge 
                      variant="outline" 
                      className="min-w-[40px] justify-center bg-blue-50 text-blue-700"
                    >
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-gray-900">
                      {barrio.nombre}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-gray-100">
                      {barrio.cantidad} clientes
                    </Badge>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all"
                        style={{ 
                          width: `${Math.min((barrio.cantidad / preview.totalClientes) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {preview.barrios.length > 10 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  ... y {preview.barrios.length - 10} barrios más
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No se detectaron barrios en los datos
            </p>
          )}
        </CardContent>
      </Card>

      {/* Rango de deuda (si está disponible) */}
      {preview.rangoDeuda && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Rango de Deuda Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 font-medium mb-1">Mínima</p>
                <p className="text-2xl font-bold text-red-900">
                  ${preview.rangoDeuda.min.toLocaleString()}
                </p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-1">Promedio</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${preview.rangoDeuda.promedio.toLocaleString()}
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-700 font-medium mb-1">Máxima</p>
                <p className="text-2xl font-bold text-orange-900">
                  ${preview.rangoDeuda.max.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros aplicados (si existen) */}
      {hasFiltros && preview.filtrosAplicados && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-blue-900">
              <Filter className="h-5 w-5 mr-2" />
              Filtros Aplicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {preview.filtrosAplicados.minComprobantesVencidos && (
                <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-700">Mínimo comprobantes vencidos:</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {preview.filtrosAplicados.minComprobantesVencidos}
                  </Badge>
                </div>
              )}
              
              {preview.filtrosAplicados.maxComprobantesVencidos && (
                <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-700">Máximo comprobantes vencidos:</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {preview.filtrosAplicados.maxComprobantesVencidos}
                  </Badge>
                </div>
              )}
              
              {preview.filtrosAplicados.neighborhoods && preview.filtrosAplicados.neighborhoods.length > 0 && (
                <div className="py-2 px-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-700 block mb-2">Barrios seleccionados:</span>
                  <div className="flex flex-wrap gap-2">
                    {preview.filtrosAplicados.neighborhoods.map((barrio, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                        {barrio}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {(preview.filtrosAplicados.minDebt || preview.filtrosAplicados.maxDebt) && (
                <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-700">Rango de deuda:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ${preview.filtrosAplicados.minDebt?.toLocaleString() || '0'} - 
                    ${preview.filtrosAplicados.maxDebt?.toLocaleString() || '∞'}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onAdjustFilters}
          disabled={isLoading}
          className="min-w-[200px]"
        >
          <Filter className="h-4 w-4 mr-2" />
          Ajustar Filtros
        </Button>

        <Button
          size="lg"
          onClick={onConfirm}
          disabled={isLoading}
          className="min-w-[200px] bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Procesando...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Confirmar y Procesar
            </>
          )}
        </Button>
      </div>

      {/* Info footer */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">ℹ</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-900">
                <strong>Nota importante:</strong> Los números mostrados son estimaciones basadas en el análisis local del archivo.
                El procesamiento real consultará la API de Aguas Cordobesas para obtener datos precisos de deuda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
