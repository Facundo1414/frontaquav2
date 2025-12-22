'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { adminAPI } from '@/utils/admin-api'
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 text-lg font-medium">Cargando panel de administración...</p>
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
        {/* System Management Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🛠️ Administración del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tutorial Documentation Card */}
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

            {/* Conversaciones Card */}
            <div 
              onClick={() => router.push('/admin/conversaciones')}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-blue-400 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Conversaciones WhatsApp
              </h3>
              <p className="text-gray-600 text-sm">
                Gestiona conversaciones y chats de WhatsApp Cloud API
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
