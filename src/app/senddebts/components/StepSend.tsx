'use client'
import { useSendDebtsContext } from '@/app/providers/context/SendDebtsContext'
import { sendAndScrape } from '@/lib/api'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function StepSend() {
  const { setProcessedFile , fileNameFiltered, setActiveStep } = useSendDebtsContext()
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex flex-col"
    >
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

      {/* Botón abajo, ancho completo, alineado a la izquierda */}
      <div className="pt-4">
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
