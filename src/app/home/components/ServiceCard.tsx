import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

export function ServiceCard({
  icon,
  title,
  onClick,
  color,
  badge,
}: {
  icon: React.ReactNode
  title: string
  onClick: () => void
  color: string
  badge?: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer"
    >
      <Card
        onClick={onClick}
        className={`relative flex items-center space-x-4 p-4 text-white ${color} transition-all duration-200 hover:shadow-lg`}
      >
        {badge && (
          <span className="absolute -top-2 -right-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-md animate-pulse">
            {badge}
          </span>
        )}
        <div>{icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </Card>
    </motion.div>
  )
}