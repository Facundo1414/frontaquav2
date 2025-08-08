// context/SendDebtsContext.tsx
'use client'
import { createContext, useContext, useState, ReactNode } from 'react'


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
}

const SendDebtsContext = createContext<SendDebtsContextType | undefined>(undefined)

export const SendDebtsProvider = ({ children }: { children: ReactNode }) => {
  const [filteredData, setFilteredDataState] = useState<any[]>([])
  const [notWhatsappData, setNotWhatsappData] = useState<string | null>(null)
  const [activeStep, setActiveStepState] = useState(0)
  const [rawData, setRawDataState] = useState<any[]>([])
  const [processedData, setProcessedDataState] = useState<any[]>([])
  const [fileNameFiltered, setFileNameFiltered] = useState<string | null>(null)
  const [processedFile, setProcessedFileState] = useState<Blob | null>(null);


  const setFilteredData = (data: any[]) => {
    setFilteredDataState(data)
  }

  const setRawData = (data: any[]) => {
    setRawDataState(data)
  }

  const setActiveStep = (step: number) => {
    setActiveStepState(step)
  }

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
