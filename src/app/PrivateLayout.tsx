'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getAccessToken } from '@/utils/authToken'
import LayoutWrapper from './LayoutWrapper'
import { WhatsappSessionProvider } from '@/app/providers/context/whatsapp/WhatsappSessionContext'
import TokenStatus from '@/components/TokenStatus'

const PUBLIC_PATHS = ['/login', '/register']

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Si estamos en ruta pública, dejamos pasar sin validar y sin wrappers privados
    if (PUBLIC_PATHS.includes(pathname)) {
      setChecking(false)
      return
    }

    const token = getAccessToken()
    if (!token) {
      router.replace('/login')
      return
    }
    setChecking(false)
  }, [router, pathname])

  if (checking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Cargando...</p>
      </div>
    )
  }

  // En rutas públicas devolvemos directamente los children (login, register)
  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>
  }

  // En rutas privadas, aplicamos los wrappers necesarios
  return (
    <WhatsappSessionProvider>
      <LayoutWrapper>
        {children}
        <TokenStatus />
      </LayoutWrapper>
    </WhatsappSessionProvider>
  )
}
