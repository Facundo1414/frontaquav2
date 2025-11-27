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

const MAX_MESSAGE_LENGTH = 500

// Variables disponibles para el mensaje
const AVAILABLE_VARIABLES = [
  { variable: '${clientName}', description: 'Nombre del cliente' },
  { variable: '${uf}', description: 'Unidad de Facturación' },
  { variable: '${deuda}', description: 'Monto total de la deuda' },
  { variable: '${telefono}', description: 'Teléfono de contacto' },
]

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
  } = useSendDebtsContext()
  const { userId } = useGlobalContext()

  const [message, setMessage] = useState(`Hola \${clientName}, te envio tu comprobante actualizado de la CUOTA PLAN DE PAGOS.

📄 El PDF incluye un instructivo con todas las opciones de pago disponibles.

🤖 Este número es automático. Para consultas personalizadas, TOCÁ EL BOTÓN VERDE de WhatsApp dentro del PDF instructivo para hablar con tu asesor.

Por favor, realiza el pago antes del vencimiento.

🌐 Cclip 🔹 Al servicio de Aguas Cordobesas.`);

  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [backupFiles, setBackupFiles] = useState<string[]>([])
  const [incluirIntimacion, setIncluirIntimacion] = useState(false)
  const [telefonoUsuario, setTelefonoUsuario] = useState<string | null>(null)
  const [waitingForResults, setWaitingForResults] = useState(false)
  const [pollingAttempts, setPollingAttempts] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState<string>('')
  const [sendStats, setSendStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
  })

  // 🚀 Hook para verificación y feedback de envío
  const sendControl = useSendWithWhatsAppCheck()

  // Auto-fetch phone number on mount
  useEffect(() => {
    const fetchPhone = async () => {
      try {
        const phone = await getUserPhone()
        if (phone) {
          setTelefonoUsuario(phone)
        }
      } catch (error) {
        console.warn('No se pudo obtener el teléfono del usuario:', error)
        // No es crítico, el usuario puede continuar sin teléfono en el instructivo
      }
    }
    fetchPhone()
  }, [])

  useEffect(() => {
    // Inicializar stats cuando se monta el componente
    console.log('🔍 StepSend montado - filteredData:', filteredData)
    console.log('🔍 StepSend montado - filteredData.length:', filteredData?.length)
    console.log('🔍 StepSend montado - fileNameFiltered:', fileNameFiltered)
    
    const total = filteredData?.length || 0
    console.log('📊 Total calculado para stats:', total)
    
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
      console.log(`📊 Progreso PDF: ${wsProgress.processed}/${wsProgress.total} (${wsProgress.percentage}%)`)
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
    if (wsCompleted && loading) {
      console.log('✅ WebSocket completed. Verificando si tenemos el archivo...')
      
      // Si ya tenemos el archivo (se recibió junto con el jobId), avanzar directamente
      if (processedFile) {
        console.log('✅ Archivo ya disponible. Avanzando al paso 2 (Download)...')
        setLoading(false)
        setWaitingForResults(false)
        setStatus('✅ Proceso completado. Descargando resultados...')
        setTimeout(() => {
          setActiveStep(2)
        }, 1000)
      } else {
        // Si no tenemos el archivo, iniciar polling
        console.log('⏳ Archivo no disponible. Iniciando polling...')
        setWaitingForResults(true)
        setStatus('⏳ Esperando archivo de resultados...')
      }
    }
  }, [wsCompleted, loading, processedFile, setActiveStep, setProcessedFile])

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
          console.log('✅ Archivo de resultados encontrado:', recentFile)
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
          console.warn('⚠️ Timeout esperando archivo de resultados')
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
          console.warn('⚠️ Rate limit alcanzado, aumentando intervalo de polling')
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
      console.warn('⚠️ WebSocket desconectado durante envío:', wsError)
      // No detener el proceso, los comprobantes se siguen enviando
      setStatus('⏳ Procesando mensajes en segundo plano... (sin actualización en vivo)')
      // El proceso continuará y se completará cuando el backend termine
    }
  }, [wsError, loading])

  const handleSend = async () => {
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
          incluirIntimacion,
          telefonoUsuario || undefined
        )
        
        console.log('📦 Result completo:', result)
        console.log('📦 Result.file existe:', !!result.file)
        console.log('📦 Result.file type:', result.file?.constructor?.name)
        console.log('📦 Result.file size:', result.file?.size)
        
        // 🎯 Backend siempre devuelve jobId para tracking en tiempo real
        if (result.jobId) {
          console.log('📊 JobId recibido:', result.jobId)
          setJobId(result.jobId)
        } else {
          console.warn('⚠️ Backend no retornó jobId, no habrá progreso en tiempo real')
        }
        
        setStatus(result.message || '✅ Mensajes enviados correctamente')
        if (result.file) {
          console.log('✅ Guardando archivo en processedFile')
          setProcessedFile(result.file) 
          setBackupFiles([])
        } else {
          console.warn('⚠️ No se recibió archivo en result.file')
        }
        
        // 💰 Actualizar sobrecargo de cuota si viene en response
        if (result.overQuotaCount !== undefined) {
          setOverQuotaCount(result.overQuotaCount)
        }
        
        // Si hay jobId Y archivo, esperar WebSocket pero ya tenemos el archivo
        if (result.jobId) {
          console.log('🔌 Job iniciado, esperando progreso via WebSocket...')
          setStatus('⏳ Generando PDFs y verificando deudas...')
          setPollingAttempts(0)
          
          // Si YA tenemos el archivo, no hacer polling, solo esperar WebSocket completion
          if (result.file) {
            console.log('✅ Archivo ya recibido, solo esperando completion WebSocket')
          }
          // NO hacer setLoading(false) aquí, lo hace cuando llega el evento ws-completed
        } else {
          // Sin WebSocket, avanzar manualmente
          console.log('🚀 Avanzando al paso 2 - Download (sin WebSocket)')
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
          {/* Checkbox para incluir INTIMACIÓN */}
          <div className="p-3 border rounded-lg bg-gray-50">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={incluirIntimacion}
                onChange={(e) => setIncluirIntimacion(e.target.checked)}
                disabled={loading}
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
                {telefonoUsuario && incluirIntimacion && (
                  <p className="text-xs text-gray-500 mt-1">
                    📞 Teléfono detectado: {telefonoUsuario}
                  </p>
                )}
              </div>
            </label>
          </div>

          {/* Variables disponibles */}
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
              onClick={handleSend}
              disabled={loading}
              label="Enviar mensajes →"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
