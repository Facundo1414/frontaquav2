import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { SimpleTooltip } from "@/components/ui/tooltip"
import { ArrowRight, Play } from "lucide-react"

interface ServiceCardProps {
  icon: React.ReactNode
  title: string
  description?: string
  onClick: () => void
  color: string
  badge?: string
  disabled?: boolean
  /** Texto informativo que aparece al hacer hover */
  tooltip?: string
  /** Muestra un banner para continuar un proceso pendiente */
  pendingAction?: {
    label: string // ej: "Continuar proceso" o "3 mensajes pendientes"
    onClick?: () => void // Si no se provee, usa onClick principal
  }
}

// Mapeo de colores por categoría funcional
// 🔔 Comunicación/WhatsApp → Cyan/Teal
// 📊 Datos/Gestión → Slate/Indigo
// 🛠️ Utilidades → Amber/Neutral
// ⚙️ Admin → Slate oscuro
const colorMapping: Record<string, string> = {
  // Comunicación/WhatsApp - Cyan/Teal
  'bg-teal-500': 'bg-gradient-to-br from-cyan-600 to-teal-600',      // Enviar Comprobantes
  'bg-orange-500': 'bg-gradient-to-br from-cyan-500 to-cyan-600',    // Notificar Próximos (también es comunicación)
  'bg-green-500': 'bg-gradient-to-br from-teal-500 to-emerald-600',  // Conversaciones WhatsApp
  
  // Datos/Gestión - Slate/Indigo
  'bg-green-600': 'bg-gradient-to-br from-slate-600 to-slate-700',   // Filtrar Clientes PYSE
  'bg-blue-600': 'bg-gradient-to-br from-indigo-600 to-slate-700',   // Verificar Planes
  'bg-purple-500': 'bg-gradient-to-br from-slate-700 to-indigo-700', // Base de Clientes
  
  // Utilidades - Amber/Warm
  'bg-amber-500': 'bg-gradient-to-br from-amber-500 to-orange-500',  // Recuperar Archivos
  'bg-blue-500': 'bg-gradient-to-br from-slate-500 to-slate-600',    // Preguntas Frecuentes
  
  // Admin - Slate oscuro premium
  'bg-gradient-to-r from-blue-600 to-purple-600': 'bg-gradient-to-br from-slate-800 to-slate-900',
}

export function ServiceCard({
  icon,
  title,
  description,
  onClick,
  color,
  badge,
  disabled = false,
  tooltip,
  pendingAction,
}: ServiceCardProps) {
  // Determinar el color del badge según el contenido
  const badgeColor = badge?.includes('SIN LEER') 
    ? 'bg-rose-500 text-white' 
    : badge === 'ADMIN'
    ? 'bg-slate-900 text-white border border-slate-600'
    : badge === 'NUEVO'
    ? 'bg-white text-slate-700 shadow-md'
    : 'bg-amber-400 text-slate-800';

  // Aplicar mapeo de colores o usar el original si no está mapeado
  const mappedColor = colorMapping[color] || color;

  const cardContent = (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -4 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`h-full ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card
        onClick={disabled ? undefined : onClick}
        className={`relative grid grid-rows-[auto_auto_1fr] gap-0 items-center justify-items-center text-center px-5 py-8 text-white ${mappedColor} transition-all duration-300 shadow-card hover:shadow-card-hover ${pendingAction ? 'h-[190px]' : 'h-[160px]'} ${disabled ? 'pointer-events-none' : ''} border-0`}
      >
        {badge && (
          <span className={`absolute -top-2 -right-2 px-2.5 py-1 text-xs font-semibold rounded-full ${badgeColor} ${badge.includes('SIN LEER') ? 'animate-pulse' : ''}`}>
            {badge}
          </span>
        )}
        <div className="flex items-center justify-center p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">{icon}</div>
        <h3 className="text-base font-semibold mt-3 text-center w-full leading-tight">{title}</h3>
        {description ? (
          <p className="text-sm opacity-85 leading-tight text-center w-full mt-1 self-start font-light">{description}</p>
        ) : (
          <div></div>
        )}
        
        {/* Banner de acción pendiente */}
        {pendingAction && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => {
              e.stopPropagation()
              pendingAction.onClick?.() || onClick()
            }}
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 py-2 bg-white/95 text-slate-700 text-sm font-medium rounded-b-lg hover:bg-white transition-colors group"
          >
            <Play className="w-3.5 h-3.5 text-cyan-600" />
            <span>{pendingAction.label}</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-600 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        )}
      </Card>
    </motion.div>
  )

  // Si tiene tooltip, envolver en SimpleTooltip
  if (tooltip) {
    return (
      <SimpleTooltip content={tooltip} side="top" delayDuration={300}>
        {cardContent}
      </SimpleTooltip>
    )
  }

  return cardContent
}