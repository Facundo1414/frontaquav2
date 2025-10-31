'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, AlertTriangle, Users } from "lucide-react"
import { toast } from "sonner"
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { useJobProgress } from '@/hooks/useJobProgress'

interface FiltroStatus {
  jobId: string
  status: 'processing' | 'completed'
  clientesAptos: number
  clientesDescartados: number
  totalProcesados: number
  errores: string[]
  aptosFilePath?: string
  descartadosFilePath?: string
}

interface StepProcessFiltroProps {
  jobId: string
  onComplete: (results: FiltroStatus) => void
}

export function StepProcessFiltro({ jobId, onComplete }: StepProcessFiltroProps) {
  const [status, setStatus] = useState<FiltroStatus | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentAction, setCurrentAction] = useState('Iniciando procesamiento...')
  const { getToken } = useGlobalContext()
  
  // WebSocket para actualizaciones en tiempo real
  const { progress: wsProgress, isSubscribed, connected } = useJobProgress(jobId)

  // Actualizar estado desde WebSocket
  useEffect(() => {
    if (wsProgress && isSubscribed && connected) {
      console.log('📊 Job progress recibido por WebSocket:', wsProgress)
      
      // Mapear datos del WebSocket a formato FiltroStatus
      const mappedStatus: FiltroStatus = {
        jobId: wsProgress.jobId,
        status: wsProgress.status === 'completed' ? 'completed' : 'processing',
        clientesAptos: wsProgress.resultado?.clientesAptos || 0,
        clientesDescartados: wsProgress.resultado?.clientesDescartados || 0,
        totalProcesados: wsProgress.resultado?.totalProcesados || 0,
        errores: wsProgress.errores || [],
        aptosFilePath: wsProgress.resultado?.aptosFilePath,
        descartadosFilePath: wsProgress.resultado?.descartadosFilePath,
      }

      setStatus(mappedStatus)
      setProgress(wsProgress.progress || 0)
      setCurrentAction(wsProgress.message || wsProgress.currentAction || 'Procesando...')

      if (wsProgress.status === 'completed') {
        toast.success('Filtrado completado exitosamente')
        onComplete(mappedStatus)
      } else if (wsProgress.status === 'error') {
        toast.error(wsProgress.message || 'Error en el procesamiento')
      }
    }
  }, [wsProgress, isSubscribed, connected, jobId, onComplete])

  if (!status) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Cargando estado...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Progress Section */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">Procesando filtro de clientes</h3>
              <div className="flex items-center space-x-2">
                {status.status === 'processing' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                <span className="text-sm text-gray-600">
                  {status.status === 'processing' ? 'En progreso' : 'Completado'}
                </span>
              </div>
            </div>

            <Progress value={progress} className="w-full" />
            
            <p className="text-sm text-gray-600">{currentAction}</p>
          </div>
        </CardContent>
      </Card>

      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{status.totalProcesados}</p>
                <p className="text-sm text-gray-600">Total procesados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{status.clientesAptos}</p>
                <p className="text-sm text-gray-600">Aptos para PYSE</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{status.clientesDescartados}</p>
                <p className="text-sm text-gray-600">Descartados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Errors Section */}
      {status.errores.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-red-800">
                  Errores encontrados ({status.errores.length}):
                </h4>
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {status.errores.slice(0, 5).map((error, index) => (
                    <p key={index} className="text-xs text-red-700 mb-1">
                      • {error}
                    </p>
                  ))}
                  {status.errores.length > 5 && (
                    <p className="text-xs text-red-600 font-medium">
                      ... y {status.errores.length - 5} errores más
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {status.status === 'processing' ? (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              )}
            </div>
            <div>
              <h4 className="font-medium text-sm text-blue-800">
                {status.status === 'processing' ? 'Procesamiento en curso' : 'Procesamiento completado'}
              </h4>
              <p className="text-xs text-blue-700 mt-1">
                {status.status === 'processing' 
                  ? 'Verificando deudas en Aguas Córdoba y generando archivos...'
                  : 'Los archivos Excel están listos para descargar en el siguiente paso.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job ID */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Job ID: <span className="font-mono">{jobId}</span>
        </p>
      </div>
    </div>
  )
}