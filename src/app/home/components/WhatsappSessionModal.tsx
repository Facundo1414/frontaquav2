'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Image from 'next/image'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { generateQRCode } from '@/lib/qrcode'
import { useWhatsappSessionContext } from '@/app/providers/context/whatsapp/WhatsappSessionContext'
import { simpleWaInit } from '@/lib/api/simpleWaApi'
import { useWhatsappStatus } from '@/hooks/useWhatsappStatus'
import { getAccessToken } from '@/utils/authToken'

interface WhatsappSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string
  autoCloseOnAuth?: boolean
}

// Helper para obtener userId del token
const getUserIdFromToken = (): string | null => {
  try {
    const t = getAccessToken()
    if (!t) return null
    const payload = JSON.parse(atob(t.split('.')[1]))
    return payload.userId || payload.sub || null
  } catch {
    return null
  }
}

export const WhatsappSessionModal: React.FC<WhatsappSessionModalProps> = ({ open, onOpenChange, token, autoCloseOnAuth = false }) => {
  // Obtener userId para suscripción directa
  const userId = getUserIdFromToken()
  
  // Suscribirse directamente en el modal
  const { status: wsStatus, isSubscribed, connected } = useWhatsappStatus(userId)
  
  // Context solo para actualizar estado global
  const { snapshot, updateFromStatus } = useWhatsappSessionContext()
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const initAttempted = useRef(false)
  
  // 🔧 FIX: Persistir QR localmente para evitar que desaparezca
  const lastValidQr = useRef<string | null>(null)

  // Derivar estado del snapshot
  const state = snapshot?.state || 'none'
  // 🔧 FIX: Usar QR persistente si existe y el estado sigue siendo waiting_qr
  const qr = snapshot?.qr || (state === 'waiting_qr' ? lastValidQr.current : null)
  const isAuthenticated = snapshot?.ready || false
  
  // WebSocket está listo cuando está conectado y suscrito
  const wsReady = connected && isSubscribed
  
  console.log('📱 WhatsappSessionModal state:', { 
    open, 
    state, 
    wsReady,
    isSubscribed,
    connected,
    hasUserId: !!userId,
    hasQr: !!qr,
    hasQrImage: !!qrImage,
    hasLastValidQr: !!lastValidQr.current,
    initAttempted: initAttempted.current 
  })

  // Función para iniciar sesión
  const handleStart = async () => {
    console.log('🚀 WhatsappSessionModal: Iniciando sesión...')
    setIsInitializing(true)
    setError(null)
    
    try {
      const result = await simpleWaInit()
      console.log('✅ WhatsappSessionModal: Init exitoso:', result)
      
      // El WebSocket se encargará de actualizar el estado
      // No necesitamos actualizar manualmente si está suscrito
      if (!isSubscribed) {
        // Fallback: actualizar manualmente si no hay WebSocket
        updateFromStatus({
          state: result.ready ? 'ready' 
                : result.authenticated ? 'syncing'
                : result.hasQR ? 'waiting_qr'
                : 'launching',
          qr: null,
        })
      }
    } catch (e: any) {
      console.error('❌ WhatsappSessionModal: Error en init:', e)
      setError(e.message || 'Error al iniciar sesión')
      toast.error('Error al iniciar sesión de WhatsApp')
    } finally {
      setIsInitializing(false)
    }
  }

  // Función para refrescar manualmente
  const manualRefresh = () => {
    handleStart()
  }

  // Limpiar sessionStorage cuando se abre el modal
  useEffect(() => {
    if (open) {
      try {
        sessionStorage.removeItem('whatsapp_v2_snapshot')
        console.log('🧹 WhatsappSessionModal: sessionStorage limpiado al abrir modal')
      } catch (e) {
        console.warn('⚠️ No se pudo limpiar sessionStorage:', e)
      }
    }
  }, [open])

  // Iniciar sesión cuando se abre el modal Y el WebSocket está listo
  useEffect(() => {
    console.log('📱 WhatsappSessionModal: useEffect', { 
      open, 
      wsReady,
      isSubscribed,
      connected,
      initAttempted: initAttempted.current 
    })
    
    if (open && wsReady && !initAttempted.current) {
      console.log('🚀 WhatsappSessionModal: Modal abierto y WebSocket listo, iniciando sesión...')
      initAttempted.current = true
      handleStart()
    }
    
    // Reset flag cuando se cierra el modal
    if (!open) {
      initAttempted.current = false
    }
  }, [open, wsReady, isSubscribed, connected])

  // Convertir QR a imagen (lazy load QRCode library)
  useEffect(() => {
    let active = true
    if (qr) {
      // 🔧 FIX: Persistir QR válido en ref
      lastValidQr.current = qr
      
      // ✅ Verificar si el QR ya viene en formato data URL (Baileys)
      if (qr.startsWith('data:image/')) {
        // QR ya está en formato base64, usar directamente
        setQrImage(qr)
      } else {
        // QR es string raw, necesita conversión (Puppeteer legacy)
        generateQRCode(qr)
          .then((img: string) => { 
            if (active) {
              setQrImage(img)
              console.log('✅ QR convertido y guardado')
            }
          })
          .catch(() => setQrImage(null))
      }
    } else if (state !== 'waiting_qr') {
      // 🔧 FIX: Solo limpiar QR si ya NO estamos en waiting_qr
      // Esto evita limpiar el QR mientras el usuario está escaneando
      setQrImage(null)
      lastValidQr.current = null
    }
    return () => { active = false }
  }, [qr, state])

  // Auto-cerrar modal si está autenticado (sin toast duplicado)
  // El toast lo maneja WhatsappSessionContext
  useEffect(() => {
    if (isAuthenticated && autoCloseOnAuth) {
      const t = setTimeout(() => onOpenChange(false), 800)
      return () => clearTimeout(t)
    }
  }, [isAuthenticated, autoCloseOnAuth, onOpenChange])

  // Failsafe: Poll state después de mostrar QR para detectar autenticación
  // incluso si el evento WebSocket se pierde
  useEffect(() => {
    if (!open || state !== 'waiting_qr') return
    
    // 🔧 FIX: Aumentar intervalo de polling de 2s a 5s
    // Esto reduce la probabilidad de interferencias con el QR
    const pollInterval = setInterval(async () => {
      try {
        const { simpleWaState } = await import('@/lib/api/simpleWaApi')
        const st = await simpleWaState()
        
        // Si detectamos que está autenticado, actualizar contexto
        if (st.ready || st.authenticated) {
          console.log('✅ WhatsappSessionModal: Detectado autenticado via polling, actualizando contexto')
          updateFromStatus({
            state: st.ready ? 'ready' : 'syncing',
            qr: null, // Limpiar QR solo cuando está autenticado
          })
        }
        // 🔧 FIX: NO actualizar si sigue teniendo QR disponible
        // Esto evita que el polling sobrescriba el QR válido
      } catch (e) {
        console.error('❌ Error en polling de estado:', e)
      }
    }, 5000) // Poll cada 5 segundos (antes era 2)
    
    return () => clearInterval(pollInterval)
  }, [open, state, updateFromStatus])

  const statusMessage = useMemo(() => {
    if (error) return error
    if (state === 'none') return 'Listo para iniciar'
    if (state === 'launching' || isInitializing) return 'Inicializando sesión...'
    if (state === 'waiting_qr') return 'Escaneá el código con WhatsApp'
    if (state === 'syncing') return 'Sincronizando mensajes...'
    if (state === 'ready') return 'Sesión lista'
    return ''
  }, [state, error, isInitializing])

  const showSpinner = state === 'launching' || isInitializing
  const showQr = state === 'waiting_qr' && qrImage

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
                    {snapshot?.updatedAt && (
                      <span className="text-[10px] text-muted-foreground">
                        Actualizado: {new Date(snapshot.updatedAt).toLocaleTimeString()}
                      </span>
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
