'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Filter, Users, DollarSign, MapPin, ArrowRight, Loader2, Database } from "lucide-react"
import { getClients } from '@/lib/api/clientsApi'
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/EmptyState"
import { useRouter } from 'next/navigation'
import { getUserFriendlyError } from '@/utils/errorMessages'

interface Client {
  id: string
  unidad: string
  distrito?: string
  zona?: string
  manzana?: string
  parcela?: string
  titular?: string
  phone?: string
  debt?: number
  barrio_inm?: string
  requiresNotification?: boolean
  status?: 'pending' | 'notified' | 'visited' | 'verified'
  processedDate?: string
}

interface StepSeleccionarClientesBDProps {
  onNext: (selectedClients: Client[]) => void
}

export function StepSeleccionarClientesBD({ onNext }: StepSeleccionarClientesBDProps) {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBarrios, setSelectedBarrios] = useState<string[]>([])
  const [phoneFilter, setPhoneFilter] = useState<'all' | 'with' | 'without'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'notified' | 'visited' | 'verified'>('all')
  const [maxClientsPerBarrio, setMaxClientsPerBarrio] = useState<string>('') // Nuevo filtro
  const [barrioRangeStart, setBarrioRangeStart] = useState<string>('') // Nuevo filtro de rango
  const [barrioRangeEnd, setBarrioRangeEnd] = useState<string>('') // Nuevo filtro de rango
  
  // UI
  const [showFilters, setShowFilters] = useState(true)
  const [availableBarrios, setAvailableBarrios] = useState<string[]>([])

  // Cargar clientes al montar
  useEffect(() => {
    loadClients()
  }, [])

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters()
  }, [clients, searchTerm, selectedBarrios, phoneFilter, statusFilter, maxClientsPerBarrio, barrioRangeStart, barrioRangeEnd])

  const loadClients = async () => {
    try {
      setLoading(true)
      setError(null)
      // Pedir TODOS los clientes (limit: 10000 para asegurar que traiga todo)
      const data = await getClients({ limit: 10000 })
      
      console.log('🔍 [filtrar-clientes] Respuesta:', data)
      console.log('🔍 [filtrar-clientes] Total en BD:', data.total)
      
      // El backend puede devolver { clients: [...], total: X } o directamente [...]
      const clientsArray = Array.isArray(data) ? data : (data.clients || data)
      
      console.log('🔍 [filtrar-clientes] Clientes cargados:', clientsArray.length)
      
      setClients(clientsArray)
      
      // Si no hay clientes, mostrar empty state
      if (clientsArray.length === 0) {
        setError('NO_CLIENTS')
        return
      }
      
      // Extraer barrios únicos
      const barrios = Array.from(new Set(
        clientsArray
          .map((c: any) => c.barrio_inm)
          .filter((b: any): b is string => Boolean(b))
      )).sort() as string[]
      setAvailableBarrios(barrios)
    } catch (err: any) {
      console.error('Error al cargar clientes:', err)
      const friendlyMessage = getUserFriendlyError(err)
      setError(friendlyMessage)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...clients]

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(c => {
        const uf = `${c.unidad}-${c.distrito || ''}-${c.zona || ''}-${c.manzana || ''}-${c.parcela || ''}`
        return (
          c.titular?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          uf.includes(searchTerm) ||
          c.barrio_inm?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    // Filtro de barrios
    if (selectedBarrios.length > 0) {
      filtered = filtered.filter(c => c.barrio_inm && selectedBarrios.includes(c.barrio_inm))
    }

    // Filtro de teléfono
    if (phoneFilter === 'with') {
      filtered = filtered.filter(c => c.phone)
    } else if (phoneFilter === 'without') {
      filtered = filtered.filter(c => !c.phone)
    }

    // Filtro de estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    // Limitar cantidad por barrio (tomar primeros N por cada barrio)
    if (maxClientsPerBarrio && parseInt(maxClientsPerBarrio) > 0) {
      const limit = parseInt(maxClientsPerBarrio)
      const barrioMap = new Map<string, Client[]>()
      
      // Agrupar por barrio
      filtered.forEach(client => {
        const barrio = client.barrio_inm || 'Sin barrio'
        if (!barrioMap.has(barrio)) {
          barrioMap.set(barrio, [])
        }
        barrioMap.get(barrio)!.push(client)
      })
      
      // Tomar los primeros N de cada barrio
      filtered = []
      barrioMap.forEach((clients) => {
        filtered.push(...clients.slice(0, limit))
      })
    }

    // Aplicar rango por barrio (desde-hasta)
    if (barrioRangeStart || barrioRangeEnd) {
      const start = barrioRangeStart ? parseInt(barrioRangeStart) : 1
      const end = barrioRangeEnd ? parseInt(barrioRangeEnd) : undefined

      const barrioMap = new Map<string, Client[]>()
      
      // Agrupar por barrio
      filtered.forEach(client => {
        const barrio = client.barrio_inm || 'Sin barrio'
        if (!barrioMap.has(barrio)) {
          barrioMap.set(barrio, [])
        }
        barrioMap.get(barrio)!.push(client)
      })
      
      // Aplicar rango a cada barrio
      filtered = []
      barrioMap.forEach((clients) => {
        // Ordenar por unidad (UF) numéricamente para consistencia
        clients.sort((a, b) => {
          const aNum = parseInt(a.unidad) || 0
          const bNum = parseInt(b.unidad) || 0
          return aNum - bNum
        })
        
        // Calcular rango: desde start, tomar (end - start) elementos
        const rangeStart = Math.max(0, start - 1) // Convertir a 0-based
        const count = end ? Math.max(0, end - start + 1) : clients.length - rangeStart
        const rangeEnd = Math.min(clients.length, rangeStart + count)
        const sliced = clients.slice(rangeStart, rangeEnd)
        filtered.push(...sliced)
      })
    }

    setFilteredClients(filtered)
  }

  const toggleBarrio = (barrio: string) => {
    setSelectedBarrios(prev =>
      prev.includes(barrio)
        ? prev.filter(b => b !== barrio)
        : [...prev, barrio]
    )
  }

  const handleProcesar = () => {
    if (filteredClients.length === 0) {
      alert('No hay clientes que coincidan con los filtros')
      return
    }
    onNext(filteredClients)
  }

  const getStatusBadge = (status?: 'pending' | 'notified' | 'visited' | 'verified') => {
    if (!status) return null
    
    const colors = {
      pending: 'bg-yellow-500',
      notified: 'bg-blue-500',
      visited: 'bg-green-500',
      verified: 'bg-purple-600'
    }
    
    const labels = {
      pending: 'Pendiente',
      notified: 'Notificado',
      visited: 'Visitado',
      verified: 'Verificado'
    }
    
    return (
      <Badge className={`${colors[status] || 'bg-gray-400'} text-white text-xs`}>
        {labels[status] || status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600">Cargando clientes...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    // Empty state especial para cuando no hay clientes en BD
    if (error === 'NO_CLIENTS') {
      return (
        <EmptyState
          icon={Database}
          title="No hay clientes en tu base de datos"
          description="Para usar el filtrado PYSE, primero debes importar tu universo de cuentas desde la sección 'Base de Clientes'"
          action={
            <Button onClick={() => router.push('/clientes-database')} size="lg">
              <Database className="mr-2 h-4 w-4" />
              Ir a Base de Clientes
            </Button>
          }
        />
      )
    }
    
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-red-500 text-center">
              <p className="font-semibold">Error al cargar clientes</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={loadClients} variant="outline">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sección de Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Selección
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent className="space-y-6">
            {/* Búsqueda rápida */}
            <div>
              <Label htmlFor="search" className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4" />
                Búsqueda rápida
              </Label>
              <Input
                id="search"
                placeholder="Buscar por titular, UF o barrio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro de teléfono */}
            <div>
              <Label className="mb-2 block">Filtro de Teléfono</Label>
              <div className="flex gap-2">
                <Button
                  variant={phoneFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPhoneFilter('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={phoneFilter === 'with' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPhoneFilter('with')}
                >
                  Con teléfono
                </Button>
                <Button
                  variant={phoneFilter === 'without' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPhoneFilter('without')}
                >
                  Sin teléfono
                </Button>
              </div>
            </div>

            {/* Filtro de estado */}
            <div>
              <Label className="mb-2 block">Estado de Notificación</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  Pendiente
                </Button>
                <Button
                  variant={statusFilter === 'notified' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('notified')}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Notificado
                </Button>
                <Button
                  variant={statusFilter === 'visited' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('visited')}
                  className="bg-green-500 hover:green-blue-600"
                >
                  Visitado
                </Button>
                <Button
                  variant={statusFilter === 'verified' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('verified')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Verificado
                </Button>
              </div>
            </div>

            {/* Filtro de barrios */}
            {availableBarrios.length > 0 && (
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  Barrios ({selectedBarrios.length} seleccionados)
                </Label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                  {availableBarrios.map(barrio => (
                    <Button
                      key={barrio}
                      variant={selectedBarrios.includes(barrio) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleBarrio(barrio)}
                    >
                      {barrio}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Límite por barrio */}
            {selectedBarrios.length > 0 && (
              <div>
                <Label htmlFor="maxPerBarrio" className="mb-2 block">
                  Límite de clientes por barrio
                </Label>
                <p className="text-xs text-gray-500 mb-2">
                  Si un barrio tiene muchas cuentas, puedes limitar cuántas procesar (ej: primeras 100)
                </p>
                <Input
                  id="maxPerBarrio"
                  type="number"
                  placeholder="Ej: 100 (dejar vacío para todos)"
                  value={maxClientsPerBarrio}
                  onChange={(e) => setMaxClientsPerBarrio(e.target.value)}
                  min="1"
                />
                {maxClientsPerBarrio && parseInt(maxClientsPerBarrio) > 0 && (
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Consejo: Si estas primeras {maxClientsPerBarrio} ya fueron verificadas, 
                    selecciona estado &quot;Pendiente&quot; arriba para obtener las siguientes.
                  </p>
                )}
              </div>
            )}

            {/* Rango por barrio */}
            {selectedBarrios.length > 0 && (
              <div>
                <Label className="mb-2 block">
                  Rango de clientes por barrio
                </Label>
                <p className="text-xs text-gray-500 mb-2">
                  Selecciona un rango específico de clientes por barrio (ej: del 201 al 400 para procesar en lotes)
                </p>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Label htmlFor="rangeStart" className="text-xs text-gray-600">Desde</Label>
                    <Input
                      id="rangeStart"
                      type="number"
                      placeholder="Ej: 201"
                      value={barrioRangeStart}
                      onChange={(e) => setBarrioRangeStart(e.target.value)}
                      min="1"
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-center pt-4">
                    <span className="text-gray-400">—</span>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="rangeEnd" className="text-xs text-gray-600">Hasta</Label>
                    <Input
                      id="rangeEnd"
                      type="number"
                      placeholder="Ej: 400"
                      value={barrioRangeEnd}
                      onChange={(e) => setBarrioRangeEnd(e.target.value)}
                      min="1"
                      className="text-sm"
                    />
                  </div>
                </div>
                {(barrioRangeStart || barrioRangeEnd) && (
                  <p className="text-xs text-green-600 mt-2">
                    📊 Procesando clientes {barrioRangeStart || '1'} a {barrioRangeEnd || 'todos'} de cada barrio seleccionado
                  </p>
                )}
              </div>
            )}

            {/* Botón limpiar filtros */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedBarrios([])
                  setPhoneFilter('all')
                  setStatusFilter('all')
                  setMaxClientsPerBarrio('')
                  setBarrioRangeStart('')
                  setBarrioRangeEnd('')
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Resumen de resultados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clientes Seleccionados: {filteredClients.length.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay clientes que coincidan con los filtros</p>
              <p className="text-sm mt-2">Intenta ajustar los filtros para obtener resultados</p>
            </div>
          ) : (
            <>
              {/* Preview de clientes (primeros 20) */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Vista previa (mostrando {Math.min(20, filteredClients.length)} de {filteredClients.length})
                </p>
                <div className="border rounded-md overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left">UF</th>
                          <th className="px-4 py-2 text-left">Titular</th>
                          <th className="px-4 py-2 text-left">Barrio</th>
                          <th className="px-4 py-2 text-left">Teléfono</th>
                          <th className="px-4 py-2 text-right">Deuda</th>
                          <th className="px-4 py-2 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClients.slice(0, 20).map((client) => (
                          <tr key={client.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2 font-mono text-xs">
                              {client.unidad}
                            </td>
                            <td className="px-4 py-2">{client.titular || '-'}</td>
                            <td className="px-4 py-2">{client.barrio_inm || '-'}</td>
                            <td className="px-4 py-2">
                              {client.phone ? (
                                <span className="text-green-600 font-medium">📱 {client.phone}</span>
                              ) : (
                                <span className="text-gray-400 text-xs">Sin teléfono</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold">
                              {client.debt ? `$${client.debt.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {getStatusBadge(client.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {filteredClients.length > 20 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    + {filteredClients.length - 20} clientes más...
                  </p>
                )}
              </div>

              {/* Botón procesar */}
              <div className="flex justify-end">
                <Button
                  onClick={handleProcesar}
                  size="lg"
                  className="gap-2"
                >
                  Procesar {filteredClients.length} clientes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
