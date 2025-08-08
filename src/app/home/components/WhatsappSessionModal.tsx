'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { initializeWhatsAppSession, fetchQrCode, getIsLoggedIn } from '@/lib/api'
import QRCode from 'qrcode'
import { toast } from 'sonner'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

interface WhatsappSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const WhatsappSessionModal: React.FC<WhatsappSessionModalProps> = ({ open, onOpenChange }) => {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSessionReady, setIsSessionReady] = useState(false)

  useEffect(() => {
    const checkAndInitialize = async () => {
      setIsLoading(true)
      try {
        const isActive = await getIsLoggedIn()
        if (isActive) {
          setIsSessionReady(true)
          toast.success('Sesión activa en WhatsApp')
        } else {
          await initializeWhatsAppSession()
          const qrString = await fetchQrCode()
          const qrImage = await QRCode.toDataURL(qrString)
          setQrCode(qrImage)
        }
      } catch (err) {
        toast.error('Error al iniciar sesión en WhatsApp')
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      checkAndInitialize()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-center">Inicio de sesión en WhatsApp</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando sesión de WhatsApp...
            </div>
          </div>
        ) : isSessionReady ? (
          <div className="text-center py-6 text-green-600 font-semibold">
            Sesión ya activa. ¡Listo para enviar mensajes!
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 py-4">
            {/* QR Code */}
            <div className="flex-1 flex justify-center items-center">
              {qrCode && (
                <Image
                  src={qrCode}
                  alt="QR Code"
                  width={220}
                  height={220}
                  className="border rounded"
                />
              )}
            </div>

            {/* Instructions */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">Para vincular tu cuenta:</h3>
              <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                <li>Abrí WhatsApp en tu teléfono.</li>
                <li>Andá a <strong>Menú</strong> (Android) o <strong>Configuración</strong> (iPhone).</li>
                <li>Tocá <strong>Dispositivos vinculados</strong>.</li>
                <li>Presioná en <strong>Vincular un dispositivo</strong>.</li>
                <li>Escaneá este código QR con tu celular.</li>
              </ol>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
