'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { adminAPI } from '@/utils/admin-api'
import { ServiceStatus } from './components/ServiceStatus'
import { toast } from 'sonner'

// Leer ADMIN_UID desde variables de entorno
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || ''

export default function AdminDashboard() {
  const router = useRouter()
  const { userId, usernameGlobal } = useGlobalContext()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)

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

    // Cargar datos del dashboard
    const loadDashboard = async () => {
      try {
        const data = await adminAPI.getDashboard()
        setDashboardData(data)
      } catch (error: any) {
        toast.error(`Error al cargar dashboard: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [userId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header con mismo estilo que home */}
      <div className="relative flex justify-between items-center bg-white shadow-md rounded-lg p-6 mb-6 mx-6 mt-6">
        <div 
          className="absolute inset-0 rounded-lg opacity-10"
          style={{ backgroundImage: "url('/bg_topEspacioClientes.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            ⚙️ Panel de Administración
          </h1>
          <p className="text-gray-600 mt-1">
            Bienvenido, <span className="text-blue-600 font-semibold">{usernameGlobal}</span>
          </p>
        </div>
        <button
          onClick={() => router.push('/home')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 relative z-10"
        >
          ← Volver al inicio
        </button>
      </div>

      {/* Dashboard Content - Ancho completo */}
      <main className="px-6 pb-10">
        {/* Dashboard Info Card */}
        {dashboardData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">{dashboardData.title}</h2>
            <p className="text-gray-600 text-sm mb-4">Versión: {dashboardData.version}</p>
            <p className="text-gray-500 text-xs">
              Última actualización: {new Date(dashboardData.timestamp).toLocaleString('es-AR')}
            </p>
          </div>
        )}

        {/* Service Status - Temporal hasta implementar nuevas pestañas */}
        <div className="mb-8">
          <ServiceStatus />
        </div>

        {/* TODO: Implementar pestañas de Monitoreo y Gestión de Sesiones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800 font-medium">🚧 En Construcción</p>
          <p className="text-blue-600 text-sm mt-2">
            Nuevas pestañas próximamente: Monitoreo de Salud y Gestión de Sesiones
          </p>
        </div>
      </main>
    </div>
  )
}
