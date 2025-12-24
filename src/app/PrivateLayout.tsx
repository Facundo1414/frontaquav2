'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getAccessToken } from '@/utils/authToken'
import LayoutWrapper from './LayoutWrapper'
import { WhatsappSessionProvider } from '@/app/providers/context/whatsapp/WhatsappSessionContext'

const PUBLIC_PATHS = ['/login', '/register']

// Loading skeleton profesional
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
          <div className="w-16 h-5 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 h-7 bg-slate-100 rounded-full animate-pulse" />
          <div className="w-9 h-9 bg-slate-200 rounded-full animate-pulse" />
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-slate-100 rounded-xl animate-pulse" />
          <div>
            <div className="w-48 h-6 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="w-64 h-4 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="h-40 bg-slate-100 rounded-xl animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

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
    return <LoadingSkeleton />
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
      </LayoutWrapper>
    </WhatsappSessionProvider>
  )
}
