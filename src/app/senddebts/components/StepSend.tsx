'use client'
import { useSendDebtsContext } from '@/app/providers/context/SendDebtsContext'
import { sendAndScrape, listResultBackups, getFileByName, getUserPhone } from '@/lib/api'
import { useState, useEffect } from 'react'
import { useWhatsappSessionContext } from '@/app/providers/context/whatsapp/WhatsappSessionContext'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { ProgressCard } from './ProgressCard'
import { useProgressWebSocket } from '@/hooks/useProgressWebSocket'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'

export function StepSend() {
  const {
    setProcessedFile,
    fileNameFiltered,
    setActiveStep,
    setRawData,
    setProcessedData,
    setFilteredData,
    setFileNameFiltered,
    setNotWhatsappData,
    filteredData,
  } = useSendDebtsContext()
  const { snapshot } = useWhatsappSessionContext()
  const { userId } = useGlobalContext()
  
  // Nuevo modelo: snapshot?.ready indica disponibilidad total. Consideramos "syncing" si no está ready aún.
  const syncing = !snapshot?.ready

  const [message, setMessage] = useState(`Hola \${clientName}, te envio tu comprobante actualizado de la CUOTA PLAN DE PAGOS.

El PDF incluye un instructivo con todas las opciones de pago disponibles.

Por favor, realiza el pago antes del vencimiento.

🌐 Cclip 🔹 Al servicio de Aguas Cordobesas.`);

  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [backupFiles, setBackupFiles] = useState<string[]>([])
  const [incluirIntimacion, setIncluirIntimacion] = useState(false)
  const [telefonoUsuario, setTelefonoUsuario] = useState<string | null>(null)
  const [sendStats, setSendStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
  })

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
    }
  }, [wsProgress])

  // Efecto para avanzar cuando se completa
  useEffect(() => {
    if (wsCompleted && loading) {
      console.log('✅ Envío completado via WebSocket')
      setLoading(false)
      setStatus('✅ Mensajes enviados correctamente. Pasando a descarga...')
      setTimeout(() => {
        setActiveStep(2)
      }, 1500)
    }
  }, [wsCompleted, loading, setActiveStep])

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
    if (syncing) {
      setStatus('Esperá a que termine la sincronización de WhatsApp antes de enviar.');
      return;
    }
    if (!fileNameFiltered) {
      setStatus("No hay archivo filtrado para enviar.")
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      // Siempre enviar TODOS (plan + consumo) - el sistema maneja automáticamente cada tipo de plan
      const result = await sendAndScrape(
        fileNameFiltered, 
        message, 
        'TODOS',
        incluirIntimacion,
        telefonoUsuario || undefined
      )
      
      // 🎯 Backend siempre devuelve jobId para tracking en tiempo real
      if (result.jobId) {
        console.log('📊 JobId recibido:', result.jobId)
        setJobId(result.jobId)
      } else {
        console.warn('⚠️ Backend no retornó jobId, no habrá progreso en tiempo real')
      }
      
      setStatus(result.message || '✅ Mensajes enviados correctamente')
      if (result.file) {
        setProcessedFile(result.file) 
        setBackupFiles([])
      }
      
      // Si hay jobId, mantener loading=true y esperar WebSocket
      if (result.jobId) {
        console.log('🔌 Job iniciado, esperando progreso via WebSocket...')
        setStatus('⏳ Procesando mensajes...')
        // NO hacer setLoading(false) aquí, lo hace onCompleted/onError
      } else {
        // Sin WebSocket, avanzar manualmente
        console.log('🚀 Avanzando al paso 2 (sin WebSocket)')
        setTimeout(() => {
          setActiveStep(2) // Ir a descargar (ahora es paso 2)
        }, 1500)
        setLoading(false)
      }
    } catch (error) {
      console.error('❌ Error en envío:', error)
      setStatus("Error al enviar las deudas. Intenta de nuevo.")
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
            title="Generando y enviando PDFs"
            description={`Procesando ${currentStats.total} clientes`}
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

          <div>
            <label htmlFor="message" className="block text-sm font-medium">
              Mensaje para enviar (editable)
            </label>
            <textarea
              id="message"
              rows={4}
              className="w-full p-2 border rounded resize-none mt-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="border-t pt-4 mt-6">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={loading || syncing}
          >
            ← Volver
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading || syncing}
              className='bg-red-50 hover:bg-red-100'
            >
              Cancelar todo
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading || syncing}
              className=""
            >
              {loading ? 'Enviando...' : 'Enviar mensajes →'}
            </Button>
          </div>
        </div>
        
        {syncing && (
          <p className="text-xs mt-2 text-amber-600 flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Conectando con WhatsApp... El envío se habilitará automáticamente.</span>
          </p>
        )}
      </div>
    </motion.div>
  )
}
