'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Calendar, Users, Loader2, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CuentaProcesada {
  uf: number
  titular: string
  barrio: string
  domicilio: string
  fechaProcesamiento: string
  estado: 'pendiente' | 'notificado'
}

export default function PasoDNotificacionesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [cuentas, setCuentas] = useState<CuentaProcesada[]>([])
  const [selectedCuentas, setSelectedCuentas] = useState<Set<number>>(new Set())
  const [fechaFiltro, setFechaFiltro] = useState<string>('')

  useEffect(() => {
    // TODO: Cargar cuentas procesadas desde el backend
    // Por ahora muestra datos de ejemplo
    const ejemploCuentas: CuentaProcesada[] = [
      {
        uf: 123456,
        titular: 'Juan Pérez',
        barrio: 'Centro',
        domicilio: 'Av. Colón 123',
        fechaProcesamiento: '2025-10-25',
        estado: 'pendiente',
      },
      {
        uf: 789012,
        titular: 'María García',
        barrio: 'Nueva Córdoba',
        domicilio: 'Bv. Illia 456',
        fechaProcesamiento: '2025-10-26',
        estado: 'pendiente',
      },
    ]
    setCuentas(ejemploCuentas)
  }, [])

  const handleSelectAll = () => {
    if (selectedCuentas.size === cuentas.length) {
      setSelectedCuentas(new Set())
    } else {
      setSelectedCuentas(new Set(cuentas.map((c) => c.uf)))
    }
  }

  const handleToggleCuenta = (uf: number) => {
    const newSelected = new Set(selectedCuentas)
    if (newSelected.has(uf)) {
      newSelected.delete(uf)
    } else {
      newSelected.add(uf)
    }
    setSelectedCuentas(newSelected)
  }

  const handleEnviarNotificaciones = async () => {
    if (selectedCuentas.size === 0) {
      alert('Selecciona al menos una cuenta')
      return
    }

    setLoading(true)
    try {
      // TODO: Implementar llamada al backend para enviar notificaciones
      await new Promise((resolve) => setTimeout(resolve, 2000))
      alert(`✅ Notificaciones enviadas a ${selectedCuentas.size} cuentas`)
      setSelectedCuentas(new Set())
    } catch (error) {
      alert('❌ Error al enviar notificaciones')
    } finally {
      setLoading(false)
    }
  }

  const cuentasFiltradas = fechaFiltro
    ? cuentas.filter((c) => c.fechaProcesamiento === fechaFiltro)
    : cuentas

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/home')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>
        
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Paso D: Notificaciones Post-Visita</h1>
            <p className="text-muted-foreground">
              Envía recordatorios a clientes que fueron procesados por PYSE
            </p>
          </div>
        </div>
      </div>

      {/* Banner informativo */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              📋 Cuentas procesadas para PYSE
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Estas son las cuentas que fueron clasificadas como &quot;APTAS&quot; en el sistema de Filtrado para PYSE. 
              Envía notificaciones recordatorias sobre sus planes de pago.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y acciones */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Filtrar por fecha de procesamiento
              </label>
              <input
                type="date"
                value={fechaFiltro}
                onChange={(e) => setFechaFiltro(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSelectAll}
                className="whitespace-nowrap"
              >
                {selectedCuentas.size === cuentas.length
                  ? 'Deseleccionar todo'
                  : 'Seleccionar todo'}
              </Button>
              
              <Button
                onClick={handleEnviarNotificaciones}
                disabled={loading || selectedCuentas.size === 0}
                className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    Enviar notificaciones ({selectedCuentas.size})
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de cuentas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <p className="text-2xl font-bold">{cuentasFiltradas.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Seleccionadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <p className="text-2xl font-bold">{selectedCuentas.size}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <p className="text-2xl font-bold">
                {cuentasFiltradas.filter((c) => c.estado === 'pendiente').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de cuentas */}
      <Card>
        <CardHeader>
          <CardTitle>Cuentas Procesadas</CardTitle>
        </CardHeader>
        <CardContent>
          {cuentasFiltradas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay cuentas procesadas</p>
              <p className="text-sm mt-2">
                Usa el sistema de Filtrado para PYSE para procesar cuentas primero
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">
                      <input
                        type="checkbox"
                        checked={selectedCuentas.size === cuentasFiltradas.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="text-left p-3">UF</th>
                    <th className="text-left p-3">Titular</th>
                    <th className="text-left p-3">Barrio</th>
                    <th className="text-left p-3">Domicilio</th>
                    <th className="text-left p-3">Fecha Procesamiento</th>
                    <th className="text-left p-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentasFiltradas.map((cuenta) => (
                    <tr key={cuenta.uf} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedCuentas.has(cuenta.uf)}
                          onChange={() => handleToggleCuenta(cuenta.uf)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="p-3 font-mono">{cuenta.uf}</td>
                      <td className="p-3">{cuenta.titular}</td>
                      <td className="p-3">{cuenta.barrio}</td>
                      <td className="p-3">{cuenta.domicilio}</td>
                      <td className="p-3">{cuenta.fechaProcesamiento}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            cuenta.estado === 'notificado'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {cuenta.estado === 'notificado' ? '✓ Notificado' : '⏳ Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
