'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import api from '@/lib/api/axiosInstance'
import { toast } from 'sonner'
import {
  AlertCircle,
  ArrowLeft,
  Users,
  MessageCircle,
  DollarSign,
  Loader2,
  Shield,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || ''

interface UserUsage {
  user_id: string
  email: string
  total_conversations: number
  free_tier_used: number
  paid_conversations: number
  total_cost: number
  current_month: string
}

interface ModeInfo {
  mode: string
  description: string
  is_admin: boolean
}

export default function AdminWhatsappUsagePage() {
  const router = useRouter()
  const { userId } = useGlobalContext()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [allUsersUsage, setAllUsersUsage] = useState<UserUsage[]>([])
  const [modeInfo, setModeInfo] = useState<ModeInfo | null>(null)

  // Verificar autenticación y que sea admin
  useEffect(() => {
    console.log('🔐 Admin WhatsApp Usage - Auth Check:', {
      userId,
      ADMIN_UID,
      isAdmin: userId === ADMIN_UID,
    })

    if (!userId) {
      toast.error('Debe iniciar sesión para acceder')
      router.push('/login')
      return
    }

    if (userId !== ADMIN_UID) {
      toast.error('Acceso denegado: Solo administradores')
      router.push('/home')
      return
    }

    setIsCheckingAuth(false)
  }, [userId, router])

  useEffect(() => {
    if (!isCheckingAuth) {
      loadData()
    }
  }, [isCheckingAuth])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [modeRes, usageRes] = await Promise.all([
        api.get<ModeInfo>('/whatsapp/mode'),
        api.get<UserUsage[]>('/whatsapp/admin/all-users-usage'),
      ])

      setModeInfo(modeRes.data)
      setAllUsersUsage(usageRes.data)
    } catch (error: any) {
      console.error('Error loading admin usage data', error)
      toast.error('Error al cargar datos de uso')
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando datos de uso...</p>
        </div>
      </div>
    )
  }

  // Calcular totales
  const totalConversations = allUsersUsage.reduce((sum, u) => sum + u.total_conversations, 0)
  const totalCost = allUsersUsage.reduce((sum, u) => sum + u.total_cost, 0)
  const totalUsers = allUsersUsage.length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="container max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Panel
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">Uso de WhatsApp - Todos los Usuarios</h1>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    <Shield className="w-3 h-3" />
                    Admin
                  </div>
                </div>
                <p className="text-sm text-gray-600">Panel de administración</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container max-w-6xl mx-auto px-6 py-8">
        {/* Banner Admin */}
        {modeInfo?.is_admin && (
          <Alert className="mb-6 border-yellow-300 bg-yellow-50">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Cuenta Admin:</strong> Tu cuenta usa Baileys Worker (sin tracking ni costos).
              Esta página muestra el uso de todos los usuarios que usan WhatsApp Cloud API.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Usuarios Activos</h3>
            <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
            <p className="text-xs text-gray-500 mt-2">Con WhatsApp Cloud API</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Conversaciones Totales</h3>
            <p className="text-3xl font-bold text-gray-900">{totalConversations}</p>
            <p className="text-xs text-gray-500 mt-2">Este mes</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Costo Total</h3>
            <p className="text-3xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">USD este mes</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Detalle por Usuario</h2>
          </div>
          
          {allUsersUsage.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No hay usuarios con WhatsApp Cloud API configurado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversaciones
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gratis
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pagadas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Costo (USD)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allUsersUsage.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.email}</p>
                            <p className="text-xs text-gray-500">{user.current_month}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <MessageCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900">
                            {user.total_conversations}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {user.free_tier_used}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {user.paid_conversations}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900">
                            {user.total_cost.toFixed(2)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Nota:</strong> Esta página solo muestra usuarios que usan WhatsApp Cloud API.
            Los usuarios con Baileys (como el admin) no aparecen aquí porque no tienen tracking de uso.
          </p>
        </div>
      </main>
    </div>
  )
}
