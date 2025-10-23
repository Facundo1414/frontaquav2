'use client'

import { useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'

/**
 * Provider que mantiene la conexión WebSocket activa durante toda la sesión
 * Debe montarse en el root layout para garantizar conexión persistente
 */
export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { socket, connected, reconnecting } = useWebSocket()

  useEffect(() => {
    if (connected) {
      console.log('🌐 WebSocketProvider: Conexión establecida')
    } else if (reconnecting) {
      console.log('🔄 WebSocketProvider: Reconectando...')
    }
  }, [connected, reconnecting])

  // No renderizamos nada visible, solo mantenemos la conexión
  return <>{children}</>
}
