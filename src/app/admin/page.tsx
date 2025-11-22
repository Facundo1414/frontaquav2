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

        {/* System Management Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🛠️ Administración del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Services Management Card - NEW */}
            <div 
              onClick={() => router.push('/admin/services')}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-indigo-400 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <span className="text-gray-400 group-hover:text-indigo-600 transition-colors">→</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                Gestión de Servicios
              </h3>
              <p className="text-gray-600 text-sm">
                Logs en tiempo real, restart manual, health checks detallados y export de logs
              </p>
            </div>

            {/* Tutorial Documentation Card - NEW */}
            <div 
              onClick={() => router.push('/admin/tutorial')}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-teal-400 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-teal-100 p-3 rounded-lg group-hover:bg-teal-200 transition-colors">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-gray-400 group-hover:text-teal-600 transition-colors">→</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                📚 Tutorial de Administración
              </h3>
              <p className="text-gray-600 text-sm">
                Guía completa: servicios, WhatsApp API, monitoreo PYSE y más
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

            {/* Supabase Metrics Card */}
            <div 
              onClick={() => router.push('/admin/supabase')}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-emerald-400 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-emerald-100 p-3 rounded-lg group-hover:bg-emerald-200 transition-colors">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <span className="text-gray-400 group-hover:text-emerald-600 transition-colors">→</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                Métricas Supabase
              </h3>
              <p className="text-gray-600 text-sm">
                Monitorea storage, database, auth users y health status de Supabase
              </p>
            </div>

            {/* Railway Metrics Card */}
            <div 
              onClick={() => router.push('/admin/railway')}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-purple-400 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-gray-400 group-hover:text-purple-600 transition-colors">→</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                Métricas Railway
              </h3>
              <p className="text-gray-600 text-sm">
                Monitorea costos, deployments y recursos de los servicios en Railway
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
