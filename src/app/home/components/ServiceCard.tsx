import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

interface ServiceCardProps {
  icon: React.ReactNode
  title: string
  description?: string
  onClick: () => void
  color: string
  badge?: string
}

export function ServiceCard({
  icon,
  title,
  description,
  onClick,
  color,
  badge,
}: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer h-full"
    >
      <Card
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center text-center p-6 text-white ${color} transition-all duration-200 hover:shadow-lg h-full min-h-[160px]`}
      >
        {badge && (
          <span className="absolute -top-2 -right-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-md animate-pulse">
            {badge}
          </span>
        )}
        <div className="mb-3">{icon}</div>
        <h3 className="text-lg font-bold mb-1">{title}</h3>
        {description && (
          <p className="text-sm opacity-90 leading-snug">{description}</p>
        )}
      </Card>
    </motion.div>
  )
}