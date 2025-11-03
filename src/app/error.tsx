'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { handleError } from '@/lib/error-logging'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error Boundary Global de Next.js 15
 * Captura errores en tiempo de ejecución en toda la aplicación
 */
export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    // 🔍 Logging estructurado de errores
    handleError(error, 'global', {
      errorBoundary: 'app/error.tsx',
      canRecover: true,
    })
  }, [error])

  const handleGoHome = () => {
    router.push('/')
  }

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Icono de error */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-16 w-16 text-red-600" />
          </div>
        </div>

        {/* Título y mensaje */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Algo salió mal
          </h1>
          <p className="text-gray-600">
            Lo sentimos, ocurrió un error inesperado. Nuestro equipo ha sido notificado
            y estamos trabajando para solucionarlo.
          </p>
        </div>

        {/* Detalles del error (solo en desarrollo) */}
        {isDevelopment && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              🐛 Detalles del error (solo en desarrollo):
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-600">Mensaje:</span>
                <p className="text-sm text-red-600 mt-1 font-mono">
                  {error.message}
                </p>
              </div>
              {error.digest && (
                <div>
                  <span className="text-xs font-medium text-gray-600">Digest:</span>
                  <p className="text-sm text-gray-700 mt-1 font-mono">
                    {error.digest}
                  </p>
                </div>
              )}
              {error.stack && (
                <div>
                  <span className="text-xs font-medium text-gray-600">Stack Trace:</span>
                  <pre className="text-xs text-gray-700 mt-1 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error ID para soporte */}
        {error.digest && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">ID de Error:</span> {error.digest}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Guarda este ID para reportar el problema a soporte
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2"
            size="lg"
          >
            <RefreshCcw className="h-5 w-5" />
            Intentar nuevamente
          </Button>
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
            size="lg"
          >
            <Home className="h-5 w-5" />
            Ir al inicio
          </Button>
        </div>

        {/* Sugerencias */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            ¿Qué puedes hacer?
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Recargar la página o intentar nuevamente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Verificar tu conexión a internet</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Limpiar la caché del navegador</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Contactar a soporte si el problema persiste</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
