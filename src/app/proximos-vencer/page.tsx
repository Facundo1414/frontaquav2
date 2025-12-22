'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { ProximosVencerProvider, useProximosVencerContext } from '../providers/context/ProximosVencerContext'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'
import { JobRecoveryNotification } from '@/components/JobRecoveryNotification'

// 🚀 Lazy load de componentes pesados
const StepsSidebarProximosVencer = dynamic(() => import('./components/StepsSidebarProximosVencer').then(mod => ({ default: mod.StepsSidebarProximosVencer })), {
  loading: () => <div className="w-64 bg-gray-50 animate-pulse rounded-lg" />,
})

const StepUploadFileProximosVencer = dynamic(() => import('./components/StepUploadFileProximosVencer'), {
  loading: () => <LoadingStep />,
})

const StepSendProximosVencer = dynamic(() => import('./components/StepSendProximosVencer'), {
  loading: () => <LoadingStep />,
})

const StepDownloadProximosVencer = dynamic(() => import('./components/StepDownloadProximosVencer'), {
  loading: () => <LoadingStep />,
})

const DynamicExcelTableProximosVencer = dynamic(() => import('./components/DynamicExcelTableProximosVencer').then(mod => ({ default: mod.DynamicExcelTableProximosVencer })), {
  loading: () => <LoadingTable />,
})

// Lazy load framer-motion
const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), {
  ssr: false,
}) as any

const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), {
  ssr: false,
}) as any

// 🎨 Loading components
function LoadingStep() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}

function LoadingTable() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
      ))}
    </div>
  )
}

function StepContent({ step }: { step: number }) {
  switch (step) {
    case 0: return <StepUploadFileProximosVencer />
    case 1: return <StepSendProximosVencer />
    case 2: return <StepDownloadProximosVencer />
    default: return null
  }
}

function Content() {
  const { activeStep, setActiveStep } = useProximosVencerContext()
  const [showRecoveryNotification, setShowRecoveryNotification] = useState(true)

  const handleRecoverJob = (jobId: string, progress: number) => {
    // Determinar paso según progreso
    if (progress >= 66) {
      setActiveStep(2) // Download
    } else if (progress >= 33) {
      setActiveStep(1) // Send
    }
    setShowRecoveryNotification(false)
  }

  return (
    <div className="min-h-screen px-6 py-4 space-y-4 max-w-[1600px] mx-auto">
      {/* Notificación de recuperación */}
      {showRecoveryNotification && (
        <JobRecoveryNotification
          jobType="proximos_vencer"
          onRecover={handleRecoverJob}
          onDismiss={() => setShowRecoveryNotification(false)}
        />
      )}
      
      {/* 🧪 Banner de prueba - Más compacto */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-medium">Funcionalidad en Prueba:</span> Verifica los resultados antes de usar en producción.
          </p>
        </div>
      </div>

      {/* 🎯 Indicador de pasos (sidebar horizontal en la parte superior) */}
      <div className="sticky top-0 z-10 bg-background pb-2">
        <StepsSidebarProximosVencer activeStep={activeStep} />
      </div>

      {/* 📋 Contenido del paso activo - Puede crecer libremente */}
      <Card className="w-full">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <MotionDiv
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <StepContent step={activeStep} />
            </MotionDiv>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* 📊 Tabla de datos - Abajo, se accede con scroll */}
      <AnimatePresence>
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="border rounded-xl shadow-sm bg-white"
        >
          <div className="max-h-[600px] overflow-y-auto p-4">
            <DynamicExcelTableProximosVencer />
          </div>
        </MotionDiv>
      </AnimatePresence>
    </div>
  )
}

export default function ProximosVencerPage() {
  return (
    <ProximosVencerProvider>
      <Content />
    </ProximosVencerProvider>
  )
}