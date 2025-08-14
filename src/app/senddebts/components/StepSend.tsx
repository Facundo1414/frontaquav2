'use client'
import { useSendDebtsContext } from '@/app/providers/context/SendDebtsContext'
import { sendAndScrape } from '@/lib/api'
import { useState } from 'react'
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

  const [message, setMessage] = useState(
    "Hola, te enviamos un recordatorio de tu deuda pendiente. ¡Gracias!"
  )
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const handleSend = async () => {
    if (!fileNameFiltered) {
      setStatus("No hay archivo filtrado para enviar.")
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const result = await sendAndScrape(fileNameFiltered, message)
      setStatus(result.message)
      if (result.file) {
        setProcessedFile(result.file) 
      }
    } catch (error) {
      setStatus("Error al enviar las deudas. Intenta de nuevo.")
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
          disabled={loading}
          className='bg-red-100'
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSend}
          disabled={loading}
          className=""
        >
          {loading ? 'Enviando...' : 'Enviar deudas'}
        </Button>
      </div>
    </motion.div>
  )
}
