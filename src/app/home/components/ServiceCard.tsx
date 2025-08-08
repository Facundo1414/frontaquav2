import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

export function ServiceCard({
  icon,
  title,
  onClick,
  color,
}: {
  icon: React.ReactNode
  title: string
  onClick: () => void
  color: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer"
    >
      <Card
        onClick={onClick}
        className={`flex items-center space-x-4 p-4 text-white ${color} transition-all duration-200 hover:shadow-lg`}
      >
        <div>{icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </Card>
    </motion.div>
  )
}