'use client'

import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ButtonPreviewProps {
  label: string
  icon?: LucideIcon
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

/**
 * Componente para mostrar previsualizaciones visuales de botones en tutoriales
 * Renderiza una representación visual de cómo se ve un botón real en la interfaz
 */
export function ButtonPreview({ 
  label, 
  icon: Icon, 
  variant = 'default',
  size = 'default',
  className = ''
}: ButtonPreviewProps) {
  return (
    <div className="inline-flex items-center gap-3 p-3 bg-white border-2 border-purple-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 px-1">
        <span className="text-xs font-semibold text-purple-700 uppercase">Botón:</span>
      </div>
      <Button 
        variant={variant} 
        size={size}
        className={className}
        disabled
      >
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {label}
      </Button>
    </div>
  )
}
