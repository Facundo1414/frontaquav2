'use client'
import { useSendDebtsContext } from '@/app/providers/context/SendDebtsContext'
import { sendAndScrape, listResultBackups, getFileByName, getUserPhone } from '@/lib/api'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Loader2, Info } from 'lucide-react'
import { ProgressCard } from './ProgressCard'
import { useProgressWebSocket } from '@/hooks/useProgressWebSocket'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { useSendWithWhatsAppCheck } from '@/hooks/useSendWithWhatsAppCheck'
import { SendButton } from '@/components/whatsapp/SendButton'
import { SendConfirmationModal } from '@/components/whatsapp/SendConfirmationModal'
import { useBrowserNotification } from '@/hooks/useBrowserNotification'
import { useJobRecovery } from '@/hooks/useJobRecovery'
import { useJobProgress } from '@/hooks/useJobProgress'
import { logger } from '@/lib/logger';

const MAX_MESSAGE_LENGTH = 500

// Variables disponibles para el mensaje (solo para modo personal)
const AVAILABLE_VARIABLES = [
  { variable: '${clientName}', description: 'Nombre del cliente' },
  { variable: '${uf}', description: 'Unidad de Facturación' },
  { variable: '${deuda}', description: 'Monto total de la deuda' },
  { variable: '${telefono}', description: 'Teléfono de contacto' },
]

// 📋 Plantilla de Meta para modo SYSTEM (Cloud API)
// Esta plantilla está pre-aprobada por Meta y NO puede ser editada
const SYSTEM_TEMPLATE_TEXT = `Hola {{1}}, te informamos que tu cuota del plan de pagos tiene fecha de vencimiento.

📄 Adjuntamos tu comprobante actualizado con el detalle completo e información de medios de pago disponibles.

Para consultas sobre tu cuenta, puedes responder este mensaje.
Cclip • Al servicio de Aguas Cordobesas.

━━━━━━━━━━━━━━━━━━━━
💬 Tengo consultas`

// Preview de cómo se ve el mensaje con la plantilla
const SYSTEM_TEMPLATE_PREVIEW = (clientName: string = 'Juan Pérez') => 
  SYSTEM_TEMPLATE_TEXT.replace('{{1}}', clientName)

