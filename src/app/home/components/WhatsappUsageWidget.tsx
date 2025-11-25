'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Users, Clock, ChevronDown } from 'lucide-react'
import { useWhatsAppUnified } from '@/hooks/useWhatsAppUnified'

export function WhatsappUsageWidget() {
  const router = useRouter()
  const { ready, stats, loading } = useWhatsAppUnified()
  const [isOpen, setIsOpen] = useState(false)

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
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md border border-green-200 overflow-hidden">
      {/* Header - siempre visible */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-green-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors ${
            ready ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <MessageCircle className={`w-5 h-5 ${ready ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">WhatsApp Sistema</h3>
            <p className="text-xs text-gray-600">
              {ready ? (isWorkingHours ? 'Activo' : 'Fuera de horario') : 'Desconectado'}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </div>

      {/* Contenido colapsable */}
      <div className={`transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-4 pb-4">
          <div 
            onClick={(e) => {
              e.stopPropagation()
              router.push('/whatsapp/profile')
            }}
            className="cursor-pointer hover:opacity-90 transition-opacity"
          >
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

            <p className="text-xs text-gray-600 text-center mt-2">
              Click para configurar tu perfil de contacto
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
