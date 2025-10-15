'use client'

import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { toast } from 'sonner'
import { tokenManager } from '@/lib/tokenManager'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { userLogout } from '@/lib/api'
import { simpleWaLogout } from '@/lib/api/simpleWaApi'
import { QrCode } from 'lucide-react'
import { WhatsappSessionModal } from '@/app/home/components/WhatsappSessionModal'
import { getAccessToken } from '@/utils/authToken'
// Replaced legacy polling hook with context snapshot
import { useWhatsappSessionContext } from '@/app/providers/context/whatsapp/WhatsappSessionContext'

export default function Navbar() {
  const router = useRouter()
  const {
    setAccessToken,
    setRefreshToken,
    usernameGlobal,
    setUsernameGlobal,
  } = useGlobalContext()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoggingOutWhatsApp, setIsLoggingOutWhatsApp] = useState(false)
  // Admin actions removidas: reinit/purge
  const [openWhatsappModal, setOpenWhatsappModal] = useState(false)
  const [ephemeralModalToken, setEphemeralModalToken] = useState<string>('')
  const { snapshot } = useWhatsappSessionContext()
  // Adapted to v2 snapshot: state: 'none' | 'launching' | 'waiting_qr' | 'syncing' | 'ready' | 'closing'
  const whatsappState = snapshot?.state || 'none'
  const isReady = !!snapshot?.ready
  const prevWhatsappState = useRef<string | null>(null)
  // Purge removido

  useEffect(() => {
    // Track transitions for potential future side-effects (placeholder)
    prevWhatsappState.current = whatsappState
  }, [whatsappState])

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!usernameGlobal) {
      const stored = localStorage.getItem('username')
      if (stored) setUsernameGlobal(stored)
    }
  }, [usernameGlobal, setUsernameGlobal])

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await userLogout()
    } catch (err) {
      toast.error('Error al cerrar sesión')
    }

    // Usar el token manager para limpiar correctamente
    tokenManager.clearTokens()

    setAccessToken('')
    setRefreshToken('')
    setUsernameGlobal('')



    router.push('/login')
    toast.success('Sesión cerrada')
  }

  const handleLogoutWhatsApp = async () => {
    setIsLoggingOutWhatsApp(true)
    try {
      await simpleWaLogout()
      toast.success('Sesión de WhatsApp cerrada')
    } catch (error) {
      toast.error('Error al cerrar sesión de WhatsApp')
    } finally {
      setIsLoggingOutWhatsApp(false)
    }
  }

  const handleOpenWhatsappModal = async () => {
    // Reutilizamos simplemente el access token JWT para pedir token efímero dentro del modal
    const at = getAccessToken()
    if (!at) {
      toast.error('No hay token de sesión')
      return
    }
    setEphemeralModalToken(at)
    setOpenWhatsappModal(true)
    toast.info('Abriendo panel de WhatsApp...')
  }

  // Acciones administrativas (reinit/purge) eliminadas


  return (
    <nav className="bg-blue-900 text-white px-6 h-16 flex items-center justify-between shadow-sm">
      {/* Izquierda: Logo + Links */}
      <div className="flex items-center space-x-6">
        <Link href="/home" className="flex items-center space-x-2">
          <img src="/logoWater.png" alt="Logo" className="h-10" />
          <span className="font-bold text-lg">AQUA</span>
        </Link>
        <Link href="/home">
          <Button variant="ghost" className="text-white hover:bg-teal-600 px-2">
            <Home className="w-4 h-4 mr-1" />
            Inicio
          </Button>
        </Link>
      </div>

      {/* Derecha: Avatar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <div className="relative">
            <Avatar className="cursor-pointer">
              <AvatarFallback>
                {usernameGlobal?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span
              className={
                'absolute -right-1 -bottom-1 h-3 w-3 rounded-full ring-2 ring-white transition-colors ' +
                (isReady
                  ? 'bg-green-500'
                  : whatsappState === 'waiting_qr' || whatsappState === 'launching' || whatsappState === 'syncing'
                    ? 'bg-amber-400'
                    : 'bg-gray-400')
              }
              title={`Estado WhatsApp: ${isReady ? 'ready' : whatsappState}`}
            />
          </div>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Hola, {usernameGlobal || 'Usuario'}</SheetTitle>
            <div className="mt-2 text-xs font-medium flex items-center gap-2">
              <span className="text-muted-foreground">WhatsApp:</span>
              <span
                className={
                  'px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-semibold ' +
                  (isReady
                    ? 'bg-green-100 text-green-700'
                    : whatsappState === 'waiting_qr' || whatsappState === 'launching' || whatsappState === 'syncing'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-200 text-gray-600')
                }
              >
                {isReady ? 'ready' : whatsappState}
              </span>
            </div>
          </SheetHeader>

          <div className="py-6 space-y-4 px-4">
            <p className="text-muted-foreground text-sm">
              Gestioná tu sesión de WhatsApp o cerrá la sesión de la plataforma.
            </p>

            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={handleOpenWhatsappModal}
              >
                <QrCode className="w-4 h-4" /> Ver / Escanear QR
              </Button>

              {/* Botones de reinit/purge eliminados */}

              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleLogoutWhatsApp}
                disabled={isLoggingOutWhatsApp}
              >
                {isLoggingOutWhatsApp ? 'Cerrando sesión de WhatsApp...' : 'Desloguearse de WhatsApp'}
              </Button>
            </div>
          </div>


          <SheetFooter>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <WhatsappSessionModal
        open={openWhatsappModal}
        onOpenChange={setOpenWhatsappModal}
        token={ephemeralModalToken}
        autoCloseOnAuth={true}
      />
    </nav>
  )
}

