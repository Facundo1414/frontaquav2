'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

interface TourStep {
  target: string // CSS selector del elemento
  title: string
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  spotlightPadding?: number
}

interface OnboardingTourProps {
  steps: TourStep[]
  tourId: string // ID único para persistir en localStorage
  isOpen: boolean // Controlado externamente
  onClose: () => void
  onComplete?: () => void
}

interface TargetPosition {
  top: number
  left: number
  width: number
  height: number
}

export function OnboardingTour({ 
  steps, 
  tourId,
  isOpen,
  onClose,
  onComplete,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetPos, setTargetPos] = useState<TargetPosition | null>(null)
  const [isReady, setIsReady] = useState(false)
  const rafRef = useRef<number | null>(null)

  // Reset cuando se abre
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setIsReady(false)
      setTargetPos(null)
    }
  }, [isOpen])

  // Función para actualizar posición
  const updatePosition = useCallback(() => {
    if (!isOpen || !steps[currentStep]) return

    const target = document.querySelector(steps[currentStep].target) as HTMLElement
    if (!target) return

    const rect = target.getBoundingClientRect()
    
    setTargetPos({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    })
    setIsReady(true)
  }, [isOpen, currentStep, steps])

  // Actualizar posición del target cuando cambia el paso
  useEffect(() => {
    if (!isOpen || !steps[currentStep]) return

    const target = document.querySelector(steps[currentStep].target) as HTMLElement
    if (!target) return

    // Scroll suave al elemento
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Esperar a que termine el scroll y luego actualizar posición
    const scrollTimeout = setTimeout(() => {
      updatePosition()
    }, 400)

    // Usar requestAnimationFrame para actualizaciones continuas
    const tick = () => {
      updatePosition()
      rafRef.current = requestAnimationFrame(tick)
    }
    
    // Iniciar después del scroll
    const rafTimeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick)
    }, 450)

    return () => {
      clearTimeout(scrollTimeout)
      clearTimeout(rafTimeout)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isOpen, currentStep, steps, updatePosition])

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }, [currentStep, steps.length])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const handleComplete = useCallback(() => {
    localStorage.setItem(`tour_${tourId}_completed`, 'true')
    onClose()
    onComplete?.()
  }, [tourId, onClose, onComplete])

  const handleSkip = useCallback(() => {
    onClose()
  }, [onClose])

  // Teclas de navegación
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'Escape') handleSkip()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleNext, handlePrev, handleSkip])

  // No renderizar si no está listo
  if (!isOpen || !targetPos || !isReady) return null

  const step = steps[currentStep]
  const padding = step.spotlightPadding ?? 12

  // Calcular posición del tooltip
  const getTooltipPosition = () => {
    const position = step.position || 'bottom'
    const tooltipWidth = 320
    const tooltipHeight = 200
    const gap = 20

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = targetPos.top - tooltipHeight - gap
        left = targetPos.left + (targetPos.width / 2) - (tooltipWidth / 2)
        break
      case 'bottom':
        top = targetPos.top + targetPos.height + gap
        left = targetPos.left + (targetPos.width / 2) - (tooltipWidth / 2)
        break
      case 'left':
        top = targetPos.top + (targetPos.height / 2) - (tooltipHeight / 2)
        left = targetPos.left - tooltipWidth - gap
        break
      case 'right':
        top = targetPos.top + (targetPos.height / 2) - (tooltipHeight / 2)
        left = targetPos.left + targetPos.width + gap
        break
    }

    // Asegurar que el tooltip esté dentro de la pantalla
    const maxLeft = window.innerWidth - tooltipWidth - 20
    const maxTop = window.innerHeight - tooltipHeight - 20
    
    return {
      top: Math.max(20, Math.min(top, maxTop)),
      left: Math.max(20, Math.min(left, maxLeft)),
    }
  }

  const tooltipPos = getTooltipPosition()

  // Usar portal para renderizar fuera del DOM normal
  const content = (
    <>
      {/* Overlay oscuro con spotlight - usando clip-path para mejor rendimiento */}
      <div 
        className="fixed inset-0 z-[9998] bg-black/70 transition-all duration-300"
        style={{
          clipPath: `polygon(
            0% 0%, 
            0% 100%, 
            ${targetPos.left - padding}px 100%, 
            ${targetPos.left - padding}px ${targetPos.top - padding}px, 
            ${targetPos.left + targetPos.width + padding}px ${targetPos.top - padding}px, 
            ${targetPos.left + targetPos.width + padding}px ${targetPos.top + targetPos.height + padding}px, 
            ${targetPos.left - padding}px ${targetPos.top + targetPos.height + padding}px, 
            ${targetPos.left - padding}px 100%, 
            100% 100%, 
            100% 0%
          )`
        }}
        onClick={handleSkip}
      />

      {/* Borde brillante alrededor del elemento */}
      <div
        className="fixed z-[9999] pointer-events-none rounded-xl border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all duration-300"
        style={{
          top: targetPos.top - padding,
          left: targetPos.left - padding,
          width: targetPos.width + padding * 2,
          height: targetPos.height + padding * 2,
        }}
      />

      {/* Tooltip del paso */}
      <div
        className="fixed z-[10000] w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in"
        style={{
          top: Math.max(16, Math.min(tooltipPos.top, window.innerHeight - 200)),
          left: Math.max(16, Math.min(tooltipPos.left, window.innerWidth - 336)),
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">
              Paso {currentStep + 1} de {steps.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-800 mb-2">{step.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{step.content}</p>
        </div>

        {/* Footer con navegación */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100">
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-slate-700 transition-colors"
          >
            Omitir tour
          </button>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="h-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="h-8 bg-cyan-600 hover:bg-cyan-700"
            >
              {currentStep === steps.length - 1 ? '¡Listo!' : 'Siguiente'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-3">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                idx === currentStep 
                  ? "bg-cyan-500 w-4" 
                  : idx < currentStep 
                    ? "bg-cyan-300" 
                    : "bg-slate-200"
              )}
            />
          ))}
        </div>
      </div>
    </>
  )

  // Renderizar en un portal para evitar problemas de z-index
  if (typeof document !== 'undefined') {
    return createPortal(content, document.body)
  }
  
  return content
}

// Botón para iniciar el tour - Más visible y atractivo
export function StartTourButton({ 
  onClick,
  className,
  variant = 'default'
}: { 
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'compact';
}) {
  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium",
          "bg-gradient-to-r from-cyan-500 to-teal-500 text-white",
          "rounded-full shadow-sm hover:shadow-md transition-all",
          "hover:from-cyan-600 hover:to-teal-600",
          className
        )}
      >
        <Sparkles className="w-3.5 h-3.5" />
        Tour guiado
      </button>
    )
  }
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2 px-4 py-2.5 text-sm font-medium",
        "bg-white border-2 border-cyan-500 text-cyan-700",
        "rounded-xl shadow-sm hover:shadow-md transition-all",
        "hover:bg-cyan-50 hover:border-cyan-600",
        className
      )}
    >
      <div className="p-1.5 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors">
        <Sparkles className="w-4 h-4 text-cyan-600" />
      </div>
      <div className="text-left">
        <span className="block font-semibold">Tour guiado</span>
        <span className="block text-xs text-slate-500">Aprende a usar AQUA</span>
      </div>
      <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
    </button>
  )
}
