// context/ProximosVencerContext.tsx
'use client'
import { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react'
import { logger } from '@/lib/logger';

// 🔑 Claves de localStorage
const STORAGE_KEYS = {
  ACTIVE_STEP: 'proximos_vencer_active_step',
  FILTERED_DATA: 'proximos_vencer_filtered_data',
  FILE_NAME_FILTERED: 'proximos_vencer_filename_filtered',
  TIMESTAMP: 'proximos_vencer_timestamp',
}

// ⏰ Expiración de datos guardados (30 minutos)
const DATA_EXPIRATION_MS = 30 * 60 * 1000;

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
  // 🧹 Reset completo
  resetProximosVencer: () => void
}

const ProximosVencerContext = createContext<ProximosVencerContextType | undefined>(undefined)

export const ProximosVencerProvider = ({ children }: { children: ReactNode }) => {
  const [filteredData, setFilteredDataState] = useState<any[]>([])
  const [notWhatsappData, setNotWhatsappData] = useState<string | null>(null)
  const [activeStep, setActiveStepState] = useState(0)
  const [rawData, setRawDataState] = useState<any[]>([])
  const [processedData, setProcessedDataState] = useState<any[]>([])
  const [fileNameFiltered, setFileNameFilteredState] = useState<string | null>(null)
  const [processedFile, setProcessedFileState] = useState<Blob | null>(null)

  // 🧹 Función para limpiar datos guardados
  const clearStoredData = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_STEP)
    localStorage.removeItem(STORAGE_KEYS.FILTERED_DATA)
    localStorage.removeItem(STORAGE_KEYS.FILE_NAME_FILTERED)
    localStorage.removeItem(STORAGE_KEYS.TIMESTAMP)
  }, [])

  // 🔄 Restaurar estado desde localStorage al montar
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const timestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP)
      const now = Date.now()
      
      // Verificar si los datos no expiraron
      if (timestamp && (now - parseInt(timestamp)) < DATA_EXPIRATION_MS) {
        const savedStep = localStorage.getItem(STORAGE_KEYS.ACTIVE_STEP)
        const savedFilteredData = localStorage.getItem(STORAGE_KEYS.FILTERED_DATA)
        const savedFileName = localStorage.getItem(STORAGE_KEYS.FILE_NAME_FILTERED)
        
        if (savedStep) {
          const step = parseInt(savedStep)
          logger.log('🔄 [ProximosVencer] Restaurando activeStep:', step)
          setActiveStepState(step)
        }
        
        if (savedFilteredData) {
          const data = JSON.parse(savedFilteredData)
          logger.log('🔄 [ProximosVencer] Restaurando filteredData:', data?.length, 'filas')
          setFilteredDataState(data)
        }
        
        if (savedFileName) {
          logger.log('🔄 [ProximosVencer] Restaurando fileName:', savedFileName)
          setFileNameFilteredState(savedFileName)
        }
      } else {
        // Datos expirados, limpiar
        clearStoredData()
      }
    } catch (e) {
      logger.error('Error restaurando estado de ProximosVencer:', e)
      clearStoredData()
    }
  }, [clearStoredData])
  
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
    // 💾 Guardar en localStorage
    if (typeof window !== 'undefined' && data.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEYS.FILTERED_DATA, JSON.stringify(data))
        localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString())
        logger.log('💾 [ProximosVencer] Guardado filteredData:', data.length, 'filas')
      } catch (e) {
        logger.error('Error guardando filteredData:', e)
      }
    }
  }

  const setFileNameFiltered = (filename: string | null) => {
    setFileNameFilteredState(filename)
    // 💾 Guardar en localStorage
    if (typeof window !== 'undefined' && filename) {
      try {
        localStorage.setItem(STORAGE_KEYS.FILE_NAME_FILTERED, filename)
        localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString())
        logger.log('💾 [ProximosVencer] Guardado fileName:', filename)
      } catch (e) {
        logger.error('Error guardando fileName:', e)
      }
    }
  }

  const setRawData = (data: any[]) => {
    setRawDataState(data)
  }

  const setActiveStep = (step: number) => {
    setActiveStepState(step)
    // 💾 Guardar en localStorage (solo si > 0)
    if (typeof window !== 'undefined') {
      try {
        if (step > 0) {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_STEP, step.toString())
          localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString())
          logger.log('💾 [ProximosVencer] Guardado activeStep:', step)
        } else {
          // Si volvemos al paso 0, limpiar todo
          clearStoredData()
          logger.log('🧹 [ProximosVencer] Limpiado localStorage (paso 0)')
        }
      } catch (e) {
        logger.error('Error guardando activeStep:', e)
      }
    }
  }

  // 🧹 Reset completo del contexto
  const resetProximosVencer = useCallback(() => {
    logger.log('🧹 [ProximosVencer] Reset completo')
    setFilteredDataState([])
    setNotWhatsappData(null)
    setActiveStepState(0)
    setRawDataState([])
    setProcessedDataState([])
    setFileNameFilteredState(null)
    setProcessedFileState(null)
    clearStoredData()
  }, [clearStoredData])

  // setDiasAnticipacion es solo para mantener compatibilidad, pero no se usa
  const setDiasAnticipacion = (_dias: number) => {
    // No hace nada - el valor se calcula automáticamente
    logger.warn('setDiasAnticipacion llamado pero diasAnticipacion se calcula automáticamente')
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
      resetProximosVencer,
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