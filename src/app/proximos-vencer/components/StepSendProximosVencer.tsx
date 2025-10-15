'use client'
import { useProximosVencerContext } from '@/app/providers/context/ProximosVencerContext'
import { sendAndScrapeProximosVencer, listResultBackups, getFileByName } from '@/lib/api'
import { useState, useEffect } from 'react'
import { useWhatsappSessionContext } from '@/app/providers/context/whatsapp/WhatsappSessionContext'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

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
    setDiasAnticipacion
  } = useProximosVencerContext()
  const { snapshot } = useWhatsappSessionContext()
  // Nuevo modelo: snapshot?.ready indica disponibilidad total. Consideramos "syncing" si no está ready aún.
  const syncing = !snapshot?.ready

  const [message, setMessage] = useState('');

  // Actualizar el mensaje cuando cambien los días de anticipación
  useEffect(() => {
    setMessage(`Hola \${clientName}, tienes cuotas de tu plan de pagos que vencen en los próximos días. 

Te envío el PDF actualizado para que puedas realizar el pago antes del vencimiento.

Puedes realizar el abono en cualquier Rapipago, Pago Fácil o a través de Mercado Pago.

🌐 Cclip 🔹 Al servicio de Aguas Cordobesas.`);
  }, [diasAnticipacion]);

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [backupFiles, setBackupFiles] = useState<string[]>([])

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
      const result = await sendAndScrapeProximosVencer(fileNameFiltered, message, diasAnticipacion)
      setStatus(result.message)
      if (result.file) {
        setProcessedFile(result.file) 
        setBackupFiles([])
      }
    } catch (error) {
      setStatus("Error al enviar las notificaciones de próximos a vencer. Intenta de nuevo.")
      try {
        // Intentar listar respaldos disponibles
        const files = await listResultBackups()
        setBackupFiles(files)
      } catch {}
    } finally {
      setLoading(false)
      setActiveStep(2)
    }
  }

  const handleCancel = () => {
    setRawData([])
    setProcessedData([])
    setFilteredData([])
    setFileNameFiltered("")
    setProcessedFile(null)
    setNotWhatsappData("")
    setActiveStep(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex flex-col relative"
    >
      {/* Overlay de envío */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col justify-center items-center bg-black/30 backdrop-blur-sm">
          <Loader2 className="animate-spin h-12 w-12 text-white mb-4" />
          <p className="text-white font-semibold text-lg">
            Enviando notificaciones de próximos a vencer...
          </p>
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-auto">
        <div>
          <h3 className="text-lg font-semibold">Enviar notificaciones de próximos a vencer</h3>
          <p className="text-sm text-muted-foreground">
            Se enviarán notificaciones a los usuarios con planes de pago que vencen desde hoy hasta {diasAnticipacion} día{diasAnticipacion > 1 ? 's' : ''} de anticipación.
            Solo se notificará a usuarios con WhatsApp válido.
          </p>
        </div>

        {/* Configuración de días de anticipación */}
        <div className="space-y-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-4">
            <label htmlFor="diasAnticipacion" className="block text-sm font-medium text-orange-800">
              Días de anticipación:
            </label>
            <div className="flex items-center gap-2">
              <input
                id="diasAnticipacion"
                type="number"
                min="1"
                max="30"
                value={diasAnticipacion}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1
                  if (value >= 1 && value <= 30) {
                    setDiasAnticipacion(value)
                  }
                }}
                className="w-16 px-2 py-1 text-sm border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={loading}
              />
              <span className="text-sm text-orange-700">día{diasAnticipacion > 1 ? 's' : ''}</span>
            </div>
          </div>
          <p className="text-xs text-orange-600">
            Se buscarán planes de pago que vencen desde hoy hasta {diasAnticipacion} día{diasAnticipacion > 1 ? 's' : ''} de anticipación (rango: 0 a {diasAnticipacion} días).
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
            rows={6}
            className="w-full p-2 border rounded resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Usa ${'{clientName}'} para personalizar el nombre del cliente en cada mensaje.
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="mt-auto flex items-center gap-4 pt-4">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={loading || syncing}
          className='bg-red-100'
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSend}
          disabled={loading || syncing}
          className=""
        >
          {loading ? 'Enviando...' : 'Enviar notificaciones'}
        </Button>
      </div>
      {syncing && (
        <p className="text-xs mt-2 text-amber-600">Sincronizando WhatsApp. El envío se habilitará automáticamente al finalizar.</p>
      )}
    </motion.div>
  )
}
