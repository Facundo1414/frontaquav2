'use client'
import { useProximosVencerContext } from '@/app/providers/context/ProximosVencerContext'
import { sendAndScrapeProximosVencer, listResultBackups, getFileByName } from '@/lib/api'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { ProgressCard } from '@/app/senddebts/components/ProgressCard'
import { useProgressWebSocket } from '@/hooks/useProgressWebSocket'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { SendConfirmationModal } from '@/components/whatsapp/SendConfirmationModal'
import { useBrowserNotification } from '@/hooks/useBrowserNotification'
import { useJobRecovery } from '@/hooks/useJobRecovery'
import { useJobProgress } from '@/hooks/useJobProgress'
import { logger } from '@/lib/logger';

// 📋 Plantilla de Meta para modo SYSTEM (Cloud API) - Próximos a Vencer
const SYSTEM_TEMPLATE_PREVIEW_PROXIMOS = `Hola {{1}}, te informamos que tu cuota del plan de pagos vence en los próximos días.

📄 Adjuntamos tu comprobante con el detalle completo e información de medios de pago disponibles.

Para consultas sobre tu cuenta, puedes responder este mensaje.
Cclip • Al servicio de Aguas Cordobesas.

━━━━━━━━━━━━━━━━━━━━
💬 Tengo consultas`

