'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { handleError } from '@/lib/error-logging'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
  module?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary reutilizable para envolver componentes individuales
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary module="excel-upload">
 *   <ExcelUploadComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log el error con contexto
    handleError(error, this.props.module, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'components/ErrorBoundary',
    })

    // Callback personalizado si existe
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback por defecto
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-10 w-10 text-red-600 mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error en el componente
          </h3>
          <p className="text-sm text-red-600 mb-4 text-center">
            {this.state.error?.message || 'Ocurrió un error inesperado'}
          </p>
          <Button
            onClick={this.handleReset}
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Intentar nuevamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook-based Error Boundary (para componentes funcionales)
 * Nota: En React 18+ se prefiere usar Error Boundaries de clase
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  module?: string,
  fallback?: ReactNode,
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary module={module} fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
