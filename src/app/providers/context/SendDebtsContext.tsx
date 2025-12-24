// context/SendDebtsContext.tsx
'use client'
import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { logger } from '@/lib/logger';

// 🔑 Claves de localStorage
const STORAGE_KEYS = {
  ACTIVE_STEP: 'senddebts_active_step',
  FILTERED_DATA: 'senddebts_filtered_data',
  FILE_NAME_FILTERED: 'senddebts_filename_filtered',
  TIMESTAMP: 'senddebts_timestamp',
}

// ⏰ Expiración de datos guardados (30 minutos)
const DATA_EXPIRATION_MS = 30 * 60 * 1000;


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
  // 🧹 Reset completo
  resetSendDebts: () => void
}

const SendDebtsContext = createContext<SendDebtsContextType | undefined>(undefined)

export const SendDebtsProvider = ({ children }: { children: ReactNode }) => {
  const [filteredData, setFilteredDataState] = useState<any[]>([])
  const [notWhatsappData, setNotWhatsappData] = useState<string | null>(null)
  const [activeStep, setActiveStepState] = useState(0)
  const [rawData, setRawDataState] = useState<any[]>([])
  const [processedData, setProcessedDataState] = useState<any[]>([])
  const [fileNameFiltered, setFileNameFilteredState] = useState<string | null>(null)
  const [processedFile, setProcessedFileState] = useState<Blob | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

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
          logger.log('🔄 Restaurando activeStep desde localStorage:', step)
          setActiveStepState(step)
        }
        
        if (savedFilteredData) {
          const data = JSON.parse(savedFilteredData)
          logger.log('🔄 Restaurando filteredData desde localStorage:', data?.length, 'filas')
          setFilteredDataState(data)
        }
        
        if (savedFileName) {
          logger.log('🔄 Restaurando fileName desde localStorage:', savedFileName)
          setFileNameFilteredState(savedFileName)
        }
      } else {
        // Datos expirados, limpiar
        clearStoredData()
      }
    } catch (e) {
      logger.error('Error restaurando estado de SendDebts:', e)
      clearStoredData()
    }
    
    setIsHydrated(true)
  }, [])

  // 🧹 Función para limpiar datos guardados
  const clearStoredData = () => {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_STEP)
    localStorage.removeItem(STORAGE_KEYS.FILTERED_DATA)
    localStorage.removeItem(STORAGE_KEYS.FILE_NAME_FILTERED)
    localStorage.removeItem(STORAGE_KEYS.TIMESTAMP)
  }

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
    logger.log('🎯 Context: setFilteredData llamado con', data?.length, 'filas')
    logger.log('🔍 Primeras 2 filas del context:', data?.slice(0, 2))
    setFilteredDataState(data)
    
    // 💾 Guardar en localStorage
    if (typeof window !== 'undefined' && data?.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEYS.FILTERED_DATA, JSON.stringify(data))
        localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString())
      } catch (e) {
        logger.error('Error guardando filteredData:', e)
      }
    }
  }

  const setFileNameFiltered = (filename: string) => {
    logger.log('📁 Context: setFileNameFiltered llamado con', filename)
    setFileNameFilteredState(filename)
    
    // 💾 Guardar en localStorage
    if (typeof window !== 'undefined' && filename) {
      localStorage.setItem(STORAGE_KEYS.FILE_NAME_FILTERED, filename)
      localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString())
    }
  }

  const setRawData = (data: any[]) => {
    logger.log('📝 Context: setRawData llamado con', data?.length, 'filas')
    setRawDataState(data)
  }

  const setActiveStep = (step: number) => {
    logger.log('🚶 Context: setActiveStep llamado con', step)
    logger.log('📊 Context state en este momento:', {
      filteredDataLength: filteredData.length,
      rawDataLength: rawData.length,
      fileNameFiltered,
    })
    setActiveStepState(step)
    
    // 💾 Guardar en localStorage
    if (typeof window !== 'undefined') {
      if (step === 0) {
        // Si vuelve al paso 0, limpiar datos guardados
        clearStoredData()
      } else {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_STEP, step.toString())
        localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString())
      }
    }
  }

  // 🧹 Función para resetear todo el estado (cuando se completa o cancela)
  const resetSendDebts = useCallback(() => {
    logger.log('🧹 Reseteando estado de SendDebts')
    setActiveStepState(0)
    setFilteredDataState([])
    setRawDataState([])
    setProcessedDataState([])
    setFileNameFilteredState(null)
    setProcessedFileState(null)
    setNotWhatsappData(null)
    setOverQuotaCount(0)
    clearStoredData()
  }, [])

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
      resetSendDebts,
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
