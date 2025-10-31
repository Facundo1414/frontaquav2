'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Map, Search, CheckCircle2, Info, Square, CheckSquare, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"

export interface FiltrosBarrios {
  barrios: string[]
  limitesPorBarrio?: Record<string, number>
  offsetsPorBarrio?: Record<string, number> // Nuevo: para paginación
  minComprobantesVencidos?: number
  maxComprobantesVencidos?: number
  minDeuda?: number
  maxDeuda?: number
}

interface NeighborhoodWithCount {
  neighborhood: string
  accountCount: number
}

interface StepSeleccionarBarriosProps {
  neighborhoods: string[] // Deprecated: usar neighborhoodsWithCount
  neighborhoodsWithCount?: NeighborhoodWithCount[] // Nuevo: con conteo
  onSelect: (filtros: FiltrosBarrios) => void
}

export function StepSeleccionarBarrios({ neighborhoods, neighborhoodsWithCount, onSelect }: StepSeleccionarBarriosProps) {
  const [selectedBarrios, setSelectedBarrios] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showFiltros, setShowFiltros] = useState(false)
  
  // Filtros opcionales
  const [limitesPorBarrio, setLimitesPorBarrio] = useState<Record<string, number>>({})
  const [offsetsPorBarrio, setOffsetsPorBarrio] = useState<Record<string, number>>({}) // Nuevo
  const [minComprobantes, setMinComprobantes] = useState<number>(3)
  const [maxComprobantes, setMaxComprobantes] = useState<number | undefined>(undefined)
  const [minDeuda, setMinDeuda] = useState<number | undefined>(undefined)
  const [maxDeuda, setMaxDeuda] = useState<number | undefined>(undefined)

  // Usar neighborhoodsWithCount si está disponible, sino fallback a neighborhoods
  const barriosData = neighborhoodsWithCount || neighborhoods.map(n => ({ neighborhood: n, accountCount: 0 }))
  
  const filteredNeighborhoods = barriosData.filter(barrio =>
    barrio.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleBarrio = (barrio: string) => {
    setSelectedBarrios(prev =>
      prev.includes(barrio)
        ? prev.filter(b => b !== barrio)
        : [...prev, barrio]
    )
  }

  const handleSelectAll = () => {
    if (selectedBarrios.length === filteredNeighborhoods.length) {
      setSelectedBarrios([])
    } else {
      setSelectedBarrios(filteredNeighborhoods.map(b => b.neighborhood))
    }
  }

  const handleContinue = () => {
    if (selectedBarrios.length === 0) {
      toast.error('Debe seleccionar al menos un barrio')
      return
    }

    // Construir objeto de filtros
    const filtros: FiltrosBarrios = {
      barrios: selectedBarrios,
    }

    // Agregar filtros opcionales solo si fueron configurados
    if (Object.keys(limitesPorBarrio).length > 0) {
      filtros.limitesPorBarrio = limitesPorBarrio
    }
    if (Object.keys(offsetsPorBarrio).length > 0) {
      filtros.offsetsPorBarrio = offsetsPorBarrio // Nuevo
    }
    if (minComprobantes && minComprobantes > 0) {
      filtros.minComprobantesVencidos = minComprobantes
    }
    if (maxComprobantes && maxComprobantes > 0) {
      filtros.maxComprobantesVencidos = maxComprobantes
    }
    if (minDeuda && minDeuda > 0) {
      filtros.minDeuda = minDeuda
    }
    if (maxDeuda && maxDeuda > 0) {
      filtros.maxDeuda = maxDeuda
    }

    onSelect(filtros)
  }

  const handleLimiteBarrioChange = (barrio: string, value: string) => {
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue > 0) {
      setLimitesPorBarrio(prev => ({ ...prev, [barrio]: numValue }))
    } else {
      const newLimites = { ...limitesPorBarrio }
      delete newLimites[barrio]
      setLimitesPorBarrio(newLimites)
    }
  }

  const handleOffsetBarrioChange = (barrio: string, value: string) => {
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue >= 0) {
      setOffsetsPorBarrio(prev => ({ ...prev, [barrio]: numValue }))
    } else {
      const newOffsets = { ...offsetsPorBarrio }
      delete newOffsets[barrio]
      setOffsetsPorBarrio(newOffsets)
    }
  }

  const countActiveFiltros = () => {
    let count = 0
    if (Object.keys(limitesPorBarrio).length > 0) count++
    if (Object.keys(offsetsPorBarrio).length > 0) count++ // Nuevo
    if (minComprobantes > 3) count++
    if (maxComprobantes) count++
    if (minDeuda) count++
    if (maxDeuda) count++
    return count
  }

  const limpiarFiltros = () => {
    setLimitesPorBarrio({})
    setOffsetsPorBarrio({}) // Nuevo
    setMinComprobantes(3)
    setMaxComprobantes(undefined)
    setMinDeuda(undefined)
    setMaxDeuda(undefined)
    toast.success('Filtros limpiados')
  }

  return (
    <div className="space-y-6">
      {/* Explicación del Paso */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Map className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-purple-900 mb-3">
                🏘️ Paso 2: Elige qué Barrios Procesar Hoy
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-purple-800">
                  <strong>💡 Importante:</strong> Ya NO necesitas procesar todo de una vez. 
                  Selecciona solo los barrios que quieres verificar <strong>HOY</strong>.
                </p>
                
                <div className="mt-3 p-3 bg-white border-2 border-purple-200 rounded-lg">
                  <p className="text-sm font-medium text-purple-900 mb-2">
                    📊 <strong>Recomendación diaria:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-purple-800 ml-2">
                    <li>Procesa <strong>~300 cuentas por día</strong> para no saturar Aguas Cordobesas</li>
                    <li>Mañana vuelves aquí y eliges OTROS barrios</li>
                    <li>Tu archivo YA está guardado, no lo vuelvas a subir</li>
                    <li>Máximo: 2000 peticiones por hora (protección automática)</li>
                  </ul>
                </div>

                <div className="mt-3 p-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
                  <p className="text-sm text-amber-900">
                    <strong>🎯 Ejemplo:</strong> Si tienes 20 barrios con 1000 cuentas en total, 
                    procesa 5 barrios hoy, 5 mañana, etc. hasta completar todos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Barrios Disponibles</p>
            <p className="text-2xl font-bold text-blue-600">{neighborhoods.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Barrios Filtrados</p>
            <p className="text-2xl font-bold text-green-600">{filteredNeighborhoods.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Seleccionados</p>
            <p className="text-2xl font-bold text-purple-600">{selectedBarrios.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Select All */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar barrio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={handleSelectAll}
        >
          {selectedBarrios.length === filteredNeighborhoods.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
        </Button>
      </div>

      {/* Neighborhoods List */}
      <Card>
        <CardContent className="p-4">
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {filteredNeighborhoods.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron barrios
              </div>
            ) : (
              filteredNeighborhoods.map((barrioData) => {
                const barrio = barrioData.neighborhood
                const totalCuentas = barrioData.accountCount
                const offset = offsetsPorBarrio[barrio] || 0
                const limite = limitesPorBarrio[barrio] || 0
                const cuentasRestantes = totalCuentas - offset
                const cuentasAProcesar = limite > 0 ? Math.min(limite, cuentasRestantes) : cuentasRestantes

                return (
                  <div key={barrio} className="space-y-2">
                    <div
                      className={`
                        flex items-center space-x-3 p-3 rounded-lg border cursor-pointer
                        transition-colors hover:bg-gray-50
                        ${selectedBarrios.includes(barrio) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
                      `}
                      onClick={() => handleToggleBarrio(barrio)}
                    >
                      {selectedBarrios.includes(barrio) ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Map className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{barrio}</span>
                          {totalCuentas > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {totalCuentas.toLocaleString()} cuentas
                            </Badge>
                          )}
                        </div>
                        {selectedBarrios.includes(barrio) && (
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>

                    {/* Controles de límite y offset (opcional) */}
                    {selectedBarrios.includes(barrio) && (
                      <div className="ml-11 p-3 bg-gray-50 rounded border border-gray-200 space-y-3">
                        {/* Info de paginación */}
                        {totalCuentas > 0 && (
                          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                            <p className="font-medium text-blue-900">
                              📊 {offset > 0 
                                ? `Saltando primeras ${offset.toLocaleString()} → Procesando ${cuentasAProcesar.toLocaleString()} de ${cuentasRestantes.toLocaleString()} restantes`
                                : `Total disponible: ${totalCuentas.toLocaleString()} cuentas`
                              }
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          {/* Offset */}
                          <div>
                            <Label htmlFor={`offset-${barrio}`} className="text-xs text-gray-600">
                              Saltar primeras (offset):
                            </Label>
                            <Input
                              id={`offset-${barrio}`}
                              type="number"
                              placeholder="0"
                              value={offsetsPorBarrio[barrio] || ''}
                              onChange={(e) => handleOffsetBarrioChange(barrio, e.target.value)}
                              className="mt-1 h-8 text-sm"
                              min="0"
                              max={totalCuentas}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              💡 Hoy: 0, Mañana: {limite || 100}
                            </p>
                          </div>

                          {/* Límite */}
                          <div>
                            <Label htmlFor={`limite-${barrio}`} className="text-xs text-gray-600">
                              Procesar máximo:
                            </Label>
                            <Input
                              id={`limite-${barrio}`}
                              type="number"
                              placeholder="Todas"
                              value={limitesPorBarrio[barrio] || ''}
                              onChange={(e) => handleLimiteBarrioChange(barrio, e.target.value)}
                              className="mt-1 h-8 text-sm"
                              min="1"
                              max={cuentasRestantes}
                            />
                          </div>
                        </div>

                        {/* Botones rápidos */}
                        {totalCuentas > 100 && (
                          <div className="flex gap-1 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                setLimitesPorBarrio(prev => ({ ...prev, [barrio]: 100 }))
                              }}
                            >
                              100
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                setLimitesPorBarrio(prev => ({ ...prev, [barrio]: 200 }))
                              }}
                            >
                              200
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                setLimitesPorBarrio(prev => ({ ...prev, [barrio]: 300 }))
                              }}
                            >
                              300
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtros Avanzados (Opcionales) */}
      <Card className="border-2 border-purple-200">
        <CardContent className="p-4">
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="h-5 w-5 text-purple-600" />
              <h3 className="font-medium text-purple-900">Filtros Avanzados (Opcionales)</h3>
              {countActiveFiltros() > 0 && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {countActiveFiltros()} activos
                </Badge>
              )}
            </div>
            {showFiltros ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {showFiltros && (
            <div className="mt-4 space-y-6">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800">
                  💡 <strong>Estos filtros son opcionales.</strong> Si no los configuras, se procesarán 
                  todas las cuentas de los barrios seleccionados sin restricciones.
                </p>
              </div>

              {/* Comprobantes Vencidos */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center space-x-2">
                  <span>📈 Comprobantes Vencidos</span>
                </Label>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mínimo:</span>
                    <span className="text-sm font-medium text-purple-600">{minComprobantes}</span>
                  </div>
                  <Slider
                    value={[minComprobantes]}
                    onValueChange={(value) => setMinComprobantes(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Solo se procesarán cuentas con al menos {minComprobantes} comprobante{minComprobantes !== 1 ? 's' : ''} vencido{minComprobantes !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <Label htmlFor="maxComprobantes" className="text-sm text-gray-600">
                      Máximo (opcional):
                    </Label>
                    <Input
                      id="maxComprobantes"
                      type="number"
                      placeholder="Sin límite"
                      value={maxComprobantes || ''}
                      onChange={(e) => setMaxComprobantes(e.target.value ? parseInt(e.target.value) : undefined)}
                      min={minComprobantes}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Rango de Deuda */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center space-x-2">
                  <span>💰 Rango de Deuda (opcional)</span>
                </Label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="minDeuda" className="text-sm text-gray-600">
                      Deuda Mínima $:
                    </Label>
                    <Input
                      id="minDeuda"
                      type="number"
                      placeholder="Sin mínimo"
                      value={minDeuda || ''}
                      onChange={(e) => setMinDeuda(e.target.value ? parseInt(e.target.value) : undefined)}
                      min="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDeuda" className="text-sm text-gray-600">
                      Deuda Máxima $:
                    </Label>
                    <Input
                      id="maxDeuda"
                      type="number"
                      placeholder="Sin máximo"
                      value={maxDeuda || ''}
                      onChange={(e) => setMaxDeuda(e.target.value ? parseInt(e.target.value) : undefined)}
                      min={minDeuda || 0}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Botón Limpiar Filtros */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={limpiarFiltros}
                  disabled={countActiveFiltros() === 0}
                >
                  🧹 Limpiar Filtros
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={selectedBarrios.length === 0}
          size="lg"
          className="w-full sm:w-auto"
        >
          Continuar con {selectedBarrios.length} barrio{selectedBarrios.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  )
}
