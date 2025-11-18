'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, TrendingUp, DollarSign, AlertCircle, Loader2 } from 'lucide-react'
import api from '@/lib/api/axiosInstance'
import { useSubscription } from '@/context/SubscriptionContext'

interface MonthlyUsage {
  sent_messages: number
  cost_usd: number
  period: string
}

interface WhatsappConfig {
  whatsapp_enabled: boolean
}

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || ''

export function WhatsappUsageWidget({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState<MonthlyUsage | null>(null)
  const [config, setConfig] = useState<WhatsappConfig | null>(null)
  const { isPro } = useSubscription()
  const isAdmin = userId === ADMIN_UID

  // Admin no ve este widget
  if (isAdmin) return null
  
  // Usuarios BASE no necesitan ver WhatsApp
  if (!isPro) return null

  useEffect(() => {
    loadUsage()
  }, [])

  const loadUsage = async () => {
    try {
      const [configRes, usageRes] = await Promise.all([
        api.get<WhatsappConfig>('/whatsapp/config').catch(() => ({ data: null })),
        api.get<MonthlyUsage>('/whatsapp/usage').catch(() => ({ data: null })),
      ])
      setConfig(configRes.data)
      setUsage(usageRes.data)
    } catch (error) {
      console.error('Error loading WhatsApp usage:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  // No configurado
  if (!config || !config.whatsapp_enabled) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">WhatsApp Cloud API</h3>
              <p className="text-sm text-gray-600">Sin configurar</p>
            </div>
          </div>
          <AlertCircle className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Configura WhatsApp Cloud API para empezar a enviar mensajes y trackear tu uso.
        </p>
        <button
          onClick={() => router.push('/whatsapp/config')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Configurar ahora
        </button>
      </div>
    )
  }

  // Configurado - mostrar estadísticas
  const sentMessages = usage?.sent_messages || 0
  const costUsd = usage?.cost_usd || 0
  const freeMessages = 1000
  const remainingFree = Math.max(0, freeMessages - sentMessages)
  const exceededFree = Math.max(0, sentMessages - freeMessages)
  const costPerExtraMessage = 0.0042 // USD según pricing de Meta

  return (
    <div 
      onClick={() => router.push('/whatsapp/usage')}
      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border border-green-200 cursor-pointer hover:shadow-lg transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Uso de WhatsApp</h3>
            <p className="text-sm text-gray-600">Este mes</p>
          </div>
        </div>
        <span className="text-gray-400 group-hover:text-green-600 transition-colors">→</span>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Mensajes enviados */}
        <div className="bg-white/80 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-600 font-medium">Enviados</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{sentMessages}</p>
          <p className="text-xs text-gray-500 mt-1">
            {remainingFree > 0 ? `${remainingFree} gratis restantes` : `+${exceededFree} extras`}
          </p>
        </div>

        {/* Costo */}
        <div className="bg-white/80 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-600 font-medium">Costo</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${costUsd.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ${costPerExtraMessage.toFixed(4)} por extra
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Gratis: {freeMessages} mensajes</span>
          <span className="font-medium">{sentMessages}/{freeMessages}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              sentMessages <= freeMessages 
                ? 'bg-green-500' 
                : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min((sentMessages / freeMessages) * 100, 100)}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-gray-600 text-center">
        Click para ver historial completo
      </p>
    </div>
  )
}
