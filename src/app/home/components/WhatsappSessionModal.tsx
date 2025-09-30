'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Image from 'next/image'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import QRCode from 'qrcode'
import { useSimpleWaSession } from '@/hooks/useSimpleWaSession'

interface WhatsappSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string // Supabase / JWT token used to request ephemeral SSE token
  autoCloseOnAuth?: boolean
}

export const WhatsappSessionModal: React.FC<WhatsappSessionModalProps> = ({ open, onOpenChange, token, autoCloseOnAuth = false }) => {
  const simple = useSimpleWaSession({ auto: false })
  const state = simple.status
  const qr = simple.qr
  const isAuthenticated = simple.ready
  const manualRefresh = () => simple.start(true)
  const error = simple.error
  const start = simple.start
  const lastUpdated = simple.lastUpdated
  const [qrImage, setQrImage] = useState<string | null>(null)

  // Start flow when modal opens
  useEffect(() => {
    if (open) {
      start()
    }
  }, [open, start])

  // Convert QR text to data URL image whenever it changes
  useEffect(() => {
    let active = true
    if (qr) {
      QRCode.toDataURL(qr)
        .then(img => { if (active) setQrImage(img) })
        .catch(() => setQrImage(null))
    } else {
      setQrImage(null)
    }
    return () => { active = false }
  }, [qr])

  // Toast & auto close if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Sesión autenticada en WhatsApp')
      if (autoCloseOnAuth) {
        const t = setTimeout(() => onOpenChange(false), 800)
        return () => clearTimeout(t)
      }
    }
  }, [isAuthenticated, autoCloseOnAuth, onOpenChange])

  const statusMessage = useMemo(() => {
    if (error) return error
    if (state === 'idle') return 'Listo para iniciar'
    if (state === 'initializing') return 'Inicializando sesión...'
    if (state === 'qr') return 'Escaneá el código con WhatsApp'
    if (state === 'ready') return 'Sesión lista'
    return ''
  }, [state, error])

  const showSpinner = state === 'initializing'
  const showQr = state === 'qr' && qrImage

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-center">Inicio de sesión en WhatsApp</DialogTitle>
        </DialogHeader>

        {isAuthenticated ? (
          <div className="text-center py-8">
            <p className="text-green-600 font-semibold text-lg">¡Listo para enviar mensajes!</p>
            <p className="text-sm text-muted-foreground mt-2">Tu dispositivo quedó vinculado correctamente.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 py-4">
            {/* Left: QR / Status */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {showSpinner && (
                <div className="flex items-center gap-2 text-muted-foreground py-10">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {statusMessage}
                </div>
              )}

              {showQr && (
                <>
                  <Image
                    src={qrImage!}
                    alt="QR Code"
                    width={260}
                    height={260}
                    className="border rounded shadow-sm bg-white p-2"
                  />
                  <p className="mt-3 text-sm text-muted-foreground">{statusMessage}</p>
                  <div className="mt-4 flex flex-col items-center gap-2 text-xs text-muted-foreground">
                    <button
                      onClick={manualRefresh}
                      className="mt-1 inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] hover:bg-muted transition"
                      disabled={showSpinner}
                    >
                      <RefreshCw className="h-3 w-3" /> Refrescar
                    </button>
                    {lastUpdated && (
                      <span className="text-[10px] text-muted-foreground">Actualizado: {new Date(lastUpdated).toLocaleTimeString()}</span>
                    )}
                  </div>
                </>
              )}

              {!showSpinner && !showQr && !isAuthenticated && (
                <div className="text-sm text-muted-foreground py-6">
                  {statusMessage}
                </div>
              )}
            </div>

            {/* Right: Instructions */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">Para vincular tu cuenta:</h3>
              <ol className="list-decimal pl-5 space-y-2 text-muted-foreground text-sm">
                <li>Abrí WhatsApp en tu teléfono.</li>
                <li>Andá a <strong>Menú</strong> (Android) o <strong>Configuración</strong> (iPhone).</li>
                <li>Tocá <strong>Dispositivos vinculados</strong>.</li>
                <li>Presioná en <strong>Vincular un dispositivo</strong>.</li>
                <li>Escaneá este código QR con tu celular.</li>
              </ol>
              <div className="mt-6 text-xs text-muted-foreground space-y-1">
                <p>Si el QR expira, presioná &quot;Refrescar&quot; para intentar de nuevo.</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
