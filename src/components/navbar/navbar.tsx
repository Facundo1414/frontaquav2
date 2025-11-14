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
// Replaced legacy polling hook with context snapshot
import { useWhatsappSessionContext } from '@/app/providers/context/whatsapp/WhatsappSessionContext'
import { Badge } from '@/components/ui/badge'
import { MessageCircle } from 'lucide-react'
import api from '@/lib/api/axiosInstance'

export default function Navbar() {
  const router = useRouter()
  const {
    setAccessToken,
    setRefreshToken,
    usernameGlobal,
    setUsernameGlobal,
  } = useGlobalContext()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { snapshot } = useWhatsappSessionContext()
  // Adapted to v2 snapshot: state: 'none' | 'launching' | 'waiting_qr' | 'syncing' | 'ready' | 'closing'
  const whatsappState = snapshot?.state || 'none'
  const isReady = !!snapshot?.ready
  const prevWhatsappState = useRef<string | null>(null)
  
  // WhatsApp Business API usage tracking
  const [whatsappUsage, setWhatsappUsage] = useState<{
    free_tier_used: number;
    total_conversations: number;
  } | null>(null)
  // Purge removido

  useEffect(() => {
    // Track transitions for potential future side-effects (placeholder)
    prevWhatsappState.current = whatsappState
  }, [whatsappState])

  // Load WhatsApp usage on mount
  useEffect(() => {
    const loadWhatsappUsage = async () => {
      try {
        const response = await api.get('/whatsapp/usage')
        setWhatsappUsage({
          free_tier_used: response.data.free_tier_used,
          total_conversations: response.data.total_conversations,
        })
      } catch (error) {
        // Silently fail if not configured
        setWhatsappUsage(null)
      }
    }
    loadWhatsappUsage()
  }, [])

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

      {/* Derecha: Badge WhatsApp + Avatar */}
      <div className="flex items-center gap-3">
        {/* WhatsApp Usage Badge */}
        {whatsappUsage && (
          <Link href="/admin/whatsapp/usage">
            <Badge
              variant="outline"
              className={`cursor-pointer transition-colors ${
                whatsappUsage.free_tier_used < 800
                  ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                  : whatsappUsage.free_tier_used < 950
                  ? 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200'
                  : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
              }`}
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              {1000 - whatsappUsage.free_tier_used} gratis restantes
            </Badge>
          </Link>
        )}

        <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <div className="relative">
            <Avatar className="cursor-pointer ring-2 ring-white hover:ring-blue-300 transition-all">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
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
              Gestión de tu cuenta y configuración.
            </p>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Estado WhatsApp:</span>
                <span
                  className={
                    'px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-semibold ' +
                    (isReady
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : whatsappState === 'waiting_qr' || whatsappState === 'launching' || whatsappState === 'syncing'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400')
                  }
                >
                  {isReady ? '● Conectado' : whatsappState}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                La sesión se gestiona automáticamente
              </p>
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
      </div>
    </nav>
  )
}

