'use client'

import { useRouter } from 'next/navigation'
import { MessageCircle, Users, Clock } from 'lucide-react'
import { useWhatsAppUnified } from '@/hooks/useWhatsAppUnified'

export function WhatsappUsageWidget() {
  const router = useRouter()
  const { ready, stats, loading } = useWhatsAppUnified()

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border border-green-200">
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div>
                <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/80 rounded-lg p-4">
              <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white/80 rounded-lg p-4">
              <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const messagesRemaining = stats ? (stats.maxPerDay - stats.messagesToday) : 0
  const percentageUsed = stats?.percentageUsed ?? 0
  const maxMessages = stats?.maxPerDay ?? 300
  const isWorkingHours = stats?.isWorkingHours ?? false

  return (
    <div 
      onClick={() => router.push('/whatsapp/profile')}
      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border border-green-200 cursor-pointer hover:shadow-lg transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg transition-colors ${
            ready ? 'bg-green-100 group-hover:bg-green-200' : 'bg-gray-100'
          }`}>
            <MessageCircle className={`w-6 h-6 ${ready ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">WhatsApp Sistema</h3>
            <p className="text-sm text-gray-600">
              {ready ? (isWorkingHours ? 'Activo' : 'Fuera de horario') : 'Desconectado'}
            </p>
          </div>
        </div>
        <span className="text-gray-400 group-hover:text-green-600 transition-colors">→</span>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Mensajes disponibles */}
        <div className="bg-white/80 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-600 font-medium">Disponibles</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{messagesRemaining}</p>
          <p className="text-xs text-gray-500 mt-1">de {maxMessages} diarios</p>
        </div>

        {/* Horario */}
        <div className="bg-white/80 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-600 font-medium">Horario</span>
          </div>
          <p className="text-lg font-bold text-gray-900">9-16hs</p>
          <p className="text-xs text-gray-500 mt-1">
            {isWorkingHours ? 'En horario' : 'Fuera de horario'}
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Uso diario</span>
          <span className="font-medium">{percentageUsed.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              percentageUsed < 70 ? 'bg-green-500' : 
              percentageUsed < 90 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-gray-600 text-center">
        Click para configurar tu perfil de contacto
      </p>
    </div>
  )
}
