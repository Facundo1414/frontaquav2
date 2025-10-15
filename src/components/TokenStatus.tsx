// src/components/TokenStatus.tsx
'use client'

import { useEffect, useState } from 'react'
import { tokenManager } from '@/lib/tokenManager'

export default function TokenStatus() {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [needsRefresh, setNeedsRefresh] = useState(false)

  useEffect(() => {
    const updateStatus = () => {
      const time = tokenManager.getTimeUntilExpiry()
      const needs = tokenManager.needsRefreshSoon()
      
      setTimeLeft(time)
      setNeedsRefresh(needs)
    }

    // Actualizar inmediatamente
    updateStatus()

    // Actualizar cada 30 segundos
    const interval = setInterval(updateStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  if (!timeLeft) {
    return null
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-100 border rounded-lg p-2 text-xs shadow-sm z-50">
      <div className="flex items-center gap-2">
        <div 
          className={`w-2 h-2 rounded-full ${
            needsRefresh ? 'bg-yellow-500' : 'bg-green-500'
          }`}
        />
        <span>
          Token: {formatTime(timeLeft)}
          {needsRefresh && ' (refreshing soon)'}
        </span>
      </div>
    </div>
  )
}