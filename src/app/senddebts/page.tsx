'use client'
import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import { SendDebtsProvider, useSendDebtsContext } from '../providers/context/SendDebtsContext'
import { SendDebtsGuard } from './components/SendDebtsGuard'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { StepIndicator, Step } from './components/StepIndicator'
import { JobRecoveryNotification } from '@/components/JobRecoveryNotification'
import {
  SkeletonUploadFile,
  SkeletonSend,
  SkeletonDownload,
} from './components/SkeletonLoaders'

// Lazy load de componentes pesados
const StepUploadFile = dynamic(() => import('./components/StepUploadFile'), {
  loading: () => <SkeletonUploadFile />,
})

const StepSend = dynamic(() => import('./components/StepSend').then(mod => ({ default: mod.StepSend })), {
  loading: () => <SkeletonSend />,
})

const StepDownload = dynamic(() => import('./components/StepDownload').then(mod => ({ default: mod.StepDownload })), {
  loading: () => <SkeletonDownload />,
})

const DynamicExcelTable = dynamic(() => import('./components/DynamicExcelTable').then(mod => ({ default: mod.DynamicExcelTable })), {
  loading: () => <LoadingTable />,
})

// Lazy load para AnimatePresence y motion (framer-motion es pesado)
const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), {
  ssr: false,
}) as any

const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), {
  ssr: false,
}) as any

// Loading components
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

// Definicion de 3 pasos: Upload → Send → Download
const SEND_DEBTS_STEPS: Step[] = [
  {
    title: 'Cargar Archivo',
    description: 'Sube el Excel con datos de clientes',
    status: 'pending',
  },
  {
    title: 'Enviar Mensajes',
    description: 'Envío masivo con verificación automática',
    status: 'pending',
  },
  {
    title: 'Descargar Resultados',
    description: 'Descarga reportes y archivos generados',
    status: 'pending',
  },
]

function StepContent({ step }: { step: number }) {
  switch (step) {
    case 0: return <StepUploadFile />
    case 1: return <StepSend />
    case 2: return <StepDownload />
    default: return null
  }
}

function Content() {
  const { activeStep, setActiveStep } = useSendDebtsContext()
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

  // Calcular estado de cada paso dinamicamente
  const stepsWithStatus: Step[] = SEND_DEBTS_STEPS.map((step, index) => {
    if (index < activeStep) return { ...step, status: 'completed' as const }
    if (index === activeStep) return { ...step, status: 'in-progress' as const }
    return step
  })

  // Calcular progreso total (0-100)
  const totalProgress = Math.round((activeStep / (SEND_DEBTS_STEPS.length - 1)) * 100)

  return (
    <div className="min-h-screen px-6 py-4 space-y-4 max-w-[1600px] mx-auto">
      {/* Notificación de recuperación */}
      {showRecoveryNotification && (
        <JobRecoveryNotification
          jobType="senddebts"
          onRecover={handleRecoverJob}
          onDismiss={() => setShowRecoveryNotification(false)}
        />
      )}
      
      {/* Indicador de pasos horizontal */}
      <div className="sticky top-0 z-10 bg-background pb-2">
        <StepIndicator steps={stepsWithStatus} currentStep={activeStep} totalProgress={totalProgress} />
      </div>

      {/* Contenido del paso activo */}
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

      {/* Tabla de datos */}
      <AnimatePresence>
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="border rounded-xl shadow-sm bg-white"
        >
          <div className="max-h-[600px] overflow-y-auto p-4">
            <DynamicExcelTable />
          </div>
        </MotionDiv>
      </AnimatePresence>
    </div>
  )
}



export default function SendDebtsPage() {
  return (
    <SendDebtsGuard>
      <SendDebtsProvider>
        <Content />
      </SendDebtsProvider>
    </SendDebtsGuard>
  )
}
