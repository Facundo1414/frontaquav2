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
      <div className="bg-white rounded-xl shadow-card p-6 border border-slate-200/50">
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              <div>
                <div className="h-5 w-32 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
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
    <div className="bg-white rounded-xl shadow-card border border-slate-200/50 overflow-hidden">
      {/* Header - siempre visible */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">WhatsApp Cloud API</h3>
            <p className="text-xs text-slate-500">
              {quota.remaining} de {quota.quota} mensajes disponibles
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              fetchQuota()
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
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
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-slate-500 font-medium">Disponibles</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{quota.remaining}</p>
              <p className="text-xs text-slate-400 mt-1">de {quota.quota} incluidos</p>
            </div>

            {/* Próximo reset */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-cyan-600" />
                <span className="text-xs text-slate-500 font-medium">Reset</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{resetDate}</p>
              <p className="text-xs text-slate-400 mt-1">Próxima renovación</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Uso mensual</span>
              <span className="font-medium text-slate-700">{percentageUsed.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  percentageUsed < 70 ? 'bg-emerald-500' : 
                  percentageUsed < 90 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>
          </div>

          {/* Advertencia si quedan pocos */}
          {!quota.isExceeded && quota.remaining <= 50 && quota.remaining > 0 && (
            <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-3 mb-3">
              <p className="text-xs font-semibold text-amber-800">
                ⚠️ Quedan pocos mensajes disponibles
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Solo {quota.remaining} mensajes restantes este mes
              </p>
            </div>
          )}

          {/* Excedente (si aplica) */}
          {quota.isExceeded && (
            <div className="bg-rose-50 border border-rose-200/50 rounded-xl p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-semibold text-rose-800">⚠️ Límite excedido</span>
              </div>
              <p className="text-sm text-rose-700 mb-2">
                Has enviado <span className="font-bold">{quota.used} mensajes</span> este mes.
              </p>
              <div className="bg-white/60 rounded-lg p-2 border border-rose-200/50">
                <p className="text-xs text-slate-600 mb-1">
                  Mensajes incluidos: <span className="font-semibold">{quota.quota}</span>
                </p>
                <p className="text-xs text-slate-600 mb-1">
                  Mensajes adicionales: <span className="font-semibold text-rose-600">{quota.overageMessages}</span> × $0.05
                </p>
                <div className="border-t border-slate-200 mt-2 pt-2">
                  <p className="text-sm font-bold text-rose-700">
                    Cargo adicional: ${quota.overageCost.toFixed(2)} USD
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Se agregará a tu próxima factura
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información de sobrecargo - SIEMPRE visible */}
          <div className="bg-cyan-50 border border-cyan-200/50 rounded-xl p-3 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-3 h-3 text-cyan-600" />
              <span className="text-xs font-semibold text-cyan-800">Información de cobros</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-cyan-700">
                • <span className="font-semibold">400 mensajes incluidos</span> en tu plan mensual
              </p>
              <p className="text-xs text-cyan-700">
                • Mensajes adicionales: <span className="font-semibold">$0.05 USD c/u</span>
              </p>
              <p className="text-xs text-cyan-600 mt-2 pt-2 border-t border-cyan-200/50">
                {quota.isExceeded ? (
                  <>💰 Total a pagar este mes: <span className="font-bold">${quota.overageCost.toFixed(2)} USD</span> extra</>
                ) : (
                  <>✅ No tienes cargos adicionales este mes</>
                )}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Plan PRO: 400 mensajes/mes incluidos
          </p>
        </div>
      </div>
    </div>
  )
}
