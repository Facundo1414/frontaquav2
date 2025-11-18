'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import api from '@/lib/api/axiosInstance'
import { toast } from 'sonner'
import {
  AlertCircle,
  ArrowLeft,
  TrendingUp,
  DollarSign,
  MessageCircle,
  Calendar,
  Loader2,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || ''

interface MonthlyUsage {
  sent_messages: number
  cost_usd: number
  period: string
}

interface WhatsappConfig {
  whatsapp_enabled: boolean
  phone_number_id?: string
}

export default function WhatsappUsagePage() {
  const router = useRouter()
  const { userId } = useGlobalContext()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState<WhatsappConfig | null>(null)
  const [usage, setUsage] = useState<MonthlyUsage | null>(null)
  const [history, setHistory] = useState<MonthlyUsage[]>([])

  const isAdmin = userId === ADMIN_UID

  // Verificar autenticación
  useEffect(() => {
    if (!userId) {
      toast.error('Debe iniciar sesión para acceder')
      router.push('/login')
      return
    }

    // Admin no puede ver esta página (usa /admin/whatsapp/usage)
    if (isAdmin) {
      toast.error('Administradores deben usar el panel de admin')
      router.push('/admin/whatsapp/usage')
      return
    }

    setIsCheckingAuth(false)
  }, [userId, router, isAdmin])

  useEffect(() => {
    if (!isCheckingAuth) {
      loadData()
    }
  }, [isCheckingAuth])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [configRes, usageRes, historyRes] = await Promise.all([
        api.get<WhatsappConfig>('/whatsapp/config').catch(() => ({ data: null })),
        api.get<MonthlyUsage>('/whatsapp/usage').catch(() => ({ data: null })),
        api.get<MonthlyUsage[]>('/whatsapp/usage/history?months=6').catch(() => ({ data: [] })),
      ])

      setConfig(configRes.data)
      setUsage(usageRes.data)
      setHistory(historyRes.data)
    } catch (error) {
      console.error('Error loading data', error)
      toast.error('Error al cargar datos de uso')
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando datos de uso...</p>
        </div>
      </div>
    )
  }

  // No configurado
  if (!config || !config.whatsapp_enabled) {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <Alert>
          <AlertCircle className="w-5 h-5" />
          <AlertDescription>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">WhatsApp Cloud API no configurado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure sus credenciales para comenzar a enviar mensajes
                </p>
              </div>
              <Button onClick={() => router.push('/whatsapp/config')}>
                Configurar Ahora
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Datos calculados
  const sentMessages = usage?.sent_messages || 0
  const costUsd = usage?.cost_usd || 0
  const freeMessages = 1000
  const remainingFree = Math.max(0, freeMessages - sentMessages)
  const exceededFree = Math.max(0, sentMessages - freeMessages)
  const costPerExtraMessage = 0.0042 // USD
  const progressPercent = Math.min((sentMessages / freeMessages) * 100, 100)

  // Preparar datos para gráfico
  const chartData = history
    .slice()
    .reverse()
    .map((item) => ({
      period: item.period,
      mensajes: item.sent_messages,
      costo: parseFloat(item.cost_usd.toFixed(2)),
    }))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="container max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/home')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Uso de WhatsApp</h1>
                <p className="text-sm text-gray-600">Monitorea tu consumo de mensajes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Mensajes Enviados */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Mensajes Enviados</h3>
            <p className="text-3xl font-bold text-gray-900">{sentMessages}</p>
            <p className="text-xs text-gray-500 mt-2">Este mes</p>
          </div>

          {/* Mensajes Gratis Restantes */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Gratis Restantes</h3>
            <p className="text-3xl font-bold text-gray-900">{remainingFree}</p>
            <p className="text-xs text-gray-500 mt-2">de {freeMessages} mensuales</p>
          </div>

          {/* Costo Total */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Costo Este Mes</h3>
            <p className="text-3xl font-bold text-gray-900">${costUsd.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">USD</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-900">Uso de Mensajes Gratis</h3>
            <span className="text-sm font-medium text-gray-600">
              {sentMessages} / {freeMessages}
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full transition-all ${
                sentMessages <= freeMessages ? 'bg-green-500' : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {exceededFree > 0 && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Has excedido {exceededFree} mensajes del límite gratuito.{' '}
                <span className="font-semibold">
                  Costo adicional: ${(exceededFree * costPerExtraMessage).toFixed(2)} USD
                </span>
                <br />
                <span className="text-xs text-muted-foreground">
                  (${costPerExtraMessage.toFixed(4)} USD por mensaje adicional)
                </span>
              </AlertDescription>
            </Alert>
          )}

          {remainingFree > 0 && (
            <p className="text-sm text-gray-600">
              Te quedan <span className="font-semibold text-green-600">{remainingFree} mensajes gratis</span> este mes.
            </p>
          )}
        </div>

        {/* Información de Precios */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Información de Precios</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>1,000 mensajes gratis</strong> por mes (conversaciones iniciadas por la empresa)</li>
            <li>• <strong>${costPerExtraMessage.toFixed(4)} USD</strong> por cada mensaje adicional</li>
            <li>• Los costos se reinician el primer día de cada mes</li>
            <li>• Precios según WhatsApp Business Platform oficial de Meta</li>
          </ul>
        </div>

        {/* Gráficos de Historial */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico de Mensajes */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Mensajes por Mes</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Bar dataKey="mensajes" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Costos */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Costos por Mes (USD)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="costo" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
