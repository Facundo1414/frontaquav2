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
import { Home } from 'lucide-react'
import { toast } from 'sonner'
import { tokenManager } from '@/lib/tokenManager'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { userLogout } from '@/lib/api'
// Replaced legacy polling hook with context snapshot
import { useWhatsappSessionContext } from '@/app/providers/context/whatsapp/WhatsappSessionContext'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Clock } from 'lucide-react'
import api from '@/lib/api/axiosInstance'
import PlanBadge from '@/components/subscription/PlanBadge'
import { useSubscription } from '@/context/SubscriptionContext'

export default function Navbar() {
  const router = useRouter()
  const {
    setAccessToken,
    setRefreshToken,
    usernameGlobal,
    setUsernameGlobal,
    userId,
  } = useGlobalContext()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { snapshot } = useWhatsappSessionContext()
  const { isPro } = useSubscription()
  // Adapted to v2 snapshot: state: 'none' | 'launching' | 'waiting_qr' | 'syncing' | 'ready' | 'closing'
  const whatsappState = snapshot?.state || 'none'
  const isReady = !!snapshot?.ready
  const prevWhatsappState = useRef<string | null>(null)

  // Admin check
  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || ''
  const isAdmin = userId === ADMIN_UID

  // WhatsApp Business API usage tracking
  const [whatsappUsage, setWhatsappUsage] = useState<{
    free_tier_used: number;
    total_conversations: number;
  } | null>(null)
  // Purge removido

  // Token status
  const [tokenTimeLeft, setTokenTimeLeft] = useState<number | null>(null)
  const [tokenNeedsRefresh, setTokenNeedsRefresh] = useState(false)

  useEffect(() => {
    // Track transitions for potential future side-effects (placeholder)
    prevWhatsappState.current = whatsappState
  }, [whatsappState])

  // Load WhatsApp usage on mount
  useEffect(() => {
    const loadWhatsappUsage = async () => {
      // TODO: Endpoint /whatsapp/usage no existe aún
      // Por ahora solo configurar null para evitar 404
      setWhatsappUsage(null)
      
      // Descomentar cuando el endpoint esté implementado:
      // try {
      //   const response = await api.get('/whatsapp/usage')
      //   setWhatsappUsage({
      //     free_tier_used: response.data.free_tier_used,
      //     total_conversations: response.data.total_conversations,
      //   })
      // } catch (error) {
      //   setWhatsappUsage(null)
      // }
    }
    loadWhatsappUsage()
  }, [])

  // Update token status
  useEffect(() => {
    const updateTokenStatus = () => {
      const time = tokenManager.getTimeUntilExpiry()
      const needs = tokenManager.needsRefreshSoon()
      setTokenTimeLeft(time)
      setTokenNeedsRefresh(needs)
    }

    updateTokenStatus()
    const interval = setInterval(updateTokenStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatTokenTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

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
        <div onClick={() => router.push('/home')} className="flex items-center space-x-2 cursor-pointer">
          <img src="/logoWater.png" alt="Logo" className="h-10" />
          <span className="font-bold text-lg">AQUA</span>
        </div>
        <Button 
          variant="ghost" 
          className="text-white hover:bg-teal-600 px-2"
          onClick={() => router.push('/home')}
        >
          <Home className="w-4 h-4 mr-1" />
          Inicio
        </Button>
      </div>

      {/* Derecha: Aviso de horario + Token Status + Avatar */}
      <div className="flex items-center gap-3">
        {/* Token Status */}
        {tokenTimeLeft && (
          <div className="flex items-center gap-2 text-xs text-white/90 bg-blue-800/50 px-3 py-1.5 rounded-md">
            <div 
              className={`w-2 h-2 rounded-full ${
                tokenNeedsRefresh ? 'bg-yellow-400' : 'bg-green-400'
              }`}
            />
            <span>
              Token: {formatTokenTime(tokenTimeLeft)}
            </span>
          </div>
        )}

        {/* Aviso de horario */}
        <div className="flex items-center gap-2 text-xs text-white/90 bg-blue-800/50 px-3 py-1.5 rounded-md">
          <Clock className="h-3.5 w-3.5" />
          <span>
            📅 <strong>Horario:</strong> Lun-Vie 8:00-16:00 hs
          </span>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <div className="relative">
              <Avatar className="cursor-pointer ring-2 ring-white hover:ring-blue-300 transition-all">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                  {usernameGlobal?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {/* Indicador de estado WhatsApp - Solo para admin */}
              {isAdmin && (
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
              )}
            </div>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                Hola, {usernameGlobal || 'Usuario'}
              </SheetTitle>
              {/* Plan Badge */}
              {!isAdmin && (
                <div className="flex justify-start mt-2">
                  <PlanBadge size="sm" />
                </div>
              )}
            </SheetHeader>

            <div className="py-6 space-y-4 px-4">
              <p className="text-muted-foreground text-sm">
                Gestión de tu cuenta y configuración.
              </p>
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

