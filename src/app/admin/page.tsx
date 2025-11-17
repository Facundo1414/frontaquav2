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

        {/* Service Status */}
        <div className="mb-8">
          <ServiceStatus />
        </div>

        {/* WhatsApp Management Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📱 Gestión de WhatsApp</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* WhatsApp Configuration Card */}
            <div 
              onClick={() => router.push('/admin/whatsapp/config')}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-blue-400 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Configuración WhatsApp
              </h3>
              <p className="text-gray-600 text-sm">
                Configura las credenciales de WhatsApp Cloud API y gestiona el modo de operación
              </p>
            </div>

            {/* WhatsApp Usage Card */}
            <div 
              onClick={() => router.push('/admin/whatsapp/usage')}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-green-400 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-gray-400 group-hover:text-green-600 transition-colors">→</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                Uso de WhatsApp
              </h3>
              <p className="text-gray-600 text-sm">
                Monitorea el uso de mensajes, estadísticas y límites de WhatsApp Cloud API
              </p>
            </div>

            {/* Subscriptions Management Card */}
            <div 
              onClick={() => router.push('/admin/subscriptions')}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-amber-400 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-amber-100 p-3 rounded-lg group-hover:bg-amber-200 transition-colors">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-gray-400 group-hover:text-amber-600 transition-colors">→</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                Gestión de Suscripciones
              </h3>
              <p className="text-gray-600 text-sm">
                Administra planes de usuarios, registra pagos y controla accesos al sistema
              </p>
            </div>
          </div>
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