export function StepSend() {
  const {
    processedFile,
    setProcessedFile,
    fileNameFiltered,
    setActiveStep,
    setRawData,
    setProcessedData,
    setFilteredData,
    setFileNameFiltered,
    setNotWhatsappData,
    filteredData,
    setOverQuotaCount,
    resetSendDebts,
  } = useSendDebtsContext()
  const { userId } = useGlobalContext()

  // 🔍 Detectar modo de WhatsApp (system = Cloud API, personal = cuenta propia)
  const [isSystemMode, setIsSystemMode] = useState(true) // Default a system (más seguro)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mode = localStorage.getItem('whatsapp_mode') || 'system'
      setIsSystemMode(mode === 'system')
    }
  }, [])

  // El mensaje solo es editable en modo personal
  const [message, setMessage] = useState(`Hola \${clientName}, te informamos que tu cuota del plan de pagos tiene fecha de vencimiento.

📄 Adjuntamos tu comprobante actualizado con el detalle completo e información de medios de pago disponibles.

💬 Para consultas sobre tu cuenta, puedes responder este mensaje.

🌐 Cclip • Al servicio de Aguas Cordobesas.`);

  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [backupFiles, setBackupFiles] = useState<string[]>([])
  const [incluirIntimacion, setIncluirIntimacion] = useState(false)
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

  // 🚀 Hook para verificación y feedback de envío
  const sendControl = useSendWithWhatsAppCheck()

  // 🔔 Hook para notificaciones del navegador
  const { notifyProcessComplete, requestPermission } = useBrowserNotification()

  // 🔄 Hook para detectar jobs activos al montar (recuperación)
  const { latestJob, hasActiveJobs } = useJobRecovery({ jobType: 'senddebts' })

  // Solicitar permiso de notificaciones al montar
  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  // 🔄 Efecto para recuperar estado de job activo
  useEffect(() => {
    if (latestJob && hasActiveJobs && !jobId) {
      logger.log('🔄 Recuperando job activo:', latestJob.jobId, 'status:', latestJob.status)
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

  // ❌ ELIMINADO: Auto-fetch phone number (generaba error 404 y no se usaba)
  // El teléfono del usuario ya se obtiene del perfil en el backend

  useEffect(() => {
    // Inicializar stats cuando se monta el componente
    logger.log('🔍 StepSend montado - filteredData:', filteredData)
    logger.log('🔍 StepSend montado - filteredData.length:', filteredData?.length)
    logger.log('🔍 StepSend montado - fileNameFiltered:', fileNameFiltered)
    
    const total = filteredData?.length || 0
    logger.log('📊 Total calculado para stats:', total)
    
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
      logger.log('📊 Job progress del backend:', jobProgress)
      
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
    completed: wsProgress.successful || 0,
    failed: wsProgress.failed || 0,
    pending: wsProgress.total - wsProgress.processed,
  } : sendStats

  // Efecto para actualizar stats con datos del WebSocket
  useEffect(() => {
    if (wsProgress) {
      logger.log(`📊 Progreso PDF: ${wsProgress.processed}/${wsProgress.total} (${wsProgress.percentage}%) - Exitosos: ${wsProgress.successful || 0}, Sin deuda: ${wsProgress.failed || 0}`)
      setSendStats({
        total: wsProgress.total,
        completed: wsProgress.successful || 0,
        failed: wsProgress.failed || 0,
        pending: wsProgress.total - wsProgress.processed,
      })
      
      // NO recalcular aquí - el tiempo estimado es fijo basado en exitosos totales
    }
  }, [wsProgress, waitingForResults])

  // Efecto para iniciar polling cuando PDF se completa
  useEffect(() => {
    if (wsCompleted && loading) {
      logger.log('✅ WebSocket completed. Verificando si tenemos el archivo...')
      
      // 🔔 Enviar notificación del navegador cuando se completa
      notifyProcessComplete({
        processName: 'Envío de deudas',
        totalSent: currentStats.total,
        successful: currentStats.completed,
        failed: currentStats.failed,
        onClick: () => window.focus(),
      })
      
      // Si ya tenemos el archivo (se recibió junto con el jobId), avanzar directamente
      if (processedFile) {
        logger.log('✅ Archivo ya disponible. Avanzando al paso 2 (Download)...')
        setLoading(false)
        setWaitingForResults(false)
        setStatus('✅ Proceso completado. Descargando resultados...')
        setTimeout(() => {
          setActiveStep(2)
        }, 1000)
      } else {
        // Si no tenemos el archivo, iniciar polling
        logger.log('⏳ Archivo no disponible. Iniciando polling...')
        setWaitingForResults(true)
        setStatus('⏳ Esperando archivo de resultados...')
      }
    }
  }, [wsCompleted, loading, processedFile, setActiveStep, setProcessedFile, notifyProcessComplete, currentStats])

  // Polling para esperar archivo de resultados
  useEffect(() => {
    if (!waitingForResults) return

    const pollForResults = async () => {
      try {
        const files = await listResultBackups()
        // Buscar archivo reciente (últimos 10 minutos)
        const now = Date.now()
        const recentFile = files.find(name => {
          // Formato: clients-with-whatsapp-1234567890123_resultado_1234567890123.xlsx
          const match = name.match(/_resultado_(\d+)\.xlsx$/)
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
          setTimeout(() => {
            setActiveStep(2)
          }, 1000)
        } else if (pollingAttempts >= 20) {
          // Después de 20 intentos, avanzar de todas formas
          logger.warn('⚠️ Timeout esperando archivo de resultados')
          setLoading(false)
          setWaitingForResults(false)
          setStatus('⚠️ Mensajes enviados. Descargá el archivo desde respaldos.')
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
      logger.warn('⚠️ WebSocket desconectado durante envío:', wsError)
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
    setShowConfirmModal(true)
  }

  // Ejecutar envío real (llamado desde el modal)
  const handleConfirmedSend = async () => {
    setShowConfirmModal(false)
    
    if (!fileNameFiltered) {
      setStatus("No hay archivo filtrado para enviar.")
      return
    }

    // Ejecutar con verificación de WhatsApp
    await sendControl.execute({
      onSend: async () => {
        setLoading(true)
        setStatus(null)

        // Sistema maneja automáticamente detección de tipo de plan (PCB1/ATC2)
        const result = await sendAndScrape(
          fileNameFiltered, 
          message, 
          incluirIntimacion
        )
        
        logger.log('📦 Result completo:', result)
        logger.log('📦 Result.file existe:', !!result.file)
        logger.log('📦 Result.file type:', result.file?.constructor?.name)
        logger.log('📦 Result.file size:', result.file?.size)
        
        // 🚨 Si el archivo temporal ya no existe, resetear y volver al paso 0
        if (result.fileNotFound) {
          logger.warn('⚠️ Archivo temporal expirado, reseteando estado...')
          setStatus(result.message)
          setLoading(false)
          // Esperar un momento para que el usuario vea el mensaje
          setTimeout(() => {
            resetSendDebts()
          }, 3000)
          return
        }
        
        // 🎯 Backend siempre devuelve jobId para tracking en tiempo real
        if (result.jobId) {
          logger.log('📊 JobId recibido:', result.jobId)
          setJobId(result.jobId)
        } else {
          logger.warn('⚠️ Backend no retornó jobId, no habrá progreso en tiempo real')
        }
        
        setStatus(result.message || '✅ Mensajes enviados correctamente')
        if (result.file) {
          logger.log('✅ Guardando archivo en processedFile')
          setProcessedFile(result.file) 
          setBackupFiles([])
        } else {
          logger.warn('⚠️ No se recibió archivo en result.file')
        }
        
        // 💰 Actualizar sobrecargo de cuota si viene en response
        if (result.overQuotaCount !== undefined) {
          setOverQuotaCount(result.overQuotaCount)
        }
        
        // Si hay jobId Y archivo, esperar WebSocket pero ya tenemos el archivo
        if (result.jobId) {
          logger.log('🔌 Job iniciado, esperando progreso via WebSocket...')
          setStatus('⏳ Generando PDFs y verificando deudas...')
          setPollingAttempts(0)
          
          // Si YA tenemos el archivo, no hacer polling, solo esperar WebSocket completion
          if (result.file) {
            logger.log('✅ Archivo ya recibido, solo esperando completion WebSocket')
          }
          // NO hacer setLoading(false) aquí, lo hace cuando llega el evento ws-completed
        } else {
          // Sin WebSocket, avanzar manualmente
          logger.log('🚀 Avanzando al paso 2 - Download (sin WebSocket)')
          setTimeout(() => {
            setActiveStep(2) // Ir a descargar (paso 2)
          }, 1500)
          setLoading(false)
        }
      }
    }).catch((error) => {
      console.error('❌ Error en envío:', error)
      setStatus("Error al enviar las deudas. Intenta de nuevo.")
      setLoading(false)
      listResultBackups().then(files => setBackupFiles(files)).catch(() => {})
    })
  }

  const handleCancel = () => {
    setRawData([])
    setProcessedData([])
    setFilteredData([])
    setFileNameFiltered("")
    setProcessedFile(null)
    setNotWhatsappData("")
    setActiveStep(1) // Volver a verificar
  }
  
  const handleBack = () => {
    setActiveStep(1) // Volver a verificar
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
            title={waitingForResults ? "Enviando mensajes por WhatsApp" : "Generando y enviando PDFs"}
            description={waitingForResults 
              ? "Esto puede tardar unos minutos" 
              : `Procesando ${currentStats.total} clientes`}
            progress={overallProgress}
            stats={currentStats}
            status="processing"
            lastProcessed={wsProgress?.processed.toString()}
            showDetails={true}
          />
          {wsError && (
            <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">ℹ️ Modo sin actualizaciones en vivo</span>
                <br />
                El sistema está procesando los comprobantes correctamente. 
                Los resultados estarán disponibles al finalizar.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Enviar deudas filtradas</h3>
          <p className="text-sm text-muted-foreground">
            En este paso se enviará el archivo Excel filtrado a tus clientes que tienen WhatsApp.
            Además, podrás seguir el proceso de envío directamente desde la app de WhatsApp en tu teléfono celular.
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

        <div className="space-y-4">
          {/* Checkbox para incluir INTIMACIÓN - Ocultar durante envío */}
          {!loading && (
            <div className="p-3 border rounded-lg bg-gray-50">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirIntimacion}
                  onChange={(e) => setIncluirIntimacion(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">Incluir INTIMACIÓN</span>
                  {incluirIntimacion && (
                    <p className="text-xs text-amber-600 mt-1 flex items-start gap-1">
                      <span>⚠️</span>
                      <span>
                        Requiere que todos los clientes estén cargados en la base de datos con dirección y barrio completos.
                        Solo se incluirá la intimación para clientes con planes vencidos.
                      </span>
                    </p>
                  )}
                </div>
              </label>
            </div>
          )}

          {/* Variables disponibles - Solo mostrar en modo personal */}
          {!isSystemMode && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-blue-900 mb-2">
                    Variables disponibles para personalizar el mensaje:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {AVAILABLE_VARIABLES.map(({ variable, description }) => (
                      <div key={variable} className="flex items-start gap-2">
                        <code className="bg-blue-100 px-2 py-1 rounded text-xs font-mono text-blue-800 whitespace-nowrap">
                          {variable}
                        </code>
                        <span className="text-xs text-blue-700">{description}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Las variables se reemplazarán automáticamente con los datos de cada cliente
                  </p>
                </div>
              </div>
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
                <div className="relative">
                  <div className="w-full p-3 border-2 border-emerald-200 rounded-lg bg-emerald-50/50 text-gray-700 text-sm whitespace-pre-wrap">
                    {SYSTEM_TEMPLATE_PREVIEW('{{nombre del cliente}}')}
                  </div>
                </div>
                <p className="text-xs text-emerald-600 mt-2">
                  ✅ El nombre del cliente se insertará automáticamente desde el Excel
                </p>
              </div>
            </div>
          ) : (
            // ✏️ Modo PERSONAL: Mensaje editable
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="message" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  ✏️ Mensaje para enviar (editable)
                </label>
                <span className={`text-xs font-medium ${
                  message.length > MAX_MESSAGE_LENGTH 
                    ? 'text-red-600' 
                    : message.length > MAX_MESSAGE_LENGTH * 0.9
                    ? 'text-amber-600'
                    : 'text-gray-500'
                }`}>
                  {message.length} / {MAX_MESSAGE_LENGTH} caracteres
                </span>
              </div>
              <div className="relative">
                <textarea
                  id="message"
                  rows={6}
                  className={`w-full p-3 border-2 rounded-lg resize-none transition-all ${
                    message.length > MAX_MESSAGE_LENGTH 
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-blue-50/30'
                  }`}
                  placeholder="Escribe tu mensaje personalizado aquí..."
                  value={message}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                      setMessage(e.target.value)
                    }
                  }}
                  disabled={loading}
                  maxLength={MAX_MESSAGE_LENGTH}
                />
                {!loading && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                      ✏️ Editable
                    </span>
                  </div>
                )}
              </div>
              {message.length > MAX_MESSAGE_LENGTH * 0.9 && (
                <p className={`text-xs mt-1 ${
                  message.length > MAX_MESSAGE_LENGTH 
                    ? 'text-red-600' 
                    : 'text-amber-600'
                }`}>
                  {message.length > MAX_MESSAGE_LENGTH 
                    ? '❌ Has alcanzado el límite máximo de caracteres'
                    : '⚠️ Te estás acercando al límite de caracteres'
                  }
                </p>
              )}
            </div>
          )}
        </div>
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
              disabled={loading || sendControl.isChecking || sendControl.isSending}
              className='bg-red-50 hover:bg-red-100'
            >
              Cancelar todo
            </Button>
            <SendButton
              state={sendControl.state}
              onClick={handleOpenConfirmation}
              disabled={loading}
              label="Enviar mensajes →"
            />
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
        messagePreview={SYSTEM_TEMPLATE_TEXT}
        quotaRemaining={300} // TODO: obtener del backend
        dailyQuota={300}
        includesAttachment={true}
        processType="senddebts"
      />
    </motion.div>
  )
}
