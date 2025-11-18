'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { ServiceStatus } from '../components/ServiceStatus'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Leer ADMIN_UID desde variables de entorno
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || ''

/**
 * Admin Services Management Page
 *
 * Panel de gestión avanzada de servicios:
 * - Monitoreo en tiempo real de 4 servicios (Backend, Baileys, Comprobante, Frontend)
 * - Logs en tiempo real con SSE (Server-Sent Events)
 * - Restart manual de servicios
 * - Health checks detallados (uptime, CPU, memory)
 * - Export de logs como .txt
 * - Filtrado de logs por nivel (info/warn/error/debug)
 *
 * ⚠️ SOLO ADMIN: Requiere UID 0a0c8e8a-65c4-4c0e-b08d-3c25b2286966
 */
export default function ServicesPage() {
  const router = useRouter()
  const { userId } = useGlobalContext()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si es admin
    if (!userId) {
      toast.error('Debe iniciar sesión')
      router.push('/login')
      return
    }

    if (userId !== ADMIN_UID) {
      toast.error('Acceso denegado: Solo administradores')
      router.push('/home')
      return
    }

    setLoading(false)
  }, [userId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/admin')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </Button>
      </div>
      <ServiceStatus />
    </div>
  )
}