export default function StepSendProximosVencer() {
  const {
    setProcessedFile,
    fileNameFiltered,
    setActiveStep,
    setRawData,
    setProcessedData,
    setFilteredData,
    setFileNameFiltered,
    setNotWhatsappData,
    diasAnticipacion,
    fechaDesdeTexto,
    fechaHastaTexto,
    filteredData,
    resetProximosVencer,
  } = useProximosVencerContext()
  const { accessToken } = useGlobalContext()
  
  // Extraer userId del token JWT (sub claim)
  const userId = accessToken ? JSON.parse(atob(accessToken.split('.')[1])).sub : undefined

  // 🔍 Detectar modo de WhatsApp (system = Cloud API, personal = cuenta propia)
  const [isSystemMode, setIsSystemMode] = useState(true) // Default a system (más seguro)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mode = localStorage.getItem('whatsapp_mode') || 'system'
      setIsSystemMode(mode === 'system')
    }
  }, [])

  const [message, setMessage] = useState('');

  // Actualizar el mensaje cuando cambien los días de anticipación
  useEffect(() => {
    setMessage(`Hola \${clientName}, te informamos que tu cuota del plan de pagos vence en los próximos ${diasAnticipacion} días. 

📄 Adjuntamos tu comprobante con el detalle completo e información de medios de pago disponibles.

💬 Para consultas sobre tu cuenta, puedes responder este mensaje.

🌐 Cclip • Al servicio de Aguas Cordobesas.`);
  }, []); // Solo una vez al montar

  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [backupFiles, setBackupFiles] = useState<string[]>([])
  const [waitingForResults, setWaitingForResults] = useState(false)
  const [pollingAttempts, setPollingAttempts] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState<string>('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [sendStats, setSendStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
  })

  // 🔔 Hook para notificaciones del navegador
  const { notifyProcessComplete, requestPermission } = useBrowserNotification()

  // 🔄 Hook para detectar jobs activos al montar (recuperación)
  const { latestJob, hasActiveJobs } = useJobRecovery({ jobType: 'proximos_vencer' })

  // Solicitar permiso de notificaciones al montar
  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  // 🔄 Efecto para recuperar estado de job activo
  useEffect(() => {
    if (latestJob && hasActiveJobs && !jobId) {
      logger.log('🔄 Recuperando job activo (próximos):', latestJob.jobId, 'status:', latestJob.status)
      setJobId(latestJob.jobId)
      setLoading(true)
      
      // Restaurar stats si están disponibles
      if (latestJob.processedItems !== undefined && latestJob.totalItems !== undefined) {
        setSendStats({
          total: latestJob.totalItems,
          completed: latestJob.processedItems,
          failed: 0,
          pending: latestJob.totalItems - latestJob.processedItems,
        })
      }
      
      // Si está en progreso, activar estado de espera
      if (latestJob.status === 'processing') {
        setStatus(`⏳ Procesando... ${latestJob.progress || 0}%`)
      }
    }
  }, [latestJob, hasActiveJobs, jobId])

  useEffect(() => {
    // Inicializar stats cuando se monta el componente
    const total = filteredData?.length || 0
    setSendStats({
      total,
      completed: 0,
      failed: 0,
      pending: total,
    })
  }, [filteredData])

  // 🔌 Hook de progreso en tiempo real (conexión directa al worker)
  const {
    progress: wsProgress,
    isCompleted: wsCompleted,
    error: wsError,
  } = useProgressWebSocket({
    eventType: 'pdf', // Escuchar eventos PDF (no PYSE)
    userId: userId,   // Filtrar solo eventos de este usuario
  })

  // 🔌 Hook de progreso del job principal (backend)
  const { progress: jobProgress } = useJobProgress(jobId)

  // Efecto para actualizar UI con progreso del job principal
  useEffect(() => {
    if (jobProgress && jobProgress.jobId === jobId) {
      logger.log('📊 Job progress del backend (próximos):', jobProgress)
      
      if (jobProgress.status === 'completed') {
        logger.log('✅ Job completado según backend')
        setStatus('✅ Proceso completado')
        // Esperar un momento y avanzar al paso de descarga
        setTimeout(() => {
          setActiveStep(2)
          setLoading(false)
        }, 1500)
      } else if (jobProgress.status === 'error') {
        setStatus(`❌ Error: ${jobProgress.message || 'Error desconocido'}`)
        setLoading(false)
      } else if (jobProgress.status === 'processing') {
        setStatus(`⏳ Procesando... ${jobProgress.progress}%`)
      }
    }
  }, [jobProgress, jobId, setActiveStep])

  // Calcular progreso general y stats actuales
  const overallProgress = wsProgress?.percentage || 0
  const currentStats = wsProgress ? {
    total: wsProgress.total,
    completed: wsProgress.processed,
    failed: 0,
    pending: wsProgress.total - wsProgress.processed,
  } : sendStats

  // Efecto para actualizar stats con datos del WebSocket
  useEffect(() => {
    if (wsProgress) {
      logger.log(`📊 Progreso PDF (próximos a vencer): ${wsProgress.processed}/${wsProgress.total} (${wsProgress.percentage}%)`)
      setSendStats({
        total: wsProgress.total,
        completed: wsProgress.processed,
        failed: 0,
        pending: wsProgress.total - wsProgress.processed,
      })
      
      // NO recalcular aquí - el tiempo estimado es fijo basado en exitosos totales
    }
  }, [wsProgress, waitingForResults])

  // Efecto para iniciar polling cuando PDF se completa
  useEffect(() => {
    if (wsCompleted && loading && !waitingForResults) {
      logger.log('✅ PDFs generados (próximos a vencer). Esperando que termine el envío de WhatsApp...')
      setWaitingForResults(true)
      setStatus('⏳ Enviando notificaciones por WhatsApp...')
    }
  }, [wsCompleted, loading, waitingForResults])

  // Polling para esperar archivo de resultados
  useEffect(() => {
    if (!waitingForResults) return

    const pollForResults = async () => {
      try {
        const files = await listResultBackups()
        // Buscar archivo reciente (últimos 10 minutos)
        const now = Date.now()
        const recentFile = files.find(name => {
          // Buscar archivos de proximos-vencer con timestamp reciente
          const isProximosVencer = name.includes('proximos-vencer') || name.includes('recordatorios')
          if (!isProximosVencer) return false
          
          const match = name.match(/_resultado_(\d+)\.xlsx$/) || name.match(/-(\d+)\.xlsx$/)
          if (match) {
            const timestamp = parseInt(match[1])
            return (now - timestamp) < 600000 // 10 minutos
          }
          return false
        })

        if (recentFile) {
          logger.log('✅ Archivo de resultados encontrado:', recentFile)
          const blob = await getFileByName(recentFile)
          setProcessedFile(blob)
          setLoading(false)
          setWaitingForResults(false)
          setStatus('✅ Proceso completado. Pasando a descarga...')
          
          // 🔔 Enviar notificación del navegador
          notifyProcessComplete({
            processName: 'Próximos a Vencer',
            totalSent: currentStats.total,
            successful: currentStats.completed,
            failed: currentStats.failed,
            onClick: () => window.focus(),
          })
          
          setTimeout(() => {
            setActiveStep(2)
          }, 1000)
        } else if (pollingAttempts >= 20) {
          // Después de 20 intentos, avanzar de todas formas
          logger.warn('⚠️ Timeout esperando archivo de resultados')
          setLoading(false)
          setWaitingForResults(false)
          setStatus('⚠️ Notificaciones enviadas. Descargá el archivo desde respaldos.')
          
          // 🔔 Notificación aunque haya timeout
          notifyProcessComplete({
            processName: 'Próximos a Vencer',
            totalSent: currentStats.total,
            successful: currentStats.completed,
            failed: currentStats.failed,
            onClick: () => window.focus(),
          })
          
          setTimeout(() => {
            setActiveStep(2)
          }, 1000)
        } else {
          setPollingAttempts(prev => prev + 1)
        }
      } catch (error: any) {
        console.error('Error en polling:', error)
        // Si es error 429 (rate limit), esperar más tiempo
        if (error?.response?.status === 429) {
          logger.warn('⚠️ Rate limit alcanzado, aumentando intervalo de polling')
        }
        setPollingAttempts(prev => prev + 1)
      }
    }

    // Backoff progresivo: primeros 5 intentos cada 20s, después cada 30s
    const interval = pollingAttempts < 5 ? 20000 : 30000
    const timer = setInterval(pollForResults, interval)
    return () => clearInterval(timer)
  }, [waitingForResults, pollingAttempts, setProcessedFile, setActiveStep])

  // Efecto para manejar errores
  useEffect(() => {
    if (wsError && loading) {
      logger.warn('⚠️ WebSocket desconectado durante envío de próximos a vencer:', wsError)
      // No detener el proceso, los comprobantes se siguen enviando
      setStatus('⏳ Procesando mensajes en segundo plano... (sin actualización en vivo)')
      // El proceso continuará y se completará cuando el backend termine
    }
  }, [wsError, loading])

  // Abrir modal de confirmación
  const handleOpenConfirmation = () => {
    if (!fileNameFiltered) {
      setStatus("No hay archivo filtrado para enviar.")
      return
    }
    
    // ✅ FIX Sprint 3: Validación adicional para diasAnticipacion
    if (diasAnticipacion <= 0) {
      setStatus("Error: No se pueden procesar próximos a vencer porque no hay días válidos restantes en el mes. Por favor, intenta mañana.")
      return
    }
    
    setShowConfirmModal(true)
  }

  // Ejecutar envío real (llamado desde el modal)
  const handleConfirmedSend = async () => {
    setShowConfirmModal(false)

    setLoading(true)
    setStatus(null)

    try {
      const result = await sendAndScrapeProximosVencer(fileNameFiltered, message, diasAnticipacion)
      
      // 🚨 Si el archivo temporal ya no existe, resetear y volver al paso 0
      if (result.fileNotFound) {
        logger.warn('⚠️ Archivo temporal expirado, reseteando estado...')
        setStatus(result.message)
        setLoading(false)
        // Esperar un momento para que el usuario vea el mensaje
        setTimeout(() => {
          resetProximosVencer()
        }, 3000)
        return
      }
      
      // 🎯 Backend siempre devuelve jobId para tracking en tiempo real
      if (result.jobId) {
        logger.log('📊 JobId recibido (próximos a vencer):', result.jobId)
        setJobId(result.jobId)
      } else {
        logger.warn('⚠️ Backend no retornó jobId, no habrá progreso en tiempo real')
      }
      
      setStatus(result.message || '✅ Notificaciones enviadas correctamente')
      if (result.file) {
        setProcessedFile(result.file) 
        setBackupFiles([])
      }
      
      // Si hay jobId, mantener loading=true y esperar WebSocket
      if (result.jobId) {
        logger.log('🔌 Job iniciado, esperando progreso via WebSocket...')
        setStatus('⏳ Generando PDFs y verificando cuotas...')
        setPollingAttempts(0)
        // NO hacer setLoading(false) aquí, lo hace cuando llega el archivo
      } else {
        // Sin WebSocket, avanzar manualmente
        logger.log('🚀 Avanzando al paso 2 (sin WebSocket)')
        setTimeout(() => {
          setActiveStep(2)
        }, 1500)
        setLoading(false)
      }
    } catch (error) {
      console.error('❌ Error en envío de próximos a vencer:', error)
      setStatus("Error al enviar las notificaciones de próximos a vencer. Intenta de nuevo.")
      setLoading(false) // Solo aquí si hay error
      try {
        // Intentar listar respaldos disponibles
        const files = await listResultBackups()
        setBackupFiles(files)
      } catch {}
    }
  }

  const handleCancel = () => {
    setRawData([])
    setProcessedData([])
    setFilteredData([])
    setFileNameFiltered("")
    setProcessedFile(null)
    setNotWhatsappData("")
    setActiveStep(0) // Volver al inicio
  }
  
  const handleBack = () => {
    setActiveStep(0) // Volver a cargar archivo
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Progress Card durante el envío */}
      {loading && (
        <div className="mb-4">
          <ProgressCard
            title={waitingForResults ? "Enviando notificaciones por WhatsApp" : "Generando y enviando PDFs"}
            description={waitingForResults 
              ? "Esto puede tardar unos minutos" 
              : `Procesando ${currentStats.total} clientes`}
            progress={overallProgress}
            stats={currentStats}
            status="processing"
            lastProcessed={wsProgress?.processed.toString()}
            showDetails={true}
          />
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold">Enviar notificaciones de próximos a vencer</h3>
          <p className="text-sm text-muted-foreground">
            Rango: <strong>{fechaDesdeTexto}</strong> hasta <strong>{fechaHastaTexto}</strong> ({diasAnticipacion} días restantes del mes).
          </p>
        </div>
        
        {status && (
          <div className={`text-sm p-3 rounded ${status.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {status}
            {backupFiles.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Se encontraron archivos de respaldo:</p>
                <ul className="list-disc list-inside text-xs">
                  {backupFiles.map((name) => (
                    <li key={name}>
                      <button
                        className="underline"
                        onClick={async () => {
                          try {
                            const blob = await getFileByName(name)
                            const url = window.URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = name
                            document.body.appendChild(a)
                            a.click()
                            a.remove()
                            window.URL.revokeObjectURL(url)
                          } catch (e) {}
                        }}
                      >
                        {name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Mensaje - Comportamiento diferente según modo */}
        {isSystemMode ? (
          // 🔒 Modo SYSTEM: Plantilla fija de Meta (no editable)
          <div className="space-y-3">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 text-lg">🔒</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-emerald-900 mb-1">
                    Plantilla de Meta (WhatsApp Cloud API)
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Se usará la plantilla pre-aprobada por Meta. El texto no es editable para cumplir con las políticas de WhatsApp Business.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  📋 Vista previa del mensaje
                </label>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">
                  🔒 Plantilla Meta
                </span>
              </div>
              <div className="w-full p-3 border-2 border-emerald-200 rounded-lg bg-emerald-50/50 text-gray-700 text-sm whitespace-pre-wrap">
                {SYSTEM_TEMPLATE_PREVIEW_PROXIMOS.replace('{{1}}', '{{nombre del cliente}}')}
              </div>
              <p className="text-xs text-emerald-600 mt-2">
                ✅ El nombre del cliente se insertará automáticamente desde el Excel
              </p>
            </div>
          </div>
        ) : (
          // ✏️ Modo PERSONAL: Mensaje editable
          <div className="space-y-1.5">
            <label htmlFor="message" className="block text-sm font-medium">
              Mensaje (editable - usa ${'{clientName}'} para personalizar)
            </label>
            <textarea
              id="message"
              rows={4}
              className="w-full p-2 border rounded resize-none text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="border-t pt-4 mt-6">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={loading}
          >
            ← Volver
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className='bg-red-50 hover:bg-red-100'
            >
              Cancelar todo
            </Button>
            <Button
              onClick={handleOpenConfirmation}
              disabled={loading}
              className=""
            >
              {loading ? 'Enviando...' : 'Enviar notificaciones →'}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      <SendConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmedSend}
        isLoading={loading}
        totalClients={sendStats.total}
        messagePreview={SYSTEM_TEMPLATE_PREVIEW_PROXIMOS}
        quotaRemaining={300}
        dailyQuota={300}
        includesAttachment={true}
        processType="proximos-vencer"
      />
    </motion.div>
  )
}
