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
import { useRouter, usePathname } from 'next/navigation'
import { Home, ChevronRight, CreditCard, HelpCircle, Headphones } from 'lucide-react'
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

// Mapeo de rutas a nombres legibles para breadcrumbs
const routeNames: Record<string, string> = {
  'home': 'Inicio',
  'senddebts': 'Enviar Comprobantes',
  'proximos-vencer': 'Próximos a Vencer',
  'conversaciones': 'Conversaciones',
  'clientes-database': 'Base de Clientes',
  'filtrar-clientes': 'Filtrar PYSE',
  'verificar-planes-pago': 'Verificar Planes',
  'recuperar-archivos': 'Recuperar Archivos',
  'preguntas-frecuentes': 'FAQ',
  'admin': 'Administración',
  'generar-documentos-whatsapp': 'Generar Documentos',
  'whatsapp': 'WhatsApp',
  'profile': 'Perfil',
  'politica-privacidad': 'Política de Privacidad',
  'terminos-condiciones': 'Términos y Condiciones',
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
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


  // Generar breadcrumbs basados en la ruta actual
  const getBreadcrumbs = () => {
    if (pathname === '/home' || pathname === '/') return []
    
    const segments = pathname.split('/').filter(Boolean)
    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      const isLast = index === segments.length - 1
      return {
        label: routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        href: isLast ? undefined : href,
        isLast
      }
    })
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <nav className="bg-white/95 backdrop-blur-md text-foreground px-6 h-14 flex items-center justify-between shadow-sm border-b border-border/50 sticky top-0 z-50">
      {/* Izquierda: Logo + Breadcrumbs */}
      <div className="flex items-center gap-4">
        <div onClick={() => router.push('/home')} className="flex items-center space-x-2 cursor-pointer group">
          <img src="/logoWater.png" alt="Logo" className="h-8 transition-transform group-hover:scale-105" />
          <span className="font-bold text-base bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">AQUA</span>
        </div>
        
        {/* Breadcrumbs dinámicos */}
        {breadcrumbs.length > 0 && (
          <div className="hidden sm:flex items-center gap-1 text-sm">
            <ChevronRight className="w-4 h-4 text-slate-300" />
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-1">
                {crumb.href ? (
                  <button
                    onClick={() => router.push(crumb.href!)}
                    className="text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-slate-700 font-medium">{crumb.label}</span>
                )}
                {!crumb.isLast && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Derecha: Aviso de horario + Token Status + Avatar */}
      <div className="flex items-center gap-2">
        {/* Token Status */}
        {tokenTimeLeft && (
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/50">
            <div 
              className={`w-2 h-2 rounded-full ${
                tokenNeedsRefresh ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span className="font-medium">
              {formatTokenTime(tokenTimeLeft)}
            </span>
          </div>
        )}

        {/* Aviso de horario */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/50">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span>
            Lun-Vie 8:00-16:00
          </span>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <div className="relative">
              <Avatar className="cursor-pointer ring-2 ring-slate-200 hover:ring-cyan-400 transition-all duration-200">
                <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-500 text-white font-semibold text-base">
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

            <div className="py-6 space-y-3 px-4">
              <p className="text-muted-foreground text-sm mb-4">
                Gestión de tu cuenta y configuración.
              </p>
              
              {/* Accesos rápidos */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-11 hover:bg-cyan-50 hover:border-cyan-300 transition-colors"
                  onClick={() => {
                    setOpen(false)
                    router.push('/mi-plan')
                  }}
                >
                  <CreditCard className="h-4 w-4 text-cyan-600" />
                  <span>Mi Plan</span>
                  {isPro && (
                    <span className="ml-auto text-xs bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-2 py-0.5 rounded-full">
                      PRO
                    </span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-11 hover:bg-green-50 hover:border-green-300 transition-colors"
                  onClick={() => {
                    window.open('https://wa.me/3513479404?text=Hola%2C%20me%20contacto%20con%20soporte%20de%20AQUA%20para%20resolver%20un%20problema.', '_blank')
                  }}
                >
                  <Headphones className="h-4 w-4 text-green-600" />
                  <span>Soporte / Contacto</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-11 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                  onClick={() => {
                    setOpen(false)
                    router.push('/preguntas-frecuentes')
                  }}
                >
                  <HelpCircle className="h-4 w-4 text-purple-600" />
                  <span>Preguntas frecuentes</span>
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
      </div>
    </nav>
  )
}

