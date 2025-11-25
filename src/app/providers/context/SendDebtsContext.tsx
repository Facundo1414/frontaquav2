// context/SendDebtsContext.tsx
'use client'
import { createContext, useContext, useState, ReactNode, useCallback } from 'react'


interface SendDebtsContextType {
  rawData: any[]
  setRawData: (data: any[]) => void
  notWhatsappData: string | null
  setNotWhatsappData : (filename: string) => void
  processedData: any[]
  setProcessedData: (data: any[]) => void
  filteredData: any[]
  setFilteredData: (data: any[]) => void
  activeStep: number
  setActiveStep: (step: number) => void
  fileNameFiltered: string | null
  setFileNameFiltered: (filename: string) => void
  processedFile: Blob | null
  setProcessedFile: (file: Blob | null) => void
  // 🎯 Nuevos campos para 4 pasos y feedback en tiempo real
  stepStatus: ('pending' | 'in-progress' | 'completed' | 'error')[]
  setStepStatus: (index: number, status: 'pending' | 'in-progress' | 'completed' | 'error') => void
  progressStats: {
    total: number
    completed: number
    failed: number
    pending: number
  }
  setProgressStats: (stats: { total: number; completed: number; failed: number; pending: number }) => void
  // 💰 Sobrecargo de cuota WhatsApp
  overQuotaCount: number
  setOverQuotaCount: (count: number) => void
}

const SendDebtsContext = createContext<SendDebtsContextType | undefined>(undefined)

export const SendDebtsProvider = ({ children }: { children: ReactNode }) => {
  const [filteredData, setFilteredDataState] = useState<any[]>([])
  const [notWhatsappData, setNotWhatsappData] = useState<string | null>(null)
  const [activeStep, setActiveStepState] = useState(0)
  const [rawData, setRawDataState] = useState<any[]>([])
  const [processedData, setProcessedDataState] = useState<any[]>([])
  const [fileNameFiltered, setFileNameFiltered] = useState<string | null>(null)
  const [processedFile, setProcessedFileState] = useState<Blob | null>(null)

  // 🎯 Estado para 4 pasos (compatible con 3 pasos actuales)
  const [stepStatus, setStepStatusState] = useState<('pending' | 'in-progress' | 'completed' | 'error')[]>([
    'pending',
    'pending',
    'pending',
    'pending',
  ])

  // 📊 Estadísticas de progreso en tiempo real
  const [progressStats, setProgressStatsState] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
  })

  // 💰 Sobrecargo de cuota WhatsApp
  const [overQuotaCount, setOverQuotaCount] = useState(0)

  const setFilteredData = (data: any[]) => {
    console.log('🎯 Context: setFilteredData llamado con', data?.length, 'filas')
    console.log('🔍 Primeras 2 filas del context:', data?.slice(0, 2))
    setFilteredDataState(data)
  }

  const setRawData = (data: any[]) => {
    console.log('📝 Context: setRawData llamado con', data?.length, 'filas')
    setRawDataState(data)
  }

  const setActiveStep = (step: number) => {
    console.log('🚶 Context: setActiveStep llamado con', step)
    console.log('📊 Context state en este momento:', {
      filteredDataLength: filteredData.length,
      rawDataLength: rawData.length,
      fileNameFiltered,
    })
    setActiveStepState(step)
  }

  const setStepStatus = useCallback((index: number, status: 'pending' | 'in-progress' | 'completed' | 'error') => {
    setStepStatusState(prev => {
      const newStatus = [...prev]
      newStatus[index] = status
      return newStatus
    })
  }, [])

  const setProgressStats = useCallback((stats: { total: number; completed: number; failed: number; pending: number }) => {
    setProgressStatsState(prev => {
      // Solo actualizar si los valores realmente cambiaron
      if (
        prev.total !== stats.total ||
        prev.completed !== stats.completed ||
        prev.failed !== stats.failed ||
        prev.pending !== stats.pending
      ) {
        return stats
      }
      return prev
    })
  }, [])

  return (
    <SendDebtsContext.Provider value={{
      rawData,
      setRawData,
      notWhatsappData,
      setNotWhatsappData,
      processedData,
      setProcessedData: setProcessedDataState,
      filteredData,
      setFilteredData,
      activeStep,
      setActiveStep,
      fileNameFiltered,
      setFileNameFiltered,
      processedFile,
      setProcessedFile: setProcessedFileState,
      stepStatus,
      setStepStatus,
      progressStats,
      setProgressStats,
      overQuotaCount,
      setOverQuotaCount,
    }}>
      {children}
    </SendDebtsContext.Provider>
  )
}


export const useSendDebtsContext = () => {
  const context = useContext(SendDebtsContext)
  if (context === undefined) {
    throw new Error('useSendDebtsContext debe ser usado dentro de SendDebtsProvider')
  }
  return context
}
