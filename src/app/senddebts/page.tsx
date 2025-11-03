'use client'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { SendDebtsProvider, useSendDebtsContext } from '../providers/context/SendDebtsContext'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// 🚀 Lazy load de componentes pesados
const StepsSidebar = dynamic(() => import('./components/StepsSidebar').then(mod => ({ default: mod.StepsSidebar })), {
  loading: () => <div className="w-64 bg-gray-50 animate-pulse rounded-lg" />,
})

const StepUploadFile = dynamic(() => import('./components/StepUploadFile'), {
  loading: () => <LoadingStep />,
})

const StepSend = dynamic(() => import('./components/StepSend').then(mod => ({ default: mod.StepSend })), {
  loading: () => <LoadingStep />,
})

const StepDownload = dynamic(() => import('./components/StepDownload').then(mod => ({ default: mod.StepDownload })), {
  loading: () => <LoadingStep />,
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
    case 0: return <StepUploadFile />
    case 1: return <StepSend />
    case 2: return <StepDownload />
    default: return null
  }
}

function Content() {
  const { activeStep, setActiveStep } = useSendDebtsContext()

  return (
    <div className="flex h-[calc(100vh-9rem)]"> {/* Altura total entre header y footer */}
      <StepsSidebar activeStep={activeStep} />

      <div className="flex flex-col flex-1 pl-4 py-2 gap-6 max-w-6xl w-full mx-auto">
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
            <DynamicExcelTable />
          </MotionDiv>
        </AnimatePresence>
          </div>
    </div>
  )
}



export default function SendDebtsPage() {
  return (
    <SendDebtsProvider>
      <Content />
    </SendDebtsProvider>
  )
}
