'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Global Error Handler para Next.js 15
 * Captura errores críticos que no son manejados por error.tsx
 * Nota: Este archivo reemplaza completamente el HTML de la página
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // 🔍 Logging de errores críticos
    console.error('Error crítico capturado por Global Error Handler:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      severity: 'CRITICAL',
      errorBoundary: 'app/global-error.tsx',
    })

    // Enviar a servicio de logging externo (ya que no podemos importar en global-error)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // TODO: Enviar a servicio de logging
      // fetch('/api/error-logging', { ... })
    }
  }, [error])

  return (
    <html lang="es">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #fef2f2, #fed7aa)',
          padding: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            maxWidth: '42rem',
            width: '100%',
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
            padding: '2rem',
          }}>
            {/* Icono de error */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                borderRadius: '9999px',
                background: '#fee2e2',
                padding: '1rem',
                display: 'inline-flex',
              }}>
                <AlertTriangle style={{
                  width: '4rem',
                  height: '4rem',
                  color: '#dc2626',
                }} />
              </div>
            </div>

            {/* Título */}
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '1rem',
              color: '#111827',
            }}>
              Error Crítico
            </h1>

            {/* Mensaje */}
            <p style={{
              textAlign: 'center',
              color: '#6b7280',
              marginBottom: '2rem',
              lineHeight: '1.5',
            }}>
              La aplicación encontró un error crítico. Por favor, intenta recargar la página.
              Si el problema persiste, contacta a soporte.
            </p>

            {/* Detalles del error */}
            {error.digest && (
              <div style={{
                background: '#dbeafe',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem',
                border: '1px solid #93c5fd',
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#1e40af',
                }}>
                  <strong>ID de Error:</strong> {error.digest}
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#2563eb',
                  marginTop: '0.25rem',
                }}>
                  Guarda este ID para reportar el problema
                </p>
              </div>
            )}

            {/* Botón de reset */}
            <button
              onClick={reset}
              style={{
                width: '100%',
                background: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2563eb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#3b82f6'
              }}
            >
              <RefreshCcw style={{ width: '1.25rem', height: '1.25rem' }} />
              Recargar página
            </button>

            {/* Mensaje de desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: '#f3f4f6',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
              }}>
                <p style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}>
                  🐛 Detalles del error (solo en desarrollo):
                </p>
                <pre style={{
                  fontSize: '0.75rem',
                  color: '#dc2626',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '10rem',
                }}>
                  {error.message}
                </pre>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
