// context/ProximosVencerContext.tsx
'use client'
import { createContext, useContext, useState, ReactNode, useMemo } from 'react'

// Función helper para calcular días hasta fin del mes actual
const calcularDiasHastaFinMesActual = (): number => {
  const hoy = new Date()
  const mesActual = hoy.getMonth()
  const añoActual = hoy.getFullYear()
  
  // Último día del mes actual (día 0 del mes siguiente)
  const finMesActual = new Date(añoActual, mesActual + 1, 0)
  
  // Calcular diferencia en días
  const diffTime = finMesActual.getTime() - hoy.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  // ✅ FIX Sprint 3: Validación para evitar diasAnticipacion = 0
  // Si estamos en el último día del mes (diffDays = 0), usar el mes siguiente completo
  if (diffDays <= 0) {
    const finMesSiguiente = new Date(añoActual, mesActual + 2, 0)
    const diffTimeSiguiente = finMesSiguiente.getTime() - hoy.getTime()
    return Math.ceil(diffTimeSiguiente / (1000 * 60 * 60 * 24))
  }
  
  return diffDays
}

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
  fechaDesdeTexto: string // "Hoy"
  fechaHastaTexto: string // "Último día de [Mes Actual]"
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
  
  // Calcular automáticamente días hasta fin del mes actual
  const diasAnticipacion = useMemo(() => calcularDiasHastaFinMesActual(), [])
  
  // Textos informativos para mostrar en UI
  const fechaDesdeTexto = "Hoy"
  const fechaHastaTexto = useMemo(() => {
    const hoy = new Date()
    const mesActual = hoy.getMonth()
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `Último día de ${meses[mesActual]}`
  }, [])

  const setFilteredData = (data: any[]) => {
    setFilteredDataState(data)
  }

  const setRawData = (data: any[]) => {
    setRawDataState(data)
  }

  const setActiveStep = (step: number) => {
    setActiveStepState(step)
  }

  // setDiasAnticipacion es solo para mantener compatibilidad, pero no se usa
  const setDiasAnticipacion = (_dias: number) => {
    // No hace nada - el valor se calcula automáticamente
    console.warn('setDiasAnticipacion llamado pero diasAnticipacion se calcula automáticamente')
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
      fechaDesdeTexto,
      fechaHastaTexto,
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