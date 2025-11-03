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
 * Error Boundary específico para Send Debts
 * Captura errores durante la carga, filtrado y envío de deudas
 */
export default function SendDebtsError({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    // 🔍 Logging estructurado con contexto de módulo
    handleError(error, 'senddebts', {
      errorBoundary: 'senddebts/error.tsx',
      feature: 'debt-sending',
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
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            Error en Envío de Deudas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-600">
            Ocurrió un error al procesar el envío de deudas. Esto puede deberse a:
          </p>

          {/* Posibles causas */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">
              Posibles causas:
            </h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>El archivo Excel tiene un formato incorrecto</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Hay problemas con la conexión a WhatsApp</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>El servidor está procesando demasiadas solicitudes</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Los datos contienen valores inválidos</span>
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
                <span>Verifica que el archivo Excel tenga el formato correcto</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">→</span>
                <span>Asegúrate de que WhatsApp esté conectado (revisa el estado arriba)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">→</span>
                <span>Intenta con un archivo más pequeño primero</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">→</span>
                <span>Espera unos segundos y vuelve a intentar</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
