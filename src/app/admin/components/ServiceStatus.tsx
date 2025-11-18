'use client'

import { useState, useEffect, useRef } from 'react'
import { adminAPI } from '@/utils/admin-api'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ServiceInfo {
  id: string
  name: string
  status: 'running' | 'stopped' | 'unknown'
  uptime: string
  cpu: number
  memory: number
  restartCount: number
  lastRestart: string | null
}

interface ServiceLog {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  service: string
  message: string
}

export function ServiceStatus() {
  const [services, setServices] = useState<ServiceInfo[]>([])
  const [logs, setLogs] = useState<ServiceLog[]>([])
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [logsLoading, setLogsLoading] = useState(false)
  const [restartDialog, setRestartDialog] = useState<string | null>(null)
  const [restarting, setRestarting] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [logFilter, setLogFilter] = useState<string>('all')
  
  const logsEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Cargar información de servicios
  useEffect(() => {
    loadServicesInfo()

    if (autoRefresh) {
      const interval = setInterval(loadServicesInfo, 20000) // Cada 20 segundos (3 veces por minuto)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Cargar logs cuando se selecciona un servicio
  useEffect(() => {
    if (selectedService) {
      loadLogs(selectedService)
      
      // Conectar a SSE para logs en tiempo real
      connectToLogStream(selectedService)

      return () => {
        disconnectFromLogStream()
      }
    }
  }, [selectedService])

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  const loadServicesInfo = async () => {
    try {
      const response = await adminAPI.services.getAllInfo()
      setServices(response.services || [])
    } catch (err: any) {
      toast.error(`Error al cargar servicios: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadLogs = async (serviceId: string) => {
    setLogsLoading(true)
    try {
      const response = await adminAPI.services.getLogs(serviceId, 100)
      setLogs(response.logs || [])
    } catch (err: any) {
      toast.error(`Error al cargar logs: ${err.message}`)
    } finally {
      setLogsLoading(false)
    }
  }

  const connectToLogStream = (serviceId: string) => {
    disconnectFromLogStream()

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const url = `${apiUrl}/api/admin/services/logs/stream?service=${serviceId}`
    
    const eventSource = new EventSource(url)
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.logs && data.logs.length > 0) {
          setLogs((prev) => {
            const newLogs = [...prev, ...data.logs]
            // Mantener solo los últimos 200 logs
            return newLogs.slice(-200)
          })
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE error:', err)
      disconnectFromLogStream()
    }

    eventSourceRef.current = eventSource
  }

  const disconnectFromLogStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }

  const handleRestart = async (serviceId: string) => {
    if (serviceId === 'backend') {
      toast.error('No se puede reiniciar el backend desde sí mismo')
      return
    }

    setRestarting(true)
    try {
      const response = await adminAPI.services.restart(serviceId)
      
      if (response.success) {
        toast.success(response.message)
        await loadServicesInfo()
      } else {
        toast.warning(response.message)
      }
    } catch (err: any) {
      toast.error(`Error al reiniciar: ${err.message}`)
    } finally {
      setRestarting(false)
      setRestartDialog(null)
    }
  }

  const handleExportLogs = async (serviceId: string) => {
    try {
      const response = await adminAPI.services.exportLogs(serviceId)
      
      // Crear y descargar archivo
      const blob = new Blob([response.logs], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.filename
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('Logs exportados correctamente')
    } catch (err: any) {
      toast.error(`Error al exportar logs: ${err.message}`)
    }
  }

  const handleClearLogs = async (serviceId: string) => {
    try {
      await adminAPI.services.clearLogs(serviceId)
      toast.success('Logs limpiados')
      await loadLogs(serviceId)
    } catch (err: any) {
      toast.error(`Error al limpiar logs: ${err.message}`)
    }
  }

  const getStatusBadge = (status: ServiceInfo['status']) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-600">✅ Running</Badge>
      case 'stopped':
        return <Badge className="bg-red-600">❌ Stopped</Badge>
      default:
        return <Badge className="bg-gray-600">❓ Unknown</Badge>
    }
  }

  const getLogLevelColor = (level: ServiceLog['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-500'
      case 'warn':
        return 'text-yellow-500'
      case 'info':
        return 'text-blue-500'
      case 'debug':
        return 'text-gray-500'
      default:
        return 'text-gray-400'
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'all') return true
    return log.level === logFilter
  })

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-600"></div>
          <span className="text-gray-600">Cargando servicios...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              🖥️ Gestión de Servicios
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Monitoreo en tiempo real, logs y restart manual
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? '⏸️ Pausar' : '▶️ Auto-refresh'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadServicesInfo}
            >
              🔄 Actualizar
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid de servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
              selectedService === service.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedService(service.id)}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate">{service.name}</h3>
                {getStatusBadge(service.status)}
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-mono">{service.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span>CPU:</span>
                  <span className="font-mono">{service.cpu}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span className="font-mono">{service.memory} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Restarts:</span>
                  <span className="font-mono">{service.restartCount}</span>
                </div>
              </div>

              {service.id !== 'backend' && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    setRestartDialog(service.id)
                  }}
                >
                  🔄 Restart
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Panel de logs */}
      {selectedService && (
        <Card className="p-6">
          <div className="space-y-4">
            {/* Header de logs */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  📋 Logs: {services.find((s) => s.id === selectedService)?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {filteredLogs.length} entradas (actualización automática)
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Filtro de nivel */}
                <select
                  className="px-3 py-1 border rounded-md text-sm"
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="error">Errors</option>
                  <option value="warn">Warnings</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportLogs(selectedService)}
                >
                  💾 Export
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleClearLogs(selectedService)}
                >
                  🗑️ Clear
                </Button>
              </div>
            </div>

            {/* Terminal de logs */}
            <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
              {logsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No hay logs disponibles
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 hover:bg-gray-800 px-2 py-1 rounded">
                      <span className="text-gray-500 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`shrink-0 font-bold ${getLogLevelColor(log.level)}`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="text-gray-300">{log.message}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Dialog de confirmación de restart */}
      <Dialog open={!!restartDialog} onOpenChange={() => setRestartDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Reinicio</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas reiniciar el servicio{' '}
              <strong>{services.find((s) => s.id === restartDialog)?.name}</strong>?
              <br />
              <br />
              El servicio estará temporalmente no disponible durante el reinicio.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestartDialog(null)}
              disabled={restarting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => restartDialog && handleRestart(restartDialog)}
              disabled={restarting}
            >
              {restarting ? 'Reiniciando...' : '🔄 Reiniciar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
