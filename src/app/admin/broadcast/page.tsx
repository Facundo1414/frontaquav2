'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { adminAPI } from '@/utils/admin-api'
import { toast } from 'sonner'
import { 
  SendIcon, 
  UsersIcon, 
  InfoIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  RefreshCwIcon,
  WifiIcon,
  Megaphone
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || ''

type NotificationType = 'info' | 'warning' | 'success' | 'error'

interface BroadcastStats {
  connectedClients: number
  whatsappSubscriptions: number
  jobSubscriptions: number
}

const typeOptions: { value: NotificationType; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'info', label: 'Información', icon: InfoIcon, color: 'text-blue-500' },
  { value: 'warning', label: 'Advertencia', icon: AlertTriangleIcon, color: 'text-amber-500' },
  { value: 'success', label: 'Éxito', icon: CheckCircleIcon, color: 'text-green-500' },
  { value: 'error', label: 'Error', icon: AlertCircleIcon, color: 'text-red-500' },
]

// Templates predefinidos para mensajes comunes
const messageTemplates = [
  {
    name: '🔧 Mantenimiento programado',
    type: 'warning' as NotificationType,
    title: 'Mantenimiento Programado',
    message: 'El sistema estará en mantenimiento de 00:00 a 02:00. Por favor guarde su trabajo.',
  },
  {
    name: '✅ Actualización completada',
    type: 'success' as NotificationType,
    title: 'Actualización Completada',
    message: 'Se han aplicado mejoras al sistema. Si nota algún problema, contáctenos.',
  },
  {
    name: '⚠️ Problemas temporales',
    type: 'warning' as NotificationType,
    title: 'Problemas Temporales',
    message: 'Estamos experimentando problemas técnicos. Nuestro equipo está trabajando en la solución.',
  },
  {
    name: '🚀 Nueva funcionalidad',
    type: 'info' as NotificationType,
    title: 'Nueva Funcionalidad Disponible',
    message: 'Hemos agregado nuevas características al sistema. ¡Explora las novedades!',
  },
  {
    name: '❌ Servicio no disponible',
    type: 'error' as NotificationType,
    title: 'Servicio Temporalmente No Disponible',
    message: 'El servicio no está disponible en este momento. Intente nuevamente más tarde.',
  },
]

