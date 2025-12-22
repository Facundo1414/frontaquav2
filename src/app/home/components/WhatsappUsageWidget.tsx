'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, TrendingUp, Calendar, ChevronDown, RefreshCw } from 'lucide-react'

interface WhatsAppQuota {
  quota: number
  used: number
  remaining: number
  resetDate: string
  isExceeded: boolean
  overageMessages: number
  overageCost: number
}

export function WhatsappUsageWidget() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [quota, setQuota] = useState<WhatsAppQuota | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuota()
  }, [])

  const fetchQuota = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.log('No access token found')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/whatsapp-quota`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Quota fetched:', result.data)
        setQuota(result.data)
      } else {
        console.error('Failed to fetch quota:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching quota:', error)
    } finally {
      setLoading(false)
    }
  }

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
        </div>
      </div>
    );
  }

  if (!quota || quota.quota === 0) {
    return null
  }

  const percentageUsed = quota.quota > 0 ? (quota.used / quota.quota) * 100 : 0
  const resetDate = new Date(quota.resetDate).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md border border-green-200 overflow-hidden">
      {/* Header - siempre visible */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-green-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100">
            <MessageCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">WhatsApp Cloud API</h3>
            <p className="text-xs text-gray-600">
              {quota.remaining} de {quota.quota} mensajes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              fetchQuota()
            }}
            className="p-1 hover:bg-green-200 rounded transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </div>
      </div>

      {/* Contenido colapsable */}
      <div className={`transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-4 pb-4">
          {/* Grid de estadísticas */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Mensajes restantes */}
            <div className="bg-white/80 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600 font-medium">Disponibles</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{quota.remaining}</p>
              <p className="text-xs text-gray-500 mt-1">de {quota.quota} incluidos</p>
            </div>

            {/* Próximo reset */}
            <div className="bg-white/80 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-600 font-medium">Reset</span>
              </div>
              <p className="text-sm font-bold text-gray-900">{resetDate}</p>
              <p className="text-xs text-gray-500 mt-1">Próxima renovación</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Uso mensual</span>
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

          {/* Advertencia si quedan pocos */}
          {!quota.isExceeded && quota.remaining <= 50 && quota.remaining > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold text-amber-900">
                ⚠️ Quedan pocos mensajes disponibles
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Solo {quota.remaining} mensajes restantes este mes
              </p>
            </div>
          )}

          {/* Excedente (si aplica) */}
          {quota.isExceeded && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <span className="text-xs font-semibold text-red-900">⚠️ Límite excedido</span>
              </div>
              <p className="text-sm text-red-800 mb-2">
                Has enviado <span className="font-bold">{quota.used} mensajes</span> este mes.
              </p>
              <div className="bg-white/60 rounded p-2 border border-red-200">
                <p className="text-xs text-gray-700 mb-1">
                  Mensajes incluidos: <span className="font-semibold">{quota.quota}</span>
                </p>
                <p className="text-xs text-gray-700 mb-1">
                  Mensajes adicionales: <span className="font-semibold text-red-700">{quota.overageMessages}</span> × $0.05
                </p>
                <div className="border-t border-gray-300 mt-2 pt-2">
                  <p className="text-sm font-bold text-red-900">
                    Cargo adicional: ${quota.overageCost.toFixed(2)} USD
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Se agregará a tu próxima factura
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información de sobrecargo - SIEMPRE visible */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-semibold text-blue-900">Información de cobros</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-blue-800">
                • <span className="font-semibold">400 mensajes incluidos</span> en tu plan mensual
              </p>
              <p className="text-xs text-blue-800">
                • Mensajes adicionales: <span className="font-semibold">$0.05 USD c/u</span>
              </p>
              <p className="text-xs text-blue-700 mt-2 pt-2 border-t border-blue-200">
                {quota.isExceeded ? (
                  <>💰 Total a pagar este mes: <span className="font-bold">${quota.overageCost.toFixed(2)} USD</span> extra</>
                ) : (
                  <>✅ No tienes cargos adicionales este mes</>
                )}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-600 text-center">
            Plan PRO: 400 mensajes/mes incluidos
          </p>
        </div>
      </div>
    </div>
  )
}
