import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const steps = [
  { title: 'Filtrar archivo' },
  { title: 'Enviar archivo' },
  { title: 'Descargar resultados' }
]

export function StepsSidebar({ activeStep }: { activeStep: number }) {
  return (
    <div className="w-64 border-r p-4">
      <ul className="space-y-4">
        {steps.map((step, index) => (
          <li key={index}>
            <div
              className={cn(
                'flex items-center gap-3 font-medium',
                index === activeStep ? 'text-blue-600' : 'text-gray-500'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center border',
                index === activeStep ? 'bg-blue-600 text-white' : 'bg-white border-gray-400 text-gray-400'
              )}>
                {index + 1}
              </div>
              {step.title}
            </div>
            {index < steps.length - 1 && <Separator className="ml-3 mt-2" />}
          </li>
        ))}
      </ul>
    </div>
  )
}
