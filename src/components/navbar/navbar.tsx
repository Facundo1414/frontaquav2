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
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { toast } from 'sonner'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { logoutWhatsappSession, userLogout } from '@/lib/api'
import { log } from 'console'

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

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('username')

    setAccessToken('')
    setRefreshToken('')
    setUsernameGlobal('')



    router.push('/login')
  }

  const handleLogoutWhatsApp = async () => {
  setIsLoggingOutWhatsApp(true)

  try {
    await logoutWhatsappSession()
    toast.success('Sesión de WhatsApp cerrada')
  } catch (error) {
    toast.error('Error al cerrar sesión de WhatsApp')    
  } finally {
    setIsLoggingOutWhatsApp(false)
  }
}


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
          <Avatar className="cursor-pointer">
            <AvatarFallback>
              {usernameGlobal?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Hola, {usernameGlobal || 'Usuario'}</SheetTitle>
          </SheetHeader>

          <div className="py-6 space-y-4 px-4">
          <p className="text-muted-foreground text-sm">
            Desde aquí podés desvincular tu cuenta de whatsapp o cerrar sesión de la pagina.
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogoutWhatsApp}
            disabled={isLoggingOutWhatsApp}
          >
            {isLoggingOutWhatsApp ? 'Cerrando sesión de WhatsApp...' : 'Desloguearse de WhatsApp'}
          </Button>
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
    </nav>
  )
}

