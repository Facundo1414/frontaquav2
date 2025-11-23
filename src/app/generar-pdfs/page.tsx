'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Download, Loader2, ArrowLeft, Search, FileSpreadsheet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getClients } from '@/lib/api'

type TipoPDF = 'instructivo' | 'intimacion' | 'ambos'

interface Cliente {
  id: string
  uf: string
  titular: string
  cliente?: string
  calle_inm?: string
  barrio_inm?: string
  phone?: string
}


export default function GenerarPDFsPage() {
  const router = useRouter()
  const [tipoPDF, setTipoPDF] = useState<TipoPDF>('instructivo')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [selectedClientes, setSelectedClientes] = useState<Set<string>>(new Set())

  // Buscar clientes en la BD
  useEffect(() => {
    const buscarClientes = async () => {
      if (searchTerm.length < 2) {
        setClientes([])
        return
      }

      setLoadingClientes(true)
      try {
        const response = await getClients({ search: searchTerm, limit: 50 })
        setClientes(response.clients)
      } catch (error) {
        console.error('Error buscando clientes:', error)
      } finally {
        setLoadingClientes(false)
      }
    }

    const timeoutId = setTimeout(buscarClientes, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleToggleCliente = (id: string) => {
    const newSelected = new Set(selectedClientes)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedClientes(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedClientes.size === clientes.length) {
      setSelectedClientes(new Set())
    } else {
      setSelectedClientes(new Set(clientes.map((c) => c.id)))
    }
  }

  const handleDescargarPDFs = async () => {
    if (selectedClientes.size === 0) {
      alert('Selecciona al menos un cliente')
      return
    }

    setLoading(true)
    try {
      const clientesSeleccionados = clientes.filter((c) =>
        selectedClientes.has(c.id)
      )

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const token = localStorage.getItem('accessToken')

      // TODO: Implementar endpoint en el backend
      const response = await fetch(`${baseUrl}/process/generate-pdfs-only`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipoPDF,
          ufs: clientesSeleccionados.map(c => ({
            uf: c.uf,
            titular: c.titular || c.cliente || 'Cliente',
          })),
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `PDFs_${tipoPDF}_${new Date().toISOString().split('T')[0]}.xlsx`
        a.click()
        alert(`✅ ${selectedClientes.size} PDFs generados exitosamente`)
        setSelectedClientes(new Set())
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error generando PDFs')
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }


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
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Generar PDFs sin Enviar</h1>
            <p className="text-muted-foreground">
              Busca clientes y genera PDFs de instructivos e intimaciones sin enviar por WhatsApp
            </p>
          </div>
        </div>
      </div>

      {/* Selección de tipo de PDF */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tipo de Documento PDF</CardTitle>
          <CardDescription>
            Selecciona qué archivos deseas generar para los clientes seleccionados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setTipoPDF('instructivo')}
              className={`p-4 rounded-lg border-2 transition-all ${
                tipoPDF === 'instructivo'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">Instructivo de Pago</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Opciones de pago y datos de contacto
                </p>
              </div>
            </button>

            <button
              onClick={() => setTipoPDF('intimacion')}
              className={`p-4 rounded-lg border-2 transition-all ${
                tipoPDF === 'intimacion'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <h3 className="font-semibold">Intimación de Pago</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Documento formal de intimación (48hs)
                </p>
              </div>
            </button>

            <button
              onClick={() => setTipoPDF('ambos')}
              className={`p-4 rounded-lg border-2 transition-all ${
                tipoPDF === 'ambos'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Ambos Documentos</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Instructivo + Intimación juntos
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Buscador de clientes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buscar Clientes</CardTitle>
          <CardDescription>
            Busca por UF, nombre del titular, dirección o barrio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por UF, titular, dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {loadingClientes && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de clientes */}
      {clientes.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Clientes Encontrados ({clientes.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSelectAll} size="sm">
                {selectedClientes.size === clientes.length
                  ? 'Deseleccionar todo'
                  : 'Seleccionar todo'}
              </Button>
              <Button
                onClick={handleDescargarPDFs}
                disabled={loading || selectedClientes.size === 0}
                className="bg-purple-600 hover:bg-purple-700"
                size="sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar {selectedClientes.size} PDF(s)
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max table-auto">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">
                      <input
                        type="checkbox"
                        checked={selectedClientes.size === clientes.length && clientes.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="text-left p-3 font-semibold">UF</th>
                    <th className="text-left p-3 font-semibold">Titular</th>
                    <th className="text-left p-3 font-semibold">Dirección</th>
                    <th className="text-left p-3 font-semibold">Barrio</th>
                    <th className="text-left p-3 font-semibold">Teléfono</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedClientes.has(cliente.id)}
                          onChange={() => handleToggleCliente(cliente.id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="p-3 font-mono text-sm">{cliente.uf}</td>
                      <td className="p-3">{cliente.titular || cliente.cliente || 'N/A'}</td>
                      <td className="p-3 text-sm text-gray-600">{cliente.calle_inm || 'N/A'}</td>
                      <td className="p-3 text-sm text-gray-600">{cliente.barrio_inm || 'N/A'}</td>
                      <td className="p-3 text-sm text-gray-600">{cliente.phone || 'Sin teléfono'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedClientes.size > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>{selectedClientes.size}</strong> cliente(s) seleccionado(s) • 
                  Tipo: <strong>{tipoPDF === 'ambos' ? 'Instructivo + Intimación' : tipoPDF === 'instructivo' ? 'Instructivo de Pago' : 'Intimación de Pago'}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay resultados */}
      {searchTerm.length >= 2 && !loadingClientes && clientes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No se encontraron clientes con el término "{searchTerm}"</p>
          </CardContent>
        </Card>
      )}

      {/* Mensaje inicial */}
      {searchTerm.length < 2 && clientes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Comienza a buscar clientes por UF, titular o dirección</p>
            <p className="text-sm text-gray-500 mt-2">Escribe al menos 2 caracteres para buscar</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
