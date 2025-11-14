'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { 
  Filter, 
  X, 
  MapPin, 
  DollarSign, 
  FileText,
  Plus,
  Info,
  HelpCircle
} from "lucide-react"

export interface FiltrosData {
  minComprobantesVencidos?: number
  maxComprobantesVencidos?: number
  neighborhoods?: string[]
  maxPerNeighborhood?: Record<string, number>
  minDebt?: number
  maxDebt?: number
}

interface FiltrosAvanzadosProps {
  filtros: FiltrosData
  barriosDisponibles: { nombre: string; cantidad: number }[]
  onChange: (filtros: FiltrosData) => void
  onApply: () => void
  onCancel: () => void
}

export function FiltrosAvanzados({ 
  filtros, 
  barriosDisponibles,
  onChange, 
  onApply,
  onCancel
}: FiltrosAvanzadosProps) {
  
  const [localFiltros, setLocalFiltros] = useState<FiltrosData>(filtros)
  const [selectedBarrios, setSelectedBarrios] = useState<string[]>(filtros.neighborhoods || [])
  const [limitesPorBarrio, setLimitesPorBarrio] = useState<Record<string, number>>(
    filtros.maxPerNeighborhood || {}
  )

  // Actualizar filtros cuando cambie el estado local
  useEffect(() => {
    onChange({
      ...localFiltros,
      neighborhoods: selectedBarrios.length > 0 ? selectedBarrios : undefined,
      maxPerNeighborhood: Object.keys(limitesPorBarrio).length > 0 ? limitesPorBarrio : undefined
    })
  }, [localFiltros, selectedBarrios, limitesPorBarrio])

  const handleMinComprobantesChange = (value: number[]) => {
    setLocalFiltros(prev => ({ ...prev, minComprobantesVencidos: value[0] }))
  }

  const handleMaxComprobantesChange = (value: string) => {
    const num = parseInt(value)
    setLocalFiltros(prev => ({ 
      ...prev, 
      maxComprobantesVencidos: isNaN(num) ? undefined : num 
    }))
  }

  const handleMinDebtChange = (value: string) => {
    const num = parseFloat(value)
    setLocalFiltros(prev => ({ 
      ...prev, 
      minDebt: isNaN(num) ? undefined : num 
    }))
  }

  const handleMaxDebtChange = (value: string) => {
    const num = parseFloat(value)
    setLocalFiltros(prev => ({ 
      ...prev, 
      maxDebt: isNaN(num) ? undefined : num 
    }))
  }

  const toggleBarrio = (barrio: string) => {
    setSelectedBarrios(prev => {
      if (prev.includes(barrio)) {
        // Remover barrio
        const newBarrios = prev.filter(b => b !== barrio)
        // Remover límite del barrio
        setLimitesPorBarrio(prevLimites => {
          const newLimites = { ...prevLimites }
          delete newLimites[barrio]
          return newLimites
        })
        return newBarrios
      } else {
        // Agregar barrio
        return [...prev, barrio]
      }
    })
  }

  const updateLimiteBarrio = (barrio: string, limite: string) => {
    const num = parseInt(limite)
    if (!isNaN(num) && num > 0) {
      setLimitesPorBarrio(prev => ({ ...prev, [barrio]: num }))
    } else {
      setLimitesPorBarrio(prev => {
        const newLimites = { ...prev }
        delete newLimites[barrio]
        return newLimites
      })
    }
  }

  const limpiarFiltros = () => {
    setLocalFiltros({
      minComprobantesVencidos: 3
    })
    setSelectedBarrios([])
    setLimitesPorBarrio({})
  }

  const cantidadFiltrosActivos = () => {
    let count = 0
    if (localFiltros.minComprobantesVencidos && localFiltros.minComprobantesVencidos > 1) count++
    if (localFiltros.maxComprobantesVencidos) count++
    if (selectedBarrios.length > 0) count++
    if (localFiltros.minDebt) count++
    if (localFiltros.maxDebt) count++
    return count
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Filter className="h-6 w-6 mr-2 text-blue-600" />
            Filtros Avanzados de PYSE
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configura los criterios para seleccionar clientes aptos para corte o gestión
          </p>
        </div>
        {cantidadFiltrosActivos() > 0 && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {cantidadFiltrosActivos()} filtro{cantidadFiltrosActivos() !== 1 ? 's' : ''} activo{cantidadFiltrosActivos() !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">💡 Guía rápida de filtros</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Comprobantes vencidos:</strong> Cantidad de facturas sin pagar (típicamente 3+ para corte)</li>
              <li>• <strong>Barrios:</strong> Limita el procesamiento a zonas específicas (útil para rutas)</li>
              <li>• <strong>Deuda:</strong> Filtra por montos para priorizar casos según política de cobranza</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filtro: Comprobantes Vencidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <FileText className="h-5 w-5 mr-2 text-orange-600" />
            Comprobantes Vencidos
            <div className="ml-2 group relative">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="hidden group-hover:block absolute left-0 top-6 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                Define cuántas facturas sin pagar debe tener un cliente para ser incluido en el filtrado.
                <br/><br/>
                <strong>Ejemplos comunes:</strong><br/>
                • 3+ facturas: Clientes para corte de servicio<br/>
                • 1-2 facturas: Recordatorios tempranos
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mínimo (Slider) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="min-comprobantes" className="text-sm font-medium">
                Mínimo de comprobantes vencidos
              </Label>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 font-bold">
                {localFiltros.minComprobantesVencidos || 1}
              </Badge>
            </div>
            <Slider
              id="min-comprobantes"
              min={1}
              max={10}
              step={1}
              value={[localFiltros.minComprobantesVencidos || 3]}
              onValueChange={handleMinComprobantesChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 (más inclusivo)</span>
              <span>5 (recomendado)</span>
              <span>10 (más restrictivo)</span>
            </div>
            {(localFiltros.minComprobantesVencidos || 3) >= 3 && (
              <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-700">
                ✅ Configuración típica para acciones de corte de servicio
              </div>
            )}
          </div>

          {/* Máximo (Input) */}
          <div className="space-y-2">
            <Label htmlFor="max-comprobantes" className="text-sm font-medium">
              Máximo de comprobantes vencidos (opcional)
            </Label>
            <Input
              id="max-comprobantes"
              type="number"
              min={localFiltros.minComprobantesVencidos || 1}
              placeholder="Ej: 20 (dejar vacío para sin límite)"
              value={localFiltros.maxComprobantesVencidos || ''}
              onChange={(e) => handleMaxComprobantesChange(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              💡 Útil para excluir clientes con deudas muy antiguas que requieren gestión especial
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filtro: Barrios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            Selección de Barrios
            {selectedBarrios.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                {selectedBarrios.length} seleccionado{selectedBarrios.length !== 1 ? 's' : ''}
              </Badge>
            )}
            <div className="ml-2 group relative">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="hidden group-hover:block absolute left-0 top-6 z-50 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                Filtra por ubicación geográfica para optimizar rutas de visitas.
                <br/><br/>
                <strong>Límite por barrio:</strong> Define cuántos clientes procesar máximo por zona (útil para trabajo diario progresivo).
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-900">
              💡 <strong>Tip:</strong> Trabaja por zonas para optimizar rutas. Puedes procesar 100 clientes de "Centro" hoy (límite: 100), 
              y mañana continuar con otros 100 usando offset.
            </p>
          </div>

          {/* Lista de barrios con checkboxes */}
          <div className="max-h-80 overflow-y-auto space-y-2 border rounded-lg p-4">
            {barriosDisponibles.map((barrio, index) => {
              const isSelected = selectedBarrios.includes(barrio.nombre)
              
              return (
                <div 
                  key={index} 
                  className={`
                    p-3 rounded-lg border-2 transition-all cursor-pointer
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                  onClick={() => toggleBarrio(barrio.nombre)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleBarrio(barrio.nombre)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{barrio.nombre}</p>
                        <p className="text-xs text-gray-500">{barrio.cantidad} clientes</p>
                      </div>
                    </div>
                    
                    {/* Input de límite solo si está seleccionado */}
                    {isSelected && (
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Label className="text-xs text-gray-600 whitespace-nowrap">
                          Límite:
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          max={barrio.cantidad}
                          placeholder={barrio.cantidad.toString()}
                          value={limitesPorBarrio[barrio.nombre] || ''}
                          onChange={(e) => updateLimiteBarrio(barrio.nombre, e.target.value)}
                          className="w-20 h-8 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {selectedBarrios.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900 font-medium mb-2">
                Barrios seleccionados:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedBarrios.map((barrio, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-white text-blue-700 border-blue-300"
                  >
                    {barrio}
                    {limitesPorBarrio[barrio] && (
                      <span className="ml-1 text-blue-500">
                        (máx {limitesPorBarrio[barrio]})
                      </span>
                    )}
                    <button
                      onClick={() => toggleBarrio(barrio)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtro: Rango de Deuda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Rango de Deuda
            <div className="ml-2 group relative">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="hidden group-hover:block absolute left-0 top-6 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                Prioriza clientes según el monto adeudado.
                <br/><br/>
                <strong>Ejemplos:</strong><br/>
                • $2000-$10000: Rango típico para gestión<br/>
                • $10000+: Deudas prioritarias
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Filtra clientes por el monto total de deuda estimado
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-debt" className="text-sm font-medium">
                Deuda mínima ($)
              </Label>
              <Input
                id="min-debt"
                type="number"
                min={0}
                placeholder="Ej: 2000"
                value={localFiltros.minDebt || ''}
                onChange={(e) => handleMinDebtChange(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Clientes con menos deuda serán excluidos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-debt" className="text-sm font-medium">
                Deuda máxima ($)
              </Label>
              <Input
                id="max-debt"
                type="number"
                min={localFiltros.minDebt || 0}
                placeholder="Ej: 10000"
                value={localFiltros.maxDebt || ''}
                onChange={(e) => handleMaxDebtChange(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Clientes con más deuda serán excluidos
              </p>
            </div>
          </div>

          {!localFiltros.minDebt && !localFiltros.maxDebt && (
            <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-600">
              ℹ️ Sin límites de deuda configurados - se procesarán clientes con cualquier monto
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={limpiarFiltros}
          className="min-w-[150px]"
        >
          <X className="h-4 w-4 mr-2" />
          Limpiar Filtros
        </Button>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="min-w-[120px]"
          >
            Cancelar
          </Button>

          <Button
            onClick={onApply}
            className="min-w-[150px] bg-blue-600 hover:bg-blue-700"
          >
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
        </div>
      </div>
    </div>
  )
}
