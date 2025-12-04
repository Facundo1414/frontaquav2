'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Search, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { useProgressWebSocket } from '@/hooks/useProgressWebSocket'
import { ProcessResults } from '../page'
import { FiltrosBarrios } from './StepSeleccionarBarrios'
import { checkDebtByNeighborhoods, checkDebtByUnits } from '@/lib/api'
import api from '@/lib/api/axiosInstance'
import { logger } from '@/lib/logger';

interface PyseQuotaStatus {
  used_today: number
  remaining_today: number
  limit_daily: number
  percentage_used: number
  can_query: boolean
}

interface Client {
  id: string
  unidad: string
  distrito?: string
  zona?: string
  manzana?: string
  parcela?: string
  titular?: string
  phone?: string
  debt?: number
  barrio_inm?: string
  requiresNotification?: boolean
  status?: 'pending' | 'notified' | 'visited' | 'verified'
  processedDate?: string
}

interface StepVerificarDeudaProps {
  selectedClients?: Client[] // Nuevo: clientes desde BD
  filtros?: FiltrosBarrios // Mantener compatibilidad con flujo viejo
  onComplete: (results: ProcessResults) => void
}

export function StepVerificarDeuda({ selectedClients, filtros, onComplete }: StepVerificarDeudaProps) {
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [quotaStatus, setQuotaStatus] = useState<PyseQuotaStatus | null>(null)
  const { getToken } = useGlobalContext()
  const { progress: wsProgress, isCompleted, error: wsError, resetProgress } = useProgressWebSocket()

  // Cargar estado de cuota al montar
  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const response = await api.get<PyseQuotaStatus>('/pyse/usage/status')
        setQuotaStatus(response.data)
      } catch (error) {
        console.error('Error fetching quota:', error)
      }
    }
    fetchQuota()
  }, [])

  // Actualizar progreso desde WebSocket
  useEffect(() => {
    if (wsProgress) {
      setProgress(wsProgress.percentage)
    }
  }, [wsProgress])

  // Mostrar error si hay
  useEffect(() => {
    if (wsError) {
      toast.error(`Error en verificación: ${wsError}`)
    }
  }, [wsError])

  const handleVerificar = async () => {
    const token = getToken()
    if (!token) {
      toast.error('Debe iniciar sesión')
      return
    }

    setProcessing(true)
    setProgress(10)
    resetProgress() // Resetear progreso del WebSocket

    try {
      let data: ProcessResults

      // Nuevo flujo: procesar clientes seleccionados desde BD
      if (selectedClients && selectedClients.length > 0) {
        // Extraer números de unidad
        const unidades = selectedClients.map(c => parseInt(c.unidad))

        // Extraer datos de cliente para enriquecimiento
        const clientData = selectedClients.map(c => ({
          uf: parseInt(c.unidad),
          barrio: c.barrio_inm, // Enviar barrio desde la BD
          domicilio: undefined, // No tenemos domicilio en la BD
          titular: c.titular,
        }))

        logger.log(`🎯 Verificando deuda para ${unidades.length} unidades específicas...`)
        logger.log(`📋 Datos de cliente incluidos: barrio, titular`)

        // Usar el nuevo endpoint optimizado con datos de cliente
        data = await checkDebtByUnits(
          unidades,
          {
            minComprobantesVencidos: 3 // PYSE requiere mín. 3
          },
          clientData // Pasar datos de cliente
        )
      }
      // Flujo original: por barrios y filtros
      else if (filtros) {
        logger.log(`📍 Verificando deuda por barrios (flujo legacy)...`)
        data = await checkDebtByNeighborhoods(filtros.barrios, filtros)
      }
      else {
        throw new Error('No hay clientes ni filtros seleccionados')
      }

      setProgress(100)
      toast.success(`✅ Verificación completa: ${data.totalProcessed} cuentas procesadas`)

      // Pequeño delay para mostrar el 100%
      setTimeout(() => {
        onComplete(data)
      }, 500)

    } catch (error: any) {
      console.error('Error verificando deuda:', error)
      toast.error(error.response?.data?.message || error.message || 'Error al verificar deuda')
      setProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      {/* Explicación del Paso */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Search className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                🔍 Paso 2: Verificar Deuda en Aguas Cordobesas
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-blue-800">
                  <strong>⚡ ¿Qué hace este paso?</strong> El sistema consultará automáticamente
                  el estado de deuda de cada cuenta seleccionada.
                </p>

                <div className="mt-3 p-3 bg-white border-2 border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    📋 <strong>Clasificación automática:</strong>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-700">APTOS para PYSE</p>
                        <p className="text-xs text-green-600">3+ consumos vencidos, sin plan de pago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-red-700">NO APTOS</p>
                        <p className="text-xs text-red-600">{'< 3 consumos o con plan de pago'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
                  <p className="text-sm text-amber-900">
                    ⏱️ <strong>Tiempo estimado:</strong> Algunos minutos según cantidad de cuentas.
                    El sistema respeta límites (500 req/hora por usuario) para no saturar Aguas Cordobesas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary: Clientes o Barrios */}
      <Card>
        <CardContent className="p-4">
          {selectedClients ? (
            // Nuevo: Resumen de clientes seleccionados desde BD
            <div>
              <h3 className="font-medium mb-3">Clientes seleccionados: {selectedClients.length.toLocaleString()}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total a procesar:</span>
                  <span className="font-semibold">{selectedClients.length} cuentas</span>
                </div>
                {selectedClients.some(c => c.barrio_inm) && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Barrios únicos:</span>
                    <span className="font-semibold">
                      {Array.from(new Set(selectedClients.map(c => c.barrio_inm).filter(Boolean))).length}
                    </span>
                  </div>
                )}
                <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                  💡 Tip: Después de verificar, los clientes serán marcados automáticamente en tu base de datos
                </div>
              </div>
            </div>
          ) : filtros ? (
            // Flujo original: resumen de barrios
            <div>
              <h3 className="font-medium mb-3">Barrios seleccionados ({filtros.barrios.length}):</h3>
              <div className="flex flex-wrap gap-2">
                {filtros.barrios.map((barrio) => (
                  <span
                    key={barrio}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {barrio}
                    {filtros.limitesPorBarrio?.[barrio] && (
                      <span className="ml-1 text-xs">
                        (máx. {filtros.limitesPorBarrio[barrio]})
                      </span>
                    )}
                  </span>
                ))}
              </div>

              {/* Filtros Activos */}
              {(filtros.minComprobantesVencidos || filtros.maxComprobantesVencidos || filtros.minDeuda || filtros.maxDeuda) && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="text-sm font-medium text-purple-900 mb-2">🔍 Filtros Activos:</h4>
                  <ul className="space-y-1 text-sm text-purple-800">
                    {filtros.minComprobantesVencidos && (
                      <li>• Comprobantes vencidos: mín. {filtros.minComprobantesVencidos}{filtros.maxComprobantesVencidos ? `, máx. ${filtros.maxComprobantesVencidos}` : ''}</li>
                    )}
                    {(filtros.minDeuda || filtros.maxDeuda) && (
                      <li>
                        • Rango de deuda:
                        {filtros.minDeuda && ` mín. $${filtros.minDeuda.toLocaleString()}`}
                        {filtros.maxDeuda && `, máx. $${filtros.maxDeuda.toLocaleString()}`}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Progress */}
      {processing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {wsProgress ?
                    `Procesando ${wsProgress.processed} de ${wsProgress.total} cuentas` :
                    'Procesando...'}
                </span>
                <span className="text-sm text-gray-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">
                  {wsProgress ?
                    `📊 ${wsProgress.processed}/${wsProgress.total} cuentas verificadas...` :
                    'Consultando Aguas Cordobesas...'}
                </span>
              </div>
              {wsProgress && wsProgress.processed > 0 && (
                <div className="text-center text-xs text-gray-500">
                  ⚡ Progreso en tiempo real vía WebSocket
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Button */}
      {!processing && (
        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={handleVerificar}
            size="lg"
            className="w-full sm:w-auto"
            disabled={!quotaStatus?.can_query}
          >
            <Search className="mr-2 h-5 w-5" />
            {quotaStatus?.can_query ? 'Iniciar Verificación de Deuda' : 'Cuota Diaria Agotada'}
          </Button>
          {!quotaStatus?.can_query && (
            <p className="text-sm text-red-600 text-center">
              ⚠️ Has alcanzado el límite diario de 1000 consultas. Se restablecerá mañana a las 00:00 hs.
            </p>
          )}
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-xs text-green-700">APTOS</p>
                <p className="text-sm font-medium text-green-900">3+ consumos, sin PP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-xs text-red-700">NO APTOS</p>
                <p className="text-sm font-medium text-red-900">Menos de 3 o con PP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-xs text-yellow-700">ERRORES</p>
                <p className="text-sm font-medium text-yellow-900">No se pudo verificar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
