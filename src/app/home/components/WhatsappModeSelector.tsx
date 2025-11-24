'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Smartphone, Users, Info } from 'lucide-react'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { toast } from 'sonner'
import api from '@/lib/api/axiosInstance'

type WhatsAppMode = 'system' | 'personal'

interface UserPreference {
  whatsapp_mode: WhatsAppMode
}

interface WhatsappModeSelectorProps {
  onModeChange?: (mode: WhatsAppMode) => void
  onConnectClick?: () => void
}

export function WhatsappModeSelector({ onModeChange, onConnectClick }: WhatsappModeSelectorProps) {
  const { userId } = useGlobalContext()
  const [mode, setMode] = useState<WhatsAppMode>('system')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPreference()
  }, [])

  const loadPreference = async () => {
    try {
      setLoading(true)
      
      // Primero intentar cargar desde localStorage (más rápido)
      const cachedMode = localStorage.getItem('whatsapp_mode') as WhatsAppMode | null
      if (cachedMode) {
        setMode(cachedMode)
        // Notificar inmediatamente al padre con el valor cacheado
        onModeChange?.(cachedMode)
      }
      
      // Luego cargar desde el backend para sincronizar
      const response = await api.get<UserPreference>('/users/whatsapp-mode')
      const serverMode = response.data.whatsapp_mode || 'system'
      
      // Guardar en localStorage
      localStorage.setItem('whatsapp_mode', serverMode)
      
      // Actualizar estado si cambió
      if (serverMode !== cachedMode) {
        setMode(serverMode)
        onModeChange?.(serverMode)
      }
    } catch (error) {
      console.error('Error loading WhatsApp mode preference:', error)
      // Si falla, intentar usar localStorage
      const cachedMode = localStorage.getItem('whatsapp_mode') as WhatsAppMode | null
      const fallbackMode = cachedMode || 'system'
      setMode(fallbackMode)
      onModeChange?.(fallbackMode)
    } finally {
      setLoading(false)
    }
  }

  const handleModeChange = async (newMode: WhatsAppMode) => {
    if (saving) return

    try {
      setSaving(true)
      
      // Guardar inmediatamente en localStorage
      localStorage.setItem('whatsapp_mode', newMode)
      setMode(newMode)
      
      // Notificar al componente padre inmediatamente
      onModeChange?.(newMode)
      
      // Luego guardar en el backend
      await api.post('/users/whatsapp-mode', { whatsapp_mode: newMode })
      
      toast.success(
        newMode === 'system'
          ? '✅ Ahora usarás el WhatsApp del sistema (prepago)'
          : '✅ Ahora usarás tu WhatsApp personal'
      )
      
      // Si cambia a personal, abrir automáticamente el modal de conexión
      if (newMode === 'personal' && onConnectClick) {
        setTimeout(() => onConnectClick(), 500)
      }
    } catch (error: any) {
      console.error('Error saving WhatsApp mode:', error)
      toast.error(error.response?.data?.message || 'Error al guardar preferencia')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-5 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MessageCircle className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Modo de WhatsApp</h3>
          <p className="text-sm text-gray-600">
            Elegí qué WhatsApp usar para enviar mensajes a tus clientes
          </p>
        </div>
      </div>

      {/* Selector de modo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* WhatsApp del Sistema (Prepago) */}
        <button
          onClick={() => handleModeChange('system')}
          disabled={saving}
          className={`
            relative p-4 rounded-lg border-2 transition-all
            ${
              mode === 'system'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }
            ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-start gap-3">
            <div
              className={`
              p-2 rounded-lg transition-colors
              ${mode === 'system' ? 'bg-green-100' : 'bg-gray-100'}
            `}
            >
              <Users className={`w-5 h-5 ${mode === 'system' ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-semibold text-gray-900 mb-1">WhatsApp del Sistema</h4>
              <p className="text-xs text-gray-600">
                Número prepago compartido para todos los usuarios
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-green-700">
                <span className="font-medium">• Automático</span>
                <span>• Sin configuración</span>
              </div>
            </div>
          </div>
          {mode === 'system' && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </button>

        {/* WhatsApp Personal */}
        <button
          onClick={() => handleModeChange('personal')}
          disabled={saving}
          className={`
            relative p-4 rounded-lg border-2 transition-all
            ${
              mode === 'personal'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }
            ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-start gap-3">
            <div
              className={`
              p-2 rounded-lg transition-colors
              ${mode === 'personal' ? 'bg-blue-100' : 'bg-gray-100'}
            `}
            >
              <Smartphone
                className={`w-5 h-5 ${mode === 'personal' ? 'text-blue-600' : 'text-gray-400'}`}
              />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-semibold text-gray-900 mb-1">WhatsApp Personal</h4>
              <p className="text-xs text-gray-600">Conectá tu propio número de WhatsApp</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-blue-700">
                <span className="font-medium">• Tu número</span>
                <span>• Requiere QR</span>
              </div>
            </div>
          </div>
          {mode === 'personal' && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900 flex-1">
          {mode === 'system' ? (
            <p>
              <strong>Modo automático:</strong> Los mensajes se envían desde el número del sistema.
              No necesitás configurar nada.
            </p>
          ) : (
            <p>
              <strong>Modo personal:</strong> Los mensajes se envían desde tu WhatsApp. Debés
              conectar tu sesión escaneando el código QR.
            </p>
          )}
        </div>
        {mode === 'personal' && onConnectClick && (
          <button
            onClick={onConnectClick}
            className="ml-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors whitespace-nowrap"
          >
            Conectar sesión
          </button>
        )}
      </div>
    </div>
  )
}
