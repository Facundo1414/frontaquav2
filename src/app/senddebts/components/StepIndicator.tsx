// 🎯 Componente de Indicador de Pasos Mejorado
// Similar a la estética de /clientes-database pero más simple y claro

import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Step {
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  totalProgress?: number
}

export function StepIndicator({ steps, currentStep, totalProgress }: StepIndicatorProps) {
  // 📊 Usar progreso proporcionado o calcularlo
  const progress = totalProgress ?? (steps.length > 0 ? (currentStep / (steps.length - 1)) * 100 : 0)

  return (
    <div className="w-full">
      {/* Barra de progreso superior */}
      <div className="relative mb-8">
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Pasos */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepId = index + 1
            const isActive = index === currentStep
            const isCompleted = step.status === 'completed'
            const isError = step.status === 'error'
            const isInProgress = step.status === 'in-progress'

            return (
              <div key={stepId} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
                {/* Círculo del paso con animación de pulso */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 border-4 border-white shadow-lg',
                    {
                      'bg-blue-600 text-white animate-pulse': isInProgress, // 🎯 Animación de pulso en lugar de spinner
                      'bg-green-600 text-white': isCompleted && !isError,
                      'bg-red-600 text-white': isError,
                      'bg-gray-200 text-gray-400': !isActive && !isCompleted && !isError && !isInProgress,
                    }
                  )}
                >
                  {isCompleted && !isError && <CheckCircle2 className="w-5 h-5" />}
                  {!isCompleted && !isError && (
                    <span className="text-sm font-bold">{stepId}</span>
                  )}
                </div>

                {/* Título y descripción */}
                <div className="mt-3 text-center max-w-[150px]">
                  <p
                    className={cn('text-sm font-semibold transition-colors', {
                      'text-blue-600': isActive && !isError,
                      'text-green-600': isCompleted && !isError,
                      'text-red-600': isError,
                      'text-gray-500': !isActive && !isCompleted && !isError,
                    })}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
