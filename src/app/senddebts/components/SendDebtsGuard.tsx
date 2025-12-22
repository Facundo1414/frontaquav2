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
 * Guard component para SendDebts (simplificado - ahora usa WhatsApp Cloud API)
 * No requiere validación de sesión WhatsApp
 */
export function SendDebtsGuard({ children }: SendDebtsGuardProps) {
  // Con WhatsApp Cloud API no se requiere validación de sesión
  return <>{children}</>
}
