'use client'
import dynamic from 'next/dynamic'
import { ProximosVencerProvider, useProximosVencerContext } from '../providers/context/ProximosVencerContext'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'

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
  const { activeStep } = useProximosVencerContext()

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)]">
      {/* Banner de prueba */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mb-4 rounded-r-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              🧪 Funcionalidad en Prueba
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Esta funcionalidad está siendo probada. Verifica los resultados antes de usar en producción.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <StepsSidebarProximosVencer activeStep={activeStep} />

        <div className="flex flex-col flex-1 pl-4 py-2 gap-6 max-w-6xl w-full mx-auto overflow-hidden">
          {/* StepContent: 60% de la altura total del layout */}
          <Card className="flex flex-col flex-[6] w-full overflow-hidden">
            <CardContent className="h-full overflow-y-auto">
              <StepContent step={activeStep} />
            </CardContent>
          </Card>

          {/* Tabla: 40% de la altura total */}
          <AnimatePresence>
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-[4] border rounded-xl shadow p-4 bg-white overflow-y-auto"
            >
              <DynamicExcelTableProximosVencer />
            </MotionDiv>
          </AnimatePresence>
        </div>
      </div>
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