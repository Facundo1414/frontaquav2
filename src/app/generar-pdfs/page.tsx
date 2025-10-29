'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Loader2, ArrowLeft, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'

type TipoPDF = 'AVISO' | 'NOTIFICACION' | 'INTIMACION'

interface Cuenta {
  uf: string
  titular: string
  domicilio: string
  deudaTotal: number
  comprobantes: {
    numero: string
    monto: number
    vencimiento: string
  }[]
}

export default function GenerarPDFsPage() {
  const router = useRouter()
  const [tipoPDF, setTipoPDF] = useState<TipoPDF>('AVISO')
  const [loading, setLoading] = useState(false)
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [selectedCuentas, setSelectedCuentas] = useState<Set<string>>(new Set())

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      // TODO: Implementar lectura y parseo del Excel
      // Por ahora datos de ejemplo
      const ejemploCuentas: Cuenta[] = [
        {
          uf: '123456',
          titular: 'Juan Pérez',
          domicilio: 'Av. Colón 123',
          deudaTotal: 15000,
          comprobantes: [
            { numero: 'FCPP001', monto: 5000, vencimiento: '2025-10-15' },
            { numero: 'FCPP002', monto: 10000, vencimiento: '2025-10-25' },
          ],
        },
        {
          uf: '789012',
          titular: 'María García',
          domicilio: 'Bv. Illia 456',
          deudaTotal: 8500,
          comprobantes: [
            { numero: 'FCPP003', monto: 8500, vencimiento: '2025-10-20' },
          ],
        },
      ]
      setCuentas(ejemploCuentas)
    } catch (error) {
      alert('Error al procesar el archivo')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedCuentas.size === cuentas.length) {
      setSelectedCuentas(new Set())
    } else {
      setSelectedCuentas(new Set(cuentas.map((c) => c.uf)))
    }
  }

  const handleToggleCuenta = (uf: string) => {
    const newSelected = new Set(selectedCuentas)
    if (newSelected.has(uf)) {
      newSelected.delete(uf)
    } else {
      newSelected.add(uf)
    }
    setSelectedCuentas(newSelected)
  }

  const handleGenerarPDFs = async () => {
    if (selectedCuentas.size === 0) {
      alert('Selecciona al menos una cuenta')
      return
    }

    setLoading(true)
    try {
      const cuentasSeleccionadas = cuentas.filter((c) =>
        selectedCuentas.has(c.uf)
      )

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/pdf-generator/generate-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          tipoPDF,
          cuentas: cuentasSeleccionadas,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${tipoPDF}_${new Date().toISOString().split('T')[0]}.zip`
        a.click()
        alert(`✅ ${selectedCuentas.size} PDFs generados exitosamente`)
      } else {
        throw new Error('Error generando PDFs')
      }
    } catch (error) {
      alert('❌ Error al generar PDFs')
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
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Sistema de Generación de PDFs</h1>
            <p className="text-muted-foreground">
              Genera avisos, notificaciones e intimaciones de deuda en PDF
            </p>
          </div>
        </div>
      </div>

      {/* Selección de tipo de PDF */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tipo de Documento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setTipoPDF('AVISO')}
              className={`p-4 rounded-lg border-2 transition-all ${
                tipoPDF === 'AVISO'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">AVISO</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Notificación inicial de deuda
                </p>
              </div>
            </button>

            <button
              onClick={() => setTipoPDF('NOTIFICACION')}
              className={`p-4 rounded-lg border-2 transition-all ${
                tipoPDF === 'NOTIFICACION'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                <h3 className="font-semibold">NOTIFICACIÓN</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Recordatorio formal (10 días)
                </p>
              </div>
            </button>

            <button
              onClick={() => setTipoPDF('INTIMACION')}
              className={`p-4 rounded-lg border-2 transition-all ${
                tipoPDF === 'INTIMACION'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <h3 className="font-semibold">INTIMACIÓN</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Última notificación (5 días)
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Carga de archivo */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cargar Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Sube un archivo Excel con las cuentas y sus deudas
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleUploadExcel}
                className="hidden"
                disabled={loading}
              />
              <Button disabled={loading} asChild>
                <span>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Seleccionar archivo
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Lista de cuentas */}
      {cuentas.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Cuentas Cargadas ({cuentas.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSelectAll}>
                {selectedCuentas.size === cuentas.length
                  ? 'Deseleccionar todo'
                  : 'Seleccionar todo'}
              </Button>
              <Button
                onClick={handleGenerarPDFs}
                disabled={loading || selectedCuentas.size === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generar {selectedCuentas.size} PDF(s)
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">
                      <input
                        type="checkbox"
                        checked={selectedCuentas.size === cuentas.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="text-left p-3">UF</th>
                    <th className="text-left p-3">Titular</th>
                    <th className="text-left p-3">Domicilio</th>
                    <th className="text-right p-3">Deuda Total</th>
                    <th className="text-center p-3">Comprobantes</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentas.map((cuenta) => (
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
                      <td className="p-3">{cuenta.domicilio}</td>
                      <td className="p-3 text-right font-semibold">
                        ${cuenta.deudaTotal.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        {cuenta.comprobantes.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
