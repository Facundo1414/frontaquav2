import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

interface ServiceCardProps {
  icon: React.ReactNode
  title: string
  description?: string
  onClick: () => void
  color: string
  badge?: string
  disabled?: boolean
}

export function ServiceCard({
  icon,
  title,
  description,
  onClick,
  color,
  badge,
  disabled = false,
}: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`h-full ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <Card
        onClick={disabled ? undefined : onClick}
        className={`relative grid grid-rows-[auto_auto_1fr] gap-0 items-center justify-items-center text-center px-5 py-8 text-white ${color} transition-all duration-200 hover:shadow-lg h-[160px] ${disabled ? 'pointer-events-none' : ''}`}
      >
        {badge && (
          <span className="absolute -top-2 -right-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-md animate-pulse">
            {badge}
          </span>
        )}
        <div className="flex items-center justify-center">{icon}</div>
        <h3 className="text-lg font-bold mt-2 text-center w-full">{title}</h3>
        {description ? (
          <p className="text-sm opacity-90 leading-tight text-center w-full mt-0.5 self-start">{description}</p>
        ) : (
          <div></div>
        )}
      </Card>
    </motion.div>
  )
}