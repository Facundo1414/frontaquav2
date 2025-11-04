'use client'
import { useSendDebtsContext } from '@/app/providers/context/SendDebtsContext'
import { sendAndScrape, listResultBackups, getFileByName } from '@/lib/api'
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
  const { user } = useGlobalContext()
  const userId = user?.sub
  
  // Nuevo modelo: snapshot?.ready indica disponibilidad total. Consideramos "syncing" si no está ready aún.
  const syncing = !snapshot?.ready

  const [message, setMessage] = useState(`Hola \${clientName}, te envío el PDF actualizado de la CUOTA PLAN DE PAGOS. 
Por favor, no dejes que venza. Puedes realizar el abono en cualquier Rapipago, Pago Fácil o a través de Mercado Pago.

🌐 Cclip 🔹 Al servicio de Aguas Cordobesas.`);

  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [backupFiles, setBackupFiles] = useState<string[]>([])
  const [sendStats, setSendStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
  })

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
      console.error('❌ Error en envío:', wsError)
      setLoading(false)
      setStatus(`Error: ${wsError}`)
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
      const result = await sendAndScrape(fileNameFiltered, message, 'TODOS')
      
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

        <div className="space-y-2">
          <label htmlFor="message" className="block text-sm font-medium">
            Mensaje para enviar (editable)
          </label>
          <textarea
            id="message"
            rows={4}
            className="w-full p-2 border rounded resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
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
          <p className="text-xs mt-2 text-amber-600">Sincronizando WhatsApp. El envío se habilitará automáticamente al finalizar.</p>
        )}
      </div>
    </motion.div>
  )
}
