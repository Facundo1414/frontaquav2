'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getAccessToken } from '@/utils/authToken'
import { useAuthGuard } from '@/utils/useAuthGuard'

const PUBLIC_PATHS = ['/login', '/register']

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  useAuthGuard()


  useEffect(() => {
    // Si estamos en ruta pública, dejamos pasar sin validar
    if (PUBLIC_PATHS.includes(pathname)) {
      setChecking(false)
      return
    }

    const token = getAccessToken()

    if (!token) {
      router.replace('/login')
    } else {
      setChecking(false)
    }
  }, [router, pathname])

  if (checking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Cargando...</p>
      </div>
    )
  }

  return <>{children}</>
}
