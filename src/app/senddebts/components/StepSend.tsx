'use client'
import { useSendDebtsContext } from '@/app/providers/context/SendDebtsContext'
import { sendAndScrape, listResultBackups, getFileByName } from '@/lib/api'
import { useState } from 'react'
import { useWhatsappSessionContext } from '@/app/providers/context/whatsapp/WhatsappSessionContext'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function StepSend() {
  const {
    setProcessedFile,
    fileNameFiltered,
    setActiveStep,
    setRawData,
    setProcessedData,
    setFilteredData,
    setFileNameFiltered,
    setNotWhatsappData
  } = useSendDebtsContext()
  const { snapshot } = useWhatsappSessionContext()
  // Nuevo modelo: snapshot?.ready indica disponibilidad total. Consideramos "syncing" si no está ready aún.
  const syncing = !snapshot?.ready

  const [message, setMessage] = useState(`Hola \${clientName}, te envío el PDF actualizado de la CUOTA PLAN DE PAGOS. 
Por favor, no dejes que venza. Puedes realizar el abono en cualquier Rapipago, Pago Fácil o a través de Mercado Pago.

🌐 Cclip 🔹 Al servicio de Aguas Cordobesas.`);

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
      // Siempre enviar TODOS (plan + consumo) - el sistema maneja automáticamente cada tipo de plan
      const result = await sendAndScrape(fileNameFiltered, message, 'TODOS')
      setStatus(result.message)
      if (result.file) {
        setProcessedFile(result.file) 
        setBackupFiles([])
      }
    } catch (error) {
      setStatus("Error al enviar las deudas. Intenta de nuevo.")
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
            Enviando deudas, por favor espere...
          </p>
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-auto">
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
          {loading ? 'Enviando...' : 'Enviar deudas'}
        </Button>
      </div>
      {syncing && (
        <p className="text-xs mt-2 text-amber-600">Sincronizando WhatsApp. El envío se habilitará automáticamente al finalizar.</p>
      )}
    </motion.div>
  )
}