export default function AdminBroadcastPage() {
  const router = useRouter()
  const { userId } = useGlobalContext()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<BroadcastStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  
  // Form state
  const [type, setType] = useState<NotificationType>('info')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [duration, setDuration] = useState(10000) // 10 segundos default
  const [dismissible, setDismissible] = useState(true)
  const [actionLabel, setActionLabel] = useState('')
  const [actionUrl, setActionUrl] = useState('')

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

    loadStats()
  }, [userId, router])

  const loadStats = async () => {
    setLoadingStats(true)
    try {
      const response = await adminAPI.broadcast.getStats()
      if (response.success) {
        setStats(response.stats)
      }
    } catch (error: any) {
      console.error('Error loading stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleSendBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Título y mensaje son requeridos')
      return
    }

    setLoading(true)
    try {
      const notification: any = {
        type,
        title: title.trim(),
        message: message.trim(),
        duration,
        dismissible,
      }

      // Agregar acción si está definida
      if (actionLabel.trim()) {
        notification.action = {
          label: actionLabel.trim(),
          url: actionUrl.trim() || undefined,
        }
      }

      const response = await adminAPI.broadcast.sendToAll(notification)
      
      if (response.success) {
        toast.success(`✅ ${response.message}`)
        // Limpiar formulario
        setTitle('')
        setMessage('')
        setActionLabel('')
        setActionUrl('')
        // Recargar stats
        loadStats()
      } else {
        toast.error(`Error: ${response.message}`)
      }
    } catch (error: any) {
      toast.error(`Error al enviar: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const applyTemplate = (template: typeof messageTemplates[0]) => {
    setType(template.type)
    setTitle(template.title)
    setMessage(template.message)
    toast.success(`Plantilla "${template.name}" aplicada`)
  }

  const SelectedIcon = typeOptions.find(t => t.value === type)?.icon || InfoIcon
  const selectedColor = typeOptions.find(t => t.value === type)?.color || 'text-blue-500'

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <PageHeader
        title="Notificaciones Broadcast"
        description="Envía mensajes a todos los usuarios conectados en tiempo real"
        icon={Megaphone}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Broadcast' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel principal - Formulario */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <SendIcon className="w-5 h-5 text-blue-600" />
                Enviar Notificación
              </h2>

              {/* Tipo de notificación */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Notificación
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {typeOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.value}
                        onClick={() => setType(option.value)}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          type === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${option.color}`} />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Título */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Mantenimiento programado"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={100}
                />
              </div>

              {/* Mensaje */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe el mensaje que verán los usuarios..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{message.length}/500 caracteres</p>
              </div>

              {/* Opciones adicionales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                {/* Duración */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración (segundos)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={5000}>5 segundos</option>
                    <option value={10000}>10 segundos</option>
                    <option value={15000}>15 segundos</option>
                    <option value={30000}>30 segundos</option>
                    <option value={60000}>1 minuto</option>
                    <option value={0}>Permanente (solo manual)</option>
                  </select>
                </div>

                {/* Dismissible */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Se puede cerrar?
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={dismissible}
                        onChange={() => setDismissible(true)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Sí</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!dismissible}
                        onChange={() => setDismissible(false)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Acción opcional */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Botón de Acción (opcional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={actionLabel}
                    onChange={(e) => setActionLabel(e.target.value)}
                    placeholder="Texto del botón (ej: Ver más)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="url"
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                    placeholder="URL (opcional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vista Previa
                </label>
                <div className={`rounded-lg border-l-4 p-4 ${
                  type === 'info' ? 'bg-blue-50 border-blue-400' :
                  type === 'warning' ? 'bg-amber-50 border-amber-400' :
                  type === 'success' ? 'bg-green-50 border-green-400' :
                  'bg-red-50 border-red-400'
                }`}>
                  <div className="flex items-start gap-3">
                    <SelectedIcon className={`w-5 h-5 ${selectedColor}`} />
                    <div>
                      <h4 className={`font-semibold text-sm ${
                        type === 'info' ? 'text-blue-800' :
                        type === 'warning' ? 'text-amber-800' :
                        type === 'success' ? 'text-green-800' :
                        'text-red-800'
                      }`}>
                        {title || 'Título de la notificación'}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        type === 'info' ? 'text-blue-700' :
                        type === 'warning' ? 'text-amber-700' :
                        type === 'success' ? 'text-green-700' :
                        'text-red-700'
                      }`}>
                        {message || 'Mensaje de la notificación...'}
                      </p>
                      {actionLabel && (
                        <button className={`mt-2 px-3 py-1 text-white text-sm rounded-md ${
                          type === 'info' ? 'bg-blue-600' :
                          type === 'warning' ? 'bg-amber-600' :
                          type === 'success' ? 'bg-green-600' :
                          'bg-red-600'
                        }`}>
                          {actionLabel}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón enviar */}
              <button
                onClick={handleSendBroadcast}
                disabled={loading || !title.trim() || !message.trim()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCwIcon className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <SendIcon className="w-5 h-5" />
                    Enviar a Todos los Usuarios
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Stats de conexiones */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <WifiIcon className="w-5 h-5 text-green-600" />
                  Conexiones Activas
                </h3>
                <button
                  onClick={loadStats}
                  disabled={loadingStats}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Actualizar"
                >
                  <RefreshCwIcon className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {stats ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700">Clientes conectados</span>
                    <span className="text-xl font-bold text-green-600">{stats.connectedClients}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-700">Suscripciones WhatsApp</span>
                    <span className="text-xl font-bold text-blue-600">{stats.whatsappSubscriptions}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-gray-700">Jobs activos</span>
                    <span className="text-xl font-bold text-purple-600">{stats.jobSubscriptions}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Cargando estadísticas...</p>
              )}
            </div>

            {/* Plantillas */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                📋 Plantillas Rápidas
              </h3>
              <div className="space-y-2">
                {messageTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyTemplate(template)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-sm"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">💡 Información</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Las notificaciones se envían en tiempo real</li>
                <li>• Solo usuarios con conexión WebSocket las reciben</li>
                <li>• Usa &quot;Permanente&quot; para avisos críticos</li>
                <li>• Los usuarios pueden cerrar si está habilitado</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  )
}