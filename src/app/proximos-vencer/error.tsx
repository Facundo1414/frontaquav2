'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCcw, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { handleError } from '@/lib/error-logging'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error Boundary específico para Próximos a Vencer
 * Captura errores durante el procesamiento de vencimientos
 */
export default function ProximosVencerError({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    // 🔍 Logging estructurado con contexto de módulo
    handleError(error, 'proximos-vencer', {
      errorBoundary: 'proximos-vencer/error.tsx',
      feature: 'upcoming-due-dates',
      experimental: true, // Funcionalidad en prueba
      canRecover: true,
    })
  }, [error])

  const handleGoBack = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-amber-100 p-3">
              <AlertTriangle className="h-12 w-12 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            Error en Próximos a Vencer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Banner de prueba */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  🧪 Funcionalidad en Prueba
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Esta funcionalidad está siendo probada. Los errores son más frecuentes durante esta fase.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600">
            Ocurrió un error al procesar los próximos vencimientos. Esto puede deberse a:
          </p>

          {/* Posibles causas */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              Posibles causas:
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>El archivo Excel no tiene el formato esperado para vencimientos</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Las fechas de vencimiento tienen un formato incorrecto</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Los días de anticipación están fuera del rango permitido (1-30)</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Problemas con la conexión al servidor</span>
              </li>
            </ul>
          </div>

          {/* Error ID */}
          {error.digest && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">ID de Error:</span> {error.digest}
              </p>
            </div>
          )}

          {/* Detalles en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <details className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <summary className="text-sm font-semibold text-gray-700 cursor-pointer mb-2">
                🐛 Ver detalles técnicos
              </summary>
              <div className="space-y-2 mt-2">
                <p className="text-sm text-red-600 font-mono">
                  {error.message}
                </p>
                {error.stack && (
                  <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Intentar nuevamente
            </Button>
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </div>

          {/* Recomendaciones */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Recomendaciones:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">→</span>
                <span>Verifica que las fechas tengan formato DD/MM/YYYY</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">→</span>
                <span>Asegúrate de que los días de anticipación estén entre 1 y 30</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">→</span>
                <span>Revisa que el Excel tenga las columnas correctas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">→</span>
                <span>Intenta con un archivo más pequeño para probar</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
