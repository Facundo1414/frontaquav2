// context/ProximosVencerContext.tsx
'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface ProximosVencerContextType {
  rawData: any[]
  setRawData: (data: any[]) => void
  notWhatsappData: string | null
  setNotWhatsappData: (filename: string | null) => void
  processedData: any[]
  setProcessedData: (data: any[]) => void
  filteredData: any[]
  setFilteredData: (data: any[]) => void
  activeStep: number
  setActiveStep: (step: number) => void
  fileNameFiltered: string | null
  setFileNameFiltered: (filename: string | null) => void
  processedFile: Blob | null
  setProcessedFile: (file: Blob | null) => void
  diasAnticipacion: number
  setDiasAnticipacion: (dias: number) => void
}

const ProximosVencerContext = createContext<ProximosVencerContextType | undefined>(undefined)

export const ProximosVencerProvider = ({ children }: { children: ReactNode }) => {
  const [filteredData, setFilteredDataState] = useState<any[]>([])
  const [notWhatsappData, setNotWhatsappData] = useState<string | null>(null)
  const [activeStep, setActiveStepState] = useState(0)
  const [rawData, setRawDataState] = useState<any[]>([])
  const [processedData, setProcessedDataState] = useState<any[]>([])
  const [fileNameFiltered, setFileNameFiltered] = useState<string | null>(null)
  const [processedFile, setProcessedFileState] = useState<Blob | null>(null)
  const [diasAnticipacion, setDiasAnticipacionState] = useState<number>(1)

  const setFilteredData = (data: any[]) => {
    setFilteredDataState(data)
  }

  const setRawData = (data: any[]) => {
    setRawDataState(data)
  }

  const setActiveStep = (step: number) => {
    setActiveStepState(step)
  }

  const setDiasAnticipacion = (dias: number) => {
    setDiasAnticipacionState(dias)
  }

  return (
    <ProximosVencerContext.Provider value={{
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
      diasAnticipacion,
      setDiasAnticipacion,
    }}>
      {children}
    </ProximosVencerContext.Provider>
  )
}

export const useProximosVencerContext = () => {
  const context = useContext(ProximosVencerContext)
  if (context === undefined) {
    throw new Error('useProximosVencerContext debe ser usado dentro de ProximosVencerProvider')
  }
  return context
}