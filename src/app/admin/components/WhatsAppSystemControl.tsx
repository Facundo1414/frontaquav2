'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MessageSquare, 
  Power, 
  RefreshCw, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Phone,
  LogOut
} from 'lucide-react'
import { adminAPI } from '@/utils/admin-api'
import { toast } from 'sonner'
import QRCode from 'qrcode'

interface WhatsAppSystemStatus {
  ready: boolean
  authenticated: boolean
  phone: string | null
  qr: string | null
  stats?: {
    messagesToday: number
    maxPerDay: number
    isWorkingHours: boolean
    percentageUsed: number
  }
}

export function WhatsAppSystemControl() {
  const [status, setStatus] = useState<WhatsAppSystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [initiating, setInitiating] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Cargar estado inicial
  useEffect(() => {
    loadStatus()
  }, [])

  // Auto-refresh cada 10 segundos cuando hay QR o está iniciando
  useEffect(() => {
    if (!autoRefresh) return

    const needsRefresh = status?.qr || initiating

    if (needsRefresh) {
      const interval = setInterval(() => {
        loadStatus()
      }, 10000) // 10 segundos

      return () => clearInterval(interval)
    }
  }, [status?.qr, initiating, autoRefresh])

  // Generar QR code visual cuando cambia
  useEffect(() => {
    if (status?.qr) {
      QRCode.toDataURL(status.qr, { width: 300, margin: 2 })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Error generating QR:', err))
    } else {
      setQrDataUrl(null)
    }
  }, [status?.qr])

  const loadStatus = async () => {
    try {
      const data = await adminAPI.whatsappSystem.getStatus()
      setStatus(data)
    } catch (error: any) {
      console.error('Error loading WhatsApp status:', error)
      toast.error('Error al cargar estado del sistema')
    } finally {
      setLoading(false)
    }
  }

  const handleInit = async () => {
    if (!confirm('¿Inicializar el sistema WhatsApp? Esto generará un nuevo QR si no hay sesión activa.')) {
      return
    }

    setInitiating(true)
    setAutoRefresh(true)

    try {
      await adminAPI.whatsappSystem.init()
      toast.success('✅ Inicialización iniciada. Esperando QR...')
      
      // Esperar 3 segundos y recargar
      setTimeout(() => {
        loadStatus()
      }, 3000)
    } catch (error: any) {
      toast.error(`Error al inicializar: ${error.message}`)
      setInitiating(false)
    }
  }

  const handleLogout = async () => {
    if (!confirm('⚠️ ¿Cerrar sesión del sistema WhatsApp? Esto desconectará el número prepago y necesitarás escanear el QR nuevamente.')) {
      return
    }

    setLoggingOut(true)

    try {
      await adminAPI.whatsappSystem.logout()
      toast.success('✅ Sesión cerrada correctamente')
      await loadStatus()
    } catch (error: any) {
      toast.error(`Error al cerrar sesión: ${error.message}`)
    } finally {
      setLoggingOut(false)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    loadStatus()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Sistema WhatsApp (Prepago)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = () => {
    if (status?.ready) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          Conectado
        </div>
      )
    }
    if (status?.qr) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
          <QrCode className="h-4 w-4" />
          Esperando QR
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
        <XCircle className="h-4 w-4" />
        Desconectado
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Sistema WhatsApp (Prepago)
            </CardTitle>
            <CardDescription>
              Control del número prepago compartido para todos los usuarios
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Estado Actual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Estado</div>
            <div className="font-semibold text-gray-900">
              {status?.ready ? '✅ Listo' : status?.authenticated ? '🔐 Autenticado' : '❌ Desconectado'}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Número
            </div>
            <div className="font-semibold text-gray-900">
              {status?.phone || 'No conectado'}
            </div>
          </div>

          {status?.stats && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Mensajes Hoy</div>
              <div className="font-semibold text-gray-900">
                {status.stats.messagesToday} / {status.stats.maxPerDay}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {status.stats.percentageUsed.toFixed(1)}% usado
              </div>
            </div>
          )}
        </div>

        {/* QR Code Display */}
        {status?.qr && qrDataUrl && (
          <Alert className="bg-blue-50 border-blue-200">
            <QrCode className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="space-y-4">
                <div className="text-sm font-medium text-blue-900">
                  📱 Escanea este QR con el celular prepago:
                </div>
                
                <div className="flex justify-center bg-white p-4 rounded-lg">
                  <img 
                    src={qrDataUrl} 
                    alt="QR Code" 
                    className="w-64 h-64 border-4 border-gray-200 rounded-lg"
                  />
                </div>

                <div className="text-xs text-blue-700 space-y-1">
                  <p><strong>Paso 1:</strong> Abre WhatsApp en el celular prepago</p>
                  <p><strong>Paso 2:</strong> Ve a Configuración → Dispositivos vinculados</p>
                  <p><strong>Paso 3:</strong> Toca "Vincular un dispositivo"</p>
                  <p><strong>Paso 4:</strong> Escanea el QR de arriba</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  El QR se actualiza automáticamente cada 10 segundos
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Estado Conectado */}
        {status?.ready && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="text-sm text-green-900">
                <strong>✅ Sistema operativo:</strong> El número prepago está conectado y listo para enviar mensajes.
                {status.phone && (
                  <div className="mt-2 font-mono text-xs">
                    Número activo: <span className="font-semibold">{status.phone}</span>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Acciones */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleInit}
            disabled={initiating || status?.ready}
            className="gap-2"
          >
            {initiating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <Power className="h-4 w-4" />
                Inicializar Sistema
              </>
            )}
          </Button>

          <Button
            onClick={handleLogout}
            disabled={loggingOut || !status?.ready}
            variant="destructive"
            className="gap-2"
          >
            {loggingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cerrando...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </>
            )}
          </Button>

          <Button
            onClick={handleRefresh}
            variant="outline"
            className="gap-2 ml-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {/* Información */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs space-y-2">
            <p>
              <strong>ℹ️ Información:</strong> Este es el número WhatsApp compartido que se usa cuando los usuarios 
              seleccionan "WhatsApp del Sistema" en su configuración.
            </p>
            <p>
              <strong>📋 Uso:</strong> Haz clic en "Inicializar Sistema" para conectar el número prepago por primera vez 
              o después de un logout. Si la sesión ya está guardada, se conectará automáticamente.
            </p>
            <p>
              <strong>⚠️ Nota:</strong> Solo necesitas escanear el QR la primera vez o después de hacer logout. 
              La sesión se mantiene entre reinicios del servidor.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
