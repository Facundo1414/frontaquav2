'use client'

import { useState, useEffect } from 'react'
import { adminAPI } from '@/utils/admin-api'
import { toast } from 'sonner'

interface Service {
  id: string
  name: string
  endpoint: string
  status: 'active' | 'planned' | 'inactive'
}

export function ServiceStatus() {
  const [services, setServices] = useState<Service[]>([])
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [servicesData, healthData] = await Promise.all([
        adminAPI.getServices(),
        adminAPI.getHealth(),
      ])
      
      setServices(servicesData.services || [])
      setHealth(healthData)
    } catch (err: any) {
      toast.error(`Error al cargar estado de servicios: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
            ✅ Activo
          </span>
        )
      case 'planned':
        return (
          <span className="px-3 py-1 bg-yellow-600 text-white text-xs font-semibold rounded-full">
            🚧 Planeado
          </span>
        )
      case 'inactive':
        return (
          <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
            ❌ Inactivo
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-full">
            ❓ Desconocido
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-600"></div>
          <span className="text-gray-600">Cargando estado de servicios...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
        🖥️ Estado de Servicios
      </h2>

      {/* Health Status */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-gray-600 text-sm mb-1">Estado del Sistema</p>
            <p className="text-xl font-bold text-green-600">
              ✅ {health.status === 'healthy' ? 'Healthy' : health.status}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-gray-600 text-sm mb-1">Panel de Admin</p>
            <p className="text-xl font-bold text-blue-600">
              ✅ {health.admin_panel || 'operational'}
            </p>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="space-y-3">
        {services.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay servicios disponibles</p>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
                <p className="text-sm text-gray-600 font-mono">{service.endpoint}</p>
              </div>
              <div>{getStatusBadge(service.status)}</div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={loadData}
        className="mt-6 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-semibold"
      >
        🔄 Actualizar Estado
      </button>
    </div>
  )
}
