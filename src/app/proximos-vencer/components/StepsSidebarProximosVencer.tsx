import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const steps = [
  { title: 'Cargar y Configurar', description: 'Sube Excel y configura días de anticipación' },
  { title: 'Enviar Notificaciones', description: 'Envío masivo de próximos a vencer' },
  { title: 'Descargar Resultados', description: 'Descarga reportes generados' }
]

export function StepsSidebarProximosVencer({ activeStep }: { activeStep: number }) {
  const totalProgress = Math.round((activeStep / (steps.length - 1)) * 100)

  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-orange-600 h-full transition-all duration-500 ease-out"
          style={{ width: `${totalProgress}%` }}
        />
      </div>

      {/* Steps horizontal */}
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < activeStep
          const isActive = index === activeStep
          const isPending = index > activeStep

          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center w-full">
                {/* Circle indicator */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    isCompleted && 'bg-green-500 text-white',
                    isActive && 'bg-orange-600 text-white ring-4 ring-orange-200',
                    isPending && 'bg-gray-200 text-gray-500'
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                </div>

                {/* Title and description */}
                <div className="text-center mt-2 w-full">
                  <p className={cn(
                    'text-sm font-medium',
                    isActive && 'text-orange-600',
                    isCompleted && 'text-green-600',
                    isPending && 'text-gray-500'
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  'h-0.5 flex-1 mx-2 transition-colors',
                  index < activeStep ? 'bg-green-500' : 'bg-gray-300'
                )} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}