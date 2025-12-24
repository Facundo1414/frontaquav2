'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wifi, 
  WifiOff, 
  MessageCircle, 
  Server, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SimpleTooltip } from '@/components/ui/tooltip'

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error'

interface StatusIndicatorProps {
  status: ConnectionStatus
  label: string
  sublabel?: string
  showPulse?: boolean
  className?: string
}

// Colores y configuración por estado
const statusConfig: Record<ConnectionStatus, {
  color: string
  bgColor: string
  icon: typeof Wifi
  text: string
}> = {
  connected: {
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    icon: CheckCircle2,
    text: 'Conectado'
  },
  connecting: {
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    icon: Loader2,
    text: 'Conectando...'
  },
  disconnected: {
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    icon: WifiOff,
    text: 'Desconectado'
  },
  error: {
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    icon: AlertCircle,
    text: 'Error'
  }
}

// Indicador individual de estado
export function StatusIndicator({ 
  status, 
  label, 
  sublabel,
  showPulse = true,
  className 
}: StatusIndicatorProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "relative flex items-center justify-center w-8 h-8 rounded-full",
        config.bgColor
      )}>
        <Icon className={cn(
          "w-4 h-4",
          config.color,
          status === 'connecting' && "animate-spin"
        )} />
        {showPulse && status === 'connected' && (
          <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className={cn("text-xs", config.color)}>
          {sublabel || config.text}
        </span>
      </div>
    </div>
  )
}

// Widget compacto de estado múltiple (para usar en header/sidebar)
interface CompactStatusWidgetProps {
  websocketStatus: ConnectionStatus
  whatsappStatus: ConnectionStatus
  apiStatus: ConnectionStatus
  className?: string
}

export function CompactStatusWidget({
  websocketStatus,
  whatsappStatus,
  apiStatus,
  className
}: CompactStatusWidgetProps) {
  const allConnected = websocketStatus === 'connected' && 
                       whatsappStatus === 'connected' && 
                       apiStatus === 'connected'
  
  const hasError = websocketStatus === 'error' || 
                   whatsappStatus === 'error' || 
                   apiStatus === 'error'

  const overallStatus: ConnectionStatus = allConnected 
    ? 'connected' 
    : hasError 
      ? 'error' 
      : 'connecting'

  const config = statusConfig[overallStatus]

  return (
    <SimpleTooltip 
      content={
        <div className="space-y-2 py-1">
          <StatusDot status={websocketStatus} label="WebSocket" />
          <StatusDot status={whatsappStatus} label="WhatsApp" />
          <StatusDot status={apiStatus} label="API" />
        </div>
      }
      side="bottom"
    >
      <motion.div 
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full cursor-default",
          config.bgColor,
          className
        )}
        whileHover={{ scale: 1.02 }}
      >
        <div className="relative">
          <div className={cn(
            "w-2 h-2 rounded-full",
            overallStatus === 'connected' ? 'bg-emerald-500' :
            overallStatus === 'error' ? 'bg-rose-500' : 'bg-amber-500'
          )} />
          {overallStatus === 'connected' && (
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
          )}
        </div>
        <span className={cn("text-xs font-medium", config.color)}>
          {allConnected ? 'Todo conectado' : hasError ? 'Error de conexión' : 'Conectando...'}
        </span>
      </motion.div>
    </SimpleTooltip>
  )
}

// Punto de estado pequeño para tooltips
function StatusDot({ status, label }: { status: ConnectionStatus; label: string }) {
  const config = statusConfig[status]
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "w-2 h-2 rounded-full",
        status === 'connected' ? 'bg-emerald-500' :
        status === 'error' ? 'bg-rose-500' :
        status === 'disconnected' ? 'bg-slate-400' : 'bg-amber-500'
      )} />
      <span className="text-xs text-slate-600">{label}:</span>
      <span className={cn("text-xs font-medium", config.color)}>{config.text}</span>
    </div>
  )
}

// Panel expandido de estado del sistema
interface SystemStatusPanelProps {
  className?: string
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function SystemStatusPanel({ 
  className,
  onRefresh,
  isRefreshing 
}: SystemStatusPanelProps) {
  const [statuses, setStatuses] = useState({
    websocket: 'connecting' as ConnectionStatus,
    whatsapp: 'connecting' as ConnectionStatus,
    api: 'connecting' as ConnectionStatus,
    database: 'connecting' as ConnectionStatus,
  })

  // Simular chequeo de estado (reemplazar con lógica real)
  useEffect(() => {
    const checkStatuses = async () => {
      // Aquí iría la lógica real de verificación
      setStatuses({
        websocket: 'connected',
        whatsapp: 'connected',
        api: 'connected',
        database: 'connected',
      })
    }
    
    checkStatuses()
    const interval = setInterval(checkStatuses, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn(
      "bg-white rounded-xl border border-slate-200 p-5 shadow-sm",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Estado del Sistema</h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={cn(
              "w-4 h-4 text-slate-500",
              isRefreshing && "animate-spin"
            )} />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <StatusIndicator 
          status={statuses.websocket} 
          label="WebSocket"
          sublabel="Tiempo real"
        />
        <StatusIndicator 
          status={statuses.whatsapp} 
          label="WhatsApp"
          sublabel="Cloud API"
        />
        <StatusIndicator 
          status={statuses.api} 
          label="Servidor"
          sublabel="API REST"
        />
        <StatusIndicator 
          status={statuses.database} 
          label="Base de Datos"
          sublabel="Supabase"
        />
      </div>

      {/* Timestamp de última actualización */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-xs text-muted-foreground text-center">
          Última actualización: {new Date().toLocaleTimeString('es-AR')}
        </p>
      </div>
    </div>
  )
}

// Badge inline para mostrar en headers/navbars
export function ConnectionBadge({ 
  isConnected,
  label = "Online"
}: { 
  isConnected: boolean;
  label?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        isConnected 
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
          : "bg-rose-50 text-rose-600 border border-rose-200"
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        isConnected ? "bg-emerald-500" : "bg-rose-500"
      )} />
      {label}
    </motion.div>
  )
}

// Indicador de actividad en tiempo real (typing, sending, etc)
export function ActivityIndicator({ 
  type,
  label 
}: { 
  type: 'typing' | 'sending' | 'receiving' | 'processing';
  label?: string;
}) {
  const configs = {
    typing: { icon: MessageCircle, text: 'Escribiendo...', color: 'text-slate-500' },
    sending: { icon: Loader2, text: 'Enviando...', color: 'text-cyan-500' },
    receiving: { icon: Wifi, text: 'Recibiendo...', color: 'text-emerald-500' },
    processing: { icon: Server, text: 'Procesando...', color: 'text-amber-500' },
  }

  const config = configs[type]
  const Icon = config.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        className="flex items-center gap-2"
      >
        <Icon className={cn(
          "w-4 h-4",
          config.color,
          type !== 'typing' && "animate-spin"
        )} />
        <span className={cn("text-sm", config.color)}>
          {label || config.text}
        </span>
        {type === 'typing' && (
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1 h-1 bg-slate-400 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
              />
            ))}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
