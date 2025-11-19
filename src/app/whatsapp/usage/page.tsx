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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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

        {/* Consejos para Optimizar Costos */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">💡 Consejos para Ahorrar</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">1. Agrupa mensajes al mismo contacto</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>Si envías comprobante + recordatorio + link de pago en el mismo día = <strong>1 conversación</strong></li>
                <li>Si los envías en días diferentes = <strong>3 conversaciones</strong></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. Planifica envíos masivos</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>Envía todos los comprobantes del mes en 1 día</li>
                <li>Envía todos los recordatorios en 1 día</li>
                <li>Esto maximiza el uso de las ventanas de 24 horas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Usa el free tier estratégicamente</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>1,000 conversaciones gratuitas = ~33 clientes con 30 mensajes cada uno</li>
                <li>Prioriza los clientes más importantes o morosos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">4. Monitorea en tiempo real</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>El badge en la navbar te avisa cuando te acercas al límite</li>
                <li>Revisa el dashboard semanalmente</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Preguntas Frecuentes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">❓ Preguntas Frecuentes</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">¿Qué pasa si supero las 1,000 conversaciones gratuitas?</h4>
              <p className="text-gray-700">
                Se te cobrará <strong>$0.095 USD por conversación adicional</strong> (precio para Argentina). 
                El costo se debita de tu método de pago configurado en Meta Business Suite.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">¿Puedo cambiar el número de teléfono después?</h4>
              <p className="text-gray-700 mb-2">Sí, simplemente:</p>
              <ol className="list-decimal ml-6 text-gray-700 space-y-1">
                <li>Agrega un nuevo número en Meta Business Suite</li>
                <li>Obtén su nuevo <strong>Phone Number ID</strong></li>
                <li>Actualiza la configuración en Aqua</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">¿Mi access token expira?</h4>
              <p className="text-gray-700 mb-2">
                Los <strong>tokens permanentes</strong> no expiran, pero pueden ser revocados por:
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Cambio de contraseña de Facebook</li>
                <li>Cambios en permisos de la app</li>
                <li>Seguridad de Meta</li>
              </ul>
              <p className="text-gray-700 mt-2">
                Si eso ocurre, genera un nuevo token y actualízalo en Aqua.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">¿Es seguro guardar mi access token en Aqua?</h4>
              <p className="text-gray-700">
                Sí. Tu access token se guarda <strong>encriptado con AES-256-GCM</strong> en la base de datos. 
                Ni siquiera los administradores de Aqua pueden verlo en texto plano.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">¿Qué es "Quality Rating"?</h4>
              <p className="text-gray-700 mb-2">Meta califica tu cuenta según:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li><strong>GREEN</strong>: Excelente calidad, sin restricciones</li>
                <li><strong>YELLOW</strong>: Calidad media, puede haber límites de envío</li>
                <li><strong>RED</strong>: Baja calidad, restricciones severas o riesgo de suspensión</li>
              </ul>
              <p className="text-gray-700 mt-2">Para mantener GREEN:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>No envíes spam</li>
                <li>Responde rápido a tus clientes</li>
                <li>No uses templates agresivos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Solución de Problemas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">🆘 Solución de Problemas</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">"Credenciales inválidas: Access token inválido o sin permisos"</h4>
              <p className="text-gray-700 font-semibold">Causa:</p>
              <p className="text-gray-700 mb-2">El token no tiene los permisos correctos o expiró.</p>
              <p className="text-gray-700 font-semibold">Solución:</p>
              <ol className="list-decimal ml-6 text-gray-700 space-y-1">
                <li>Ve a Meta Business Suite</li>
                <li>Genera un nuevo token permanente</li>
                <li>Asegúrate de seleccionar los permisos:
                  <ul className="list-disc ml-6 mt-1">
                    <li><code className="bg-gray-100 px-1 py-0.5 rounded">whatsapp_business_messaging</code></li>
                    <li><code className="bg-gray-100 px-1 py-0.5 rounded">whatsapp_business_management</code></li>
                  </ul>
                </li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">"phone_number_id no encontrado"</h4>
              <p className="text-gray-700 font-semibold">Causa:</p>
              <p className="text-gray-700 mb-2">El ID del número no coincide o el número no está verificado.</p>
              <p className="text-gray-700 font-semibold">Solución:</p>
              <ol className="list-decimal ml-6 text-gray-700 space-y-1">
                <li>Verifica que el número esté <strong>verificado</strong> en Meta Business Suite</li>
                <li>Copia nuevamente el <strong>Phone Number ID</strong> exacto (sin espacios)</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">"Business Account ID inválido"</h4>
              <p className="text-gray-700 font-semibold">Causa:</p>
              <p className="text-gray-700 mb-2">Copiaste el ID de la app en lugar del ID de la cuenta de negocio.</p>
              <p className="text-gray-700 font-semibold">Solución:</p>
              <ol className="list-decimal ml-6 text-gray-700 space-y-1">
                <li>Ve a <strong>Configuración de Business Manager</strong> (no de la app)</li>
                <li>Busca <strong>"Información comercial"</strong></li>
                <li>Copia el <strong>Business Manager ID</strong></li>
              </ol>
            </div>
          </div>
        </div>

        {/* Soporte */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">📞 Soporte</h3>
          <p className="text-sm text-gray-700 mb-3">
            Si tienes problemas que no se resuelven con esta guía:
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <strong>Documentación oficial de Meta</strong>:{' '}
              <a 
                href="https://developers.facebook.com/docs/whatsapp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                developers.facebook.com/docs/whatsapp
              </a>
            </li>
            <li>
              <strong>Soporte de Aqua</strong>: facu.allende14@gmail.com
            </li>
            <li>
              <strong>FAQ de Meta Business</strong>:{' '}
              <a 
                href="https://www.facebook.com/business/help" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                facebook.com/business/help
              </a>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
