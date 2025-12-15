'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Download, CheckCircle2, Loader2, FileSpreadsheet, AlertCircle, Copy, MessageSquare, Phone, CheckCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import * as XLSX from 'xlsx'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { toast } from 'sonner'
import { getPhonesByUFs } from '@/lib/api'

interface PaymentPlanResult {
  uf: number
  hasPaymentPlan: boolean
  paymentPlanStatus?: string
  details?: string
  error?: string
  // Nuevos campos
  nombre?: string
  telefono?: string
  telefonoExcel?: string
  deuda?: string
  mensaje?: string
  waLink?: string
  linkComprobante?: string
  enviado?: boolean
  estadoSimple?: string
  puedeGenerarComprobante?: boolean
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
    conTelefono?: number
    enviados?: number
  } | null>(null)
  const [enviados, setEnviados] = useState<Set<number>>(new Set())

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

      // 1. Llamar al backend para verificar planes de pago
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
      
      // 2. Enriquecer con datos del Excel (nombre y teléfono)
      const enrichedResults = data_response.results.map((r: PaymentPlanResult) => {
        const excelRow = data.find((row: any) => {
          const excelUf = row['unidad'] || row['Unidad'] || row['UNIDAD'] ||
                         row['uf'] || row['UF'] || row['Uf'] || 
                         row['cuenta'] || row['CUENTA'] || row['Cuenta'] ||
                         row['Cuenta_Nro'] || row['cuenta_nro'] || row['CUENTA_NRO'] ||
                         row['CuentaNro'] || row['cuentanro'] || row['CUENTANRO'] ||
                         row['Account'] || row['account']
          return Number(excelUf) === Number(r.uf)
        })
        
        const nombre = excelRow?.['titular'] || excelRow?.['Titular'] || excelRow?.['TITULAR'] || 
                      excelRow?.['nombre'] || excelRow?.['Nombre'] || excelRow?.['NOMBRE'] || 
                      excelRow?.['cliente'] || excelRow?.['Cliente'] || excelRow?.['CLIENTE'] ||
                      excelRow?.['Cliente_01'] || // Formato senddebts
                      'Cliente'
        
        // Intentar obtener teléfono del Excel (columnas senddebts)
        const telefonoExcel = excelRow?.['tel_clien'] || excelRow?.['tel_uni'] ||
                             excelRow?.['telefono'] || excelRow?.['Telefono'] || excelRow?.['TELEFONO'] ||
                             excelRow?.['phone'] || excelRow?.['Phone'] || null
        
        return {
          ...r,
          nombre,
          telefonoExcel, // Guardar para usarlo después
        }
      })

      // 3. Obtener teléfonos de la BD
      toast.info('Consultando teléfonos en base de datos...')
      const dbPhones = await getPhonesByUFs(ufs)
      console.log('📞 Teléfonos de BD:', dbPhones)
      
      // 4. Normalizar teléfonos
      const normalizePhone = (phone: any): string => {
        if (!phone) return ''
        // Convertir a string por si viene como número del Excel
        const phoneStr = String(phone).trim()
        // Limpiar espacios, guiones, paréntesis
        const cleaned = phoneStr.replace(/[\s\-()]/g, '')
        // Asegurar que empiece con +
        if (!cleaned.startsWith('+')) {
          // Si empieza con 54, agregar +
          if (cleaned.startsWith('54')) {
            return '+' + cleaned
          }
          // Si es número argentino sin código país, agregar +54
          if (cleaned.length >= 10) {
            return '+54' + cleaned
          }
        }
        return cleaned
      }
      
      // 5. Mapear todo y generar mensajes/links (priorizar BD, luego Excel)
      const finalResults = enrichedResults.map((r: PaymentPlanResult) => {
        // Priorizar BD, luego Excel
        const telefonoOriginal = dbPhones[r.uf] || r.telefonoExcel || null
        const telefonoNormalizado = telefonoOriginal ? normalizePhone(telefonoOriginal) : null
        
        console.log(`📞 UF ${r.uf}: BD=${dbPhones[r.uf]}, Excel=${r.telefonoExcel}, Final=${telefonoOriginal}`)
        
        // Determinar estado simple
        let estadoSimple = 'Sin plan'
        let puedeGenerarComprobante = false
        
        if (r.paymentPlanStatus?.includes('IMPAGAS')) {
          estadoSimple = 'Tiene deuda'
          puedeGenerarComprobante = true
        } else if (r.paymentPlanStatus?.includes('activo')) {
          estadoSimple = 'Al día'
          puedeGenerarComprobante = true
        }
        
        // Link de Espacio Cliente SIEMPRE (tenga deuda o no)
        const linkComprobante = `https://www.aguascordobesas.com.ar/espacioClientes/seccion/gestionDeuda/consulta/${r.uf}`
        
        // Generar mensaje personalizado
        const mensaje = `Hola ${r.nombre}, te contacto de Aguas Cordobesas respecto a tu cuenta ${r.uf}.

${estadoSimple === 'Tiene deuda' ? '⚠️ Tenés cuotas de tu plan de pago impagas. ' : '✅ Tu plan de pago está activo. '}

${linkComprobante ? `Podés descargar tu comprobante aquí: ${linkComprobante}\n\n` : ''}Por favor, comunicate para regularizar tu situación.

🌐 Cclip - Al servicio de Aguas Cordobesas`
        
        // Generar link de WhatsApp SIEMPRE que haya teléfono
        const waLink = telefonoNormalizado 
          ? `https://wa.me/${telefonoNormalizado.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}` 
          : null
        
        return {
          ...r,
          telefono: telefonoOriginal,
          mensaje,
          waLink,
          linkComprobante,
          estadoSimple,
          puedeGenerarComprobante,
          enviado: false,
        }
      })
      
      setResults(finalResults)

      // Calcular estadísticas
      const withPlan = finalResults.filter((r: PaymentPlanResult) => r.hasPaymentPlan).length
      const withoutPlan = finalResults.filter((r: PaymentPlanResult) => !r.hasPaymentPlan && !r.error).length
      const errors = finalResults.filter((r: PaymentPlanResult) => r.error).length
      const conTelefono = finalResults.filter((r: PaymentPlanResult) => r.telefono).length

      setStats({
        total: finalResults.length,
        withPlan,
        withoutPlan,
        errors,
        conTelefono,
        enviados: 0,
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

    // Excel SIMPLIFICADO con solo datos útiles
    const dataToExport = results.map((r: any) => ({
      'UF': r.uf,
      'Nombre': r.nombre || '',
      'Teléfono': r.telefono || 'Sin teléfono',
      'Estado': r.estadoSimple || 'Sin plan',
      'Puede generar comprobante': r.puedeGenerarComprobante ? 'SÍ' : 'NO',
      'Link Espacio Cliente': r.linkComprobante || '',
      'Enviado': enviados.has(r.uf) ? 'SÍ' : 'NO',
      'Link WhatsApp': r.waLink || '',
      'Mensaje pre-armado': r.mensaje || '',
      'OBSERVACIONES': '', // Columna para notas del usuario
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    
    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 10 },  // UF
      { wch: 25 },  // Nombre
      { wch: 18 },  // Teléfono
      { wch: 15 },  // Estado
      { wch: 22 },  // Puede generar comprobante
      { wch: 60 },  // Link Espacio Cliente
      { wch: 10 },  // Enviado
      { wch: 40 },  // Link WhatsApp
      { wch: 60 },  // Mensaje
      { wch: 50 },  // OBSERVACIONES
    ]
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados')

    // Descargar
    const fileName = `planes_pago_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    toast.success('Excel descargado con links de WhatsApp y mensajes listos para usar')
  }

  const copiarMensaje = (mensaje: string, nombre: string) => {
    navigator.clipboard.writeText(mensaje)
    toast.success(`Mensaje de ${nombre} copiado al portapapeles`)
  }

  const toggleEnviado = (uf: number) => {
    setEnviados(prev => {
      const newSet = new Set(prev)
      if (newSet.has(uf)) {
        newSet.delete(uf)
      } else {
        newSet.add(uf)
      }
      
      // Actualizar stats
      if (stats) {
        const wasChecked = newSet.has(uf)
        setStats({
          ...stats,
          enviados: newSet.size
        })
      }
      
      return newSet
    })
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

          {(processing) && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Consultando planes de pago y teléfonos...
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.withPlan}</div>
                  <div className="text-sm text-muted-foreground">Con Plan</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.conTelefono || 0}</div>
                  <div className="text-sm text-muted-foreground">Con Teléfono</div>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-950 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-600">{stats.enviados || 0}</div>
                  <div className="text-sm text-muted-foreground">Enviados</div>
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

          {/* Vista Optimizada para Envío Rápido */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Vista de Envío Rápido
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Haz clic en el botón de WhatsApp para abrir el chat con el mensaje pre-cargado, o copia el mensaje manualmente.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Filtros rápidos */}
              <div className="flex gap-2 flex-wrap mb-4">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  <Phone className="w-3 h-3 mr-1" />
                  Con Teléfono: {results!.filter(r => r.telefono).length}
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Con deuda: {results!.filter(r => r.estadoSimple === 'Tiene deuda').length}
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Pendientes: {results!.filter(r => !enviados.has(r.uf)).length}
                </Badge>
              </div>

              {/* Cards de clientes */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {results!
                  .sort((a, b) => {
                    // Priorizar: con teléfono y deuda primero
                    if (a.telefono && !b.telefono) return -1
                    if (!a.telefono && b.telefono) return 1
                    if (a.estadoSimple === 'Tiene deuda' && b.estadoSimple !== 'Tiene deuda') return -1
                    if (a.estadoSimple !== 'Tiene deuda' && b.estadoSimple === 'Tiene deuda') return 1
                    return 0
                  })
                  .map((r, i) => (
                  <Card key={i} className={`${enviados.has(r.uf) ? 'opacity-50 bg-green-50 dark:bg-green-950/20' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Checkbox de enviado */}
                        <div className="pt-1">
                          <Checkbox
                            checked={enviados.has(r.uf)}
                            onCheckedChange={() => toggleEnviado(r.uf)}
                            className="h-5 w-5"
                          />
                        </div>

                        {/* Info del cliente */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{r.nombre}</h3>
                              <p className="text-sm text-muted-foreground">UF: {r.uf}</p>
                            </div>
                            <div className="flex gap-2">
                              {r.telefono && (
                                <Badge variant="default" className="bg-green-600">
                                  <Phone className="w-3 h-3 mr-1" />
                                  Teléfono
                                </Badge>
                              )}
                              {r.estadoSimple === 'Tiene deuda' && (
                                <Badge variant="destructive">
                                  Tiene deuda
                                </Badge>
                              )}
                              {r.estadoSimple === 'Al día' && (
                                <Badge variant="default" className="bg-blue-600">
                                  Al día
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Teléfono */}
                          {r.telefono && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4" />
                              <span className="font-mono">{r.telefono}</span>
                            </div>
                          )}

                          {/* Mensaje pre-formateado */}
                          {r.mensaje && (
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm">
                              <p className="whitespace-pre-wrap text-muted-foreground">{r.mensaje}</p>
                            </div>
                          )}

                          {/* Acciones */}
                          <div className="flex gap-2 flex-wrap">
                            {r.linkComprobante && (
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => window.open(r.linkComprobante!, '_blank')}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Ver en Espacio Cliente
                              </Button>
                            )}
                            {r.waLink && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  window.open(r.waLink!, '_blank')
                                  toggleEnviado(r.uf)
                                }}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Enviar por WhatsApp
                              </Button>
                            )}
                            {r.mensaje && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copiarMensaje(r.mensaje!, r.nombre!)}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar mensaje
                              </Button>
                            )}
                            {!r.telefono && (
                              <p className="text-sm text-amber-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Sin teléfono registrado
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
