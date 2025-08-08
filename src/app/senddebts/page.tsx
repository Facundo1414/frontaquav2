'use client'
import { StepsSidebar } from './components/StepsSidebar'
import StepUploadFile from './components/StepUploadFile'
import { SendDebtsProvider, useSendDebtsContext } from '../providers/context/SendDebtsContext'
import { AnimatePresence, motion } from 'framer-motion'
import { DynamicExcelTable } from './components/DynamicExcelTable'
import { StepSend } from './components/StepSend'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StepDownload } from './components/StepDownload'


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
        {/* StepContent: 30% de la altura total del layout */}
        <Card className="flex flex-col flex-[3] w-full overflow-hidden">
          <CardContent className="h-full overflow-y-auto">
                <StepContent step={activeStep} />
          </CardContent>
        </Card>


        {/* Tabla: 70% de la altura total */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-[7] border rounded-xl shadow p-4 bg-white overflow-y-auto"
          >
            <DynamicExcelTable />
          </motion.div>
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
