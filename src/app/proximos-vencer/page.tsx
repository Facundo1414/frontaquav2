'use client'

import { ProximosVencerProvider, useProximosVencerContext } from '../providers/context/ProximosVencerContext'
import { StepsSidebarProximosVencer } from './components/StepsSidebarProximosVencer'
import StepUploadFileProximosVencer from './components/StepUploadFileProximosVencer'
import StepSendProximosVencer from './components/StepSendProximosVencer'
import StepDownloadProximosVencer from './components/StepDownloadProximosVencer'
import { DynamicExcelTableProximosVencer } from './components/DynamicExcelTableProximosVencer'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-[4] border rounded-xl shadow p-4 bg-white overflow-y-auto"
            >
              <DynamicExcelTableProximosVencer />
            </motion.div>
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