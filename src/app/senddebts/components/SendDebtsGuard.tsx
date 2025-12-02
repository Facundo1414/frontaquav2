'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useWhatsappNavigation } from '@/hooks/useWhatsappNavigation'

interface SendDebtsGuardProps {
  children: React.ReactNode
}

/**
 * Guard component para validar sesión WhatsApp antes de acceder a SendDebts
 * Evita que usuarios modo personal sin sesión accedan directamente vía URL
 */
export function SendDebtsGuard({ children }: SendDebtsGuardProps) {
  const router = useRouter()
  const { userMode, isReady } = useWhatsappNavigation()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Validar solo si usa modo personal
    if (userMode === 'personal') {
      if (!isReady) {
        toast.error('❌ Necesitás conectar tu WhatsApp personal primero', {
          duration: 4000,
        })
        router.push('/home')
        return
      }
    }

    // Usuario modo sistema o personal con sesión activa: permitir acceso
    setChecking(false)
  }, [userMode, isReady, router])

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Verificando sesión...</p>
      </div>
    )
  }

  return <>{children}</>
}
