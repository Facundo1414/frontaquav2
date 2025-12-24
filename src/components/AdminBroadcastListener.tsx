'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { XIcon, InfoIcon, AlertTriangleIcon, CheckCircleIcon, AlertCircleIcon, ExternalLinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminNotification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  duration: number
  dismissible: boolean
  timestamp: string
  action?: {
    label: string
    url?: string
  }
}

const typeConfig = {
  info: {
    icon: InfoIcon,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-700',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
  },
  warning: {
    icon: AlertTriangleIcon,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-400',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-800',
    textColor: 'text-amber-700',
    buttonColor: 'bg-amber-600 hover:bg-amber-700',
  },
  success: {
    icon: CheckCircleIcon,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-400',
    iconColor: 'text-green-500',
    titleColor: 'text-green-800',
    textColor: 'text-green-700',
    buttonColor: 'bg-green-600 hover:bg-green-700',
  },
  error: {
    icon: AlertCircleIcon,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-400',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    textColor: 'text-red-700',
    buttonColor: 'bg-red-600 hover:bg-red-700',
  },
}

/**
 * Componente que escucha notificaciones broadcast del administrador
 * y las muestra como popups/modales en pantalla
 * 
 * Debe montarse en el layout principal para estar siempre activo
 */
export function AdminBroadcastListener() {
  const { socket, connected } = useWebSocket()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  useEffect(() => {
    if (!socket || !connected) return

    // Escuchar broadcasts globales del admin
    const handleBroadcast = (notification: AdminNotification) => {
      console.log('📢 Admin broadcast recibido:', notification)
      
      setNotifications(prev => {
        // Evitar duplicados
        if (prev.some(n => n.id === notification.id)) return prev
        return [...prev, notification]
      })

      // Auto-dismiss después de la duración especificada
      if (notification.duration > 0) {
        setTimeout(() => {
          dismissNotification(notification.id)
        }, notification.duration)
      }
    }

    // Escuchar notificaciones dirigidas a este usuario
    const handleNotification = (notification: AdminNotification) => {
      console.log('📢 Admin notification recibida:', notification)
      
      setNotifications(prev => {
        if (prev.some(n => n.id === notification.id)) return prev
        return [...prev, notification]
      })

      if (notification.duration > 0) {
        setTimeout(() => {
          dismissNotification(notification.id)
        }, notification.duration)
      }
    }

    socket.on('admin:broadcast', handleBroadcast)
    socket.on('admin:notification', handleNotification)

    return () => {
      socket.off('admin:broadcast', handleBroadcast)
      socket.off('admin:notification', handleNotification)
    }
  }, [socket, connected, dismissNotification])

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {notifications.map((notification) => {
        const config = typeConfig[notification.type] || typeConfig.info
        const Icon = config.icon

        return (
          <div
            key={notification.id}
            className={cn(
              'pointer-events-auto animate-in slide-in-from-right-full duration-300',
              'rounded-lg border-l-4 shadow-lg p-4',
              config.bgColor,
              config.borderColor
            )}
          >
            <div className="flex items-start gap-3">
              {/* Icono */}
              <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
              
              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <h4 className={cn('font-semibold text-sm', config.titleColor)}>
                  {notification.title}
                </h4>
                <p className={cn('text-sm mt-1', config.textColor)}>
                  {notification.message}
                </p>
                
                {/* Botón de acción opcional */}
                {notification.action && (
                  <div className="mt-3">
                    {notification.action.url ? (
                      <a
                        href={notification.action.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-sm font-medium rounded-md transition-colors',
                          config.buttonColor
                        )}
                      >
                        {notification.action.label}
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className={cn(
                          'px-3 py-1.5 text-white text-sm font-medium rounded-md transition-colors',
                          config.buttonColor
                        )}
                      >
                        {notification.action.label}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Botón cerrar */}
              {notification.dismissible && (
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className={cn(
                    'flex-shrink-0 p-1 rounded-md transition-colors',
                    'hover:bg-black/10'
                  )}
                  aria-label="Cerrar notificación"
                >
                  <XIcon className={cn('w-4 h-4', config.iconColor)} />
                </button>
              )}
            </div>

            {/* Timestamp */}
            <div className={cn('text-xs mt-2 opacity-60', config.textColor)}>
              {new Date(notification.timestamp).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
