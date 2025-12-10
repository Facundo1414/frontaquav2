'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Download, CheckCircle2, Loader2, FileSpreadsheet, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import * as XLSX from 'xlsx'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { toast } from 'sonner'

interface PaymentPlanResult {
  uf: number
  hasPaymentPlan: boolean
  paymentPlanStatus?: string
  details?: string
  error?: string
}

export default function VerificarPlanesPagoPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<PaymentPlanResult[] | null>(null)
  const [stats, setStats] = useState<{
    total: number
    withPlan: number
    withoutPlan: number
    errors: number
  } | null>(null)

  const { userId } = useGlobalContext()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile)
        setResults(null)
        setStats(null)
        toast.success('Archivo cargado correctamente')
      } else {
        toast.error('Por favor selecciona un archivo Excel (.xlsx o .xls)')
      }
    }
  }

  const processFile = async () => {
    if (!file || !userId) return

    setProcessing(true)
    setResults(null)
    setStats(null)

    try {
      // Leer el Excel
      const fileBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const data: any[] = XLSX.utils.sheet_to_json(firstSheet)

      // Extraer UFs (buscar columna que contenga "uf", "cuenta", o similar)
      const ufs: number[] = []
      data.forEach((row) => {
        const uf = row['unidad'] || row['Unidad'] || row['UNIDAD'] ||
                   row['uf'] || row['UF'] || row['Uf'] || 
                   row['cuenta'] || row['CUENTA'] || row['Cuenta'] ||
                   row['Cuenta_Nro'] || row['cuenta_nro'] || row['CUENTA_NRO'] ||
                   row['CuentaNro'] || row['cuentanro'] || row['CUENTANRO'] ||
                   row['Account'] || row['account']
        if (uf && !isNaN(Number(uf))) {
          ufs.push(Number(uf))
        }
      })

      if (ufs.length === 0) {
        toast.error('No se encontraron UFs válidas en el archivo. Asegúrate de que tenga una columna llamada "unidad", "Cuenta_Nro", "UF" o "Cuenta".')
        setProcessing(false)
        return
      }

      toast.info(`Verificando ${ufs.length} cuentas...`)

      // Llamar al backend
      const token = localStorage.getItem('accessToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const response = await fetch(`${apiUrl}/api/process/verify-payment-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ufs }),
      })

      if (!response.ok) {
        throw new Error('Error al verificar planes de pago')
      }

      const data_response = await response.json()
      setResults(data_response.results)

      // Calcular estadísticas
      const withPlan = data_response.results.filter((r: PaymentPlanResult) => r.hasPaymentPlan).length
      const withoutPlan = data_response.results.filter((r: PaymentPlanResult) => !r.hasPaymentPlan && !r.error).length
      const errors = data_response.results.filter((r: PaymentPlanResult) => r.error).length

      setStats({
        total: data_response.results.length,
        withPlan,
        withoutPlan,
        errors,
      })

      toast.success('Verificación completada')
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al procesar el archivo')
    } finally {
      setProcessing(false)
    }
  }

  const downloadResults = () => {
    if (!results) return

    // Convertir resultados a formato Excel
    const dataToExport = results.map((r) => ({
      'UF': r.uf,
      'Estado del Plan': r.paymentPlanStatus || (r.hasPaymentPlan ? 'Sí' : 'No'),
      'Detalles': r.details || '',
      'Error': r.error || '',
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados')

    // Descargar
    const fileName = `planes_pago_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    toast.success('Resultados descargados')
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-blue-500" />
          Verificar Planes de Pago
        </h1>
        <p className="text-muted-foreground">
          Carga un archivo Excel con UFs y verifica automáticamente qué cuentas tienen planes de pago vigentes
        </p>
      </div>

      {/* Instrucciones */}
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Formato del Excel:</strong> Tu archivo debe tener una columna con el nombre 
          "unidad", "Cuenta_Nro", "UF", o similar. El sistema detectará automáticamente las cuentas.
        </AlertDescription>
      </Alert>

      {/* Card principal */}
      <Card>
        <CardHeader>
          <CardTitle>1. Cargar Archivo Excel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild disabled={processing}>
                <span className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Seleccionar Archivo
                </span>
              </Button>
            </label>
            {file && (
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {file.name}
              </span>
            )}
          </div>

          {file && !processing && !results && (
            <Button onClick={processFile} className="w-full" size="lg">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Verificar Planes de Pago
            </Button>
          )}

          {processing && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Consultando comprobantes service...
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {stats && results && (
        <>
          {/* Estadísticas */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>2. Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.withPlan}</div>
                  <div className="text-sm text-muted-foreground">Con Plan</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{stats.withoutPlan}</div>
                  <div className="text-sm text-muted-foreground">Sin Plan</div>
                </div>
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                  <div className="text-sm text-muted-foreground">Errores</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descargar */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>3. Descargar Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadResults} size="lg" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Descargar Excel con Resultados
              </Button>
            </CardContent>
          </Card>

          {/* Preview de resultados */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Vista Previa (Primeros 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">UF</th>
                      <th className="text-left p-2">Estado del Plan</th>
                      <th className="text-left p-2">Detalles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.slice(0, 10).map((r, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2 font-mono">{r.uf}</td>
                        <td className="p-2">
                          {r.error ? (
                            <span className="text-red-500">Error</span>
                          ) : r.paymentPlanStatus === 'Plan de pago vencido' ? (
                            <span className="text-red-500 font-semibold">Plan de pago vencido</span>
                          ) : r.paymentPlanStatus === 'Plan de pago por vencer' ? (
                            <span className="text-yellow-500 font-semibold">Plan de pago por vencer</span>
                          ) : r.paymentPlanStatus === 'Sin plan de pago' ? (
                            <span className="text-gray-500">Sin plan de pago</span>
                          ) : r.hasPaymentPlan ? (
                            <span className="text-green-500 font-semibold">SÍ</span>
                          ) : (
                            <span className="text-gray-500">NO</span>
                          )}
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">
                          {r.details || r.error || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {results.length > 10 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    ...y {results.length - 10} más. Descarga el Excel para ver todos.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
