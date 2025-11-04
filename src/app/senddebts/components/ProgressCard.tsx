// 🎨 Componente de Tarjeta de Progreso
// Muestra el progreso de operaciones en tiempo real con estadísticas

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressStats {
  total: number
  completed: number
  failed: number
  pending: number
}

interface ProgressCardProps {
  title: string
  description?: string
  progress: number // 0-100
  stats?: ProgressStats
  status: 'idle' | 'processing' | 'completed' | 'error'
  estimatedTime?: string
  lastProcessed?: string
  showDetails?: boolean
  className?: string
}

export function ProgressCard({
  title,
  description,
  progress,
  stats,
  status,
  estimatedTime,
  lastProcessed,
  showDetails = true,
  className,
}: ProgressCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'border-blue-200 bg-blue-50'
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  return (
    <Card className={cn('transition-all duration-300', getStatusColor(), className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
            </div>
          </div>

          {status === 'processing' && (
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              En progreso
            </Badge>
          )}
          {status === 'completed' && (
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              Completado
            </Badge>
          )}
          {status === 'error' && (
            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
              Error
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Progreso</span>
            <span className="font-semibold text-blue-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Estadísticas */}
        {showDetails && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <p className="text-xs text-gray-600">Total</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-700">Exitosos</p>
              </div>
              <p className="text-2xl font-bold text-green-700 mt-1">{stats.completed}</p>
            </div>

            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <p className="text-xs text-red-700">Fallidos</p>
              </div>
              <p className="text-2xl font-bold text-red-700 mt-1">{stats.failed}</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-blue-700">Pendientes</p>
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-1">{stats.pending}</p>
            </div>
          </div>
        )}

        {/* Información adicional */}
        {showDetails && (estimatedTime || lastProcessed) && (
          <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
            {estimatedTime && status === 'processing' && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Tiempo estimado: {estimatedTime}</span>
              </div>
            )}
            {lastProcessed && (
              <div className="flex items-center gap-2 text-gray-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs truncate max-w-[250px]">Último: {lastProcessed}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
