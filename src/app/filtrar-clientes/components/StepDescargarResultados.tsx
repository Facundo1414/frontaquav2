'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, CheckCircle2, XCircle, AlertCircle, RotateCcw, FileSpreadsheet, Clipboard } from "lucide-react"
import { toast } from "sonner"
import { ProcessResults } from '../page'
import { generateAptosExcel, generateNoAptosExcel, generateMacheteExcel } from '@/lib/api/comprobanteApi'

interface StepDescargarResultadosProps {
  results: ProcessResults
  selectedClients?: any[] // Clientes de la BD con dirección y teléfono
  onReset: () => void
  onProcessMore?: () => void
}

export function StepDescargarResultados({ results, selectedClients = [], onReset, onProcessMore }: StepDescargarResultadosProps) {
  const [downloadingAptos, setDownloadingAptos] = useState(false)
  const [downloadingNoAptos, setDownloadingNoAptos] = useState(false)
  const [downloadingMachete, setDownloadingMachete] = useState(false)

  const handleDescargarAptos = async () => {
    setDownloadingAptos(true)

    try {
      const blob = await generateAptosExcel(results.results)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `APTOS-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('✅ Archivo APTOS descargado correctamente')

    } catch (error: any) {
      console.error('Error descargando archivo APTOS:', error)
      toast.error(error.response?.data?.message || error.message || 'Error al descargar archivo APTOS')
    } finally {
      setDownloadingAptos(false)
    }
  }

  const handleDescargarNoAptos = async () => {
    setDownloadingNoAptos(true)

    try {
      console.log('📊 Descargando NO APTOS - Total resultados:', results.results.length)
      console.log('📋 Muestra de resultados:', results.results.slice(0, 3))
      
      const blob = await generateNoAptosExcel(results.results)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `NO-APTOS-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('✅ Archivo NO APTOS descargado correctamente')

    } catch (error: any) {
      console.error('Error descargando archivo NO APTOS:', error)
      toast.error(error.response?.data?.message || error.message || 'Error al descargar archivo NO APTOS')
    } finally {
      setDownloadingNoAptos(false)
    }
  }

  const handleDescargarMachete = async () => {
    setDownloadingMachete(true)

    try {
      console.log('📋 Generando Machete para Visitas...')
      
      // Extraer UFs de los clientes APTOS
      const aptosResults = results.results.filter(
        r => r.comprobantesVencidos >= 3 && !r.hasPaymentPlan
      )

      // Mapear datos de clientes desde selectedClients
      // Crear un Map para buscar rápido por UF
      const clientsMap = new Map(
        selectedClients.map(c => [c.unidad.toString(), c])
      )

      const clientsData = aptosResults.map(r => {
        const client = clientsMap.get(r.uf.toString())
        
        // Construir dirección: calle_inm + numero_inm (dirección real del inmueble)
        let direccion = ''
        if (client) {
          const parts = []
          if (client.calle_inm) parts.push(client.calle_inm)
          if (client.numero_inm) parts.push(client.numero_inm)
          direccion = parts.join(' ')
        }

        return {
          uf: r.uf,
          direccion: direccion, // Dirección completa (calle + número)
          barrio: r.barrio || client?.barrio_inm || '', // Barrio
          telefono: client?.phone || '' // Teléfono
        }
      })

      const blob = await generateMacheteExcel(aptosResults, clientsData)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relevamiento-visitas-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('✅ Relevamiento para Visitas descargado correctamente')

    } catch (error: any) {
      console.error('Error descargando Relevamiento:', error)
      toast.error(error.response?.data?.message || error.message || 'Error al descargar Relevamiento')
    } finally {
      setDownloadingMachete(false)
    }
  }

  const aptosCount = results.results.filter(
    r => r.comprobantesVencidos >= 3 && !r.hasPaymentPlan
  ).length
  
  const noAptosCount = results.results.filter(
    r => r.comprobantesVencidos < 3 || r.hasPaymentPlan
  ).length

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-900 mb-2">
                🎉 ¡Verificación Completada Exitosamente!
              </h3>
              <p className="text-sm text-green-800 mb-3">
                Se procesaron <strong>{results.totalProcessed} cuentas</strong> correctamente
              </p>
              
              <div className="mt-3 p-3 bg-white border-2 border-green-200 rounded-lg">
                <p className="text-sm text-green-900 mb-2">
                  <strong>📊 ¿Qué recibirás?</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-800 ml-2">
                  <li><strong>3 archivos Excel</strong> separados</li>
                  <li><strong>APTOS:</strong> Clientes con 3+ consumos vencidos y sin plan de pago (listos para PYSE)</li>
                  <li><strong>NO APTOS:</strong> Resto de clientes (menos de 3 consumos o con plan de pago)</li>
                  <li><strong>RELEVAMIENTO:</strong> Lista simplificada para visitar clientes en campo (solo APTOS)</li>
                </ul>
              </div>

              <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  ✅ <strong>Las cuentas YA fueron marcadas como verificadas</strong> durante el procesamiento.
                </p>
                <p className="text-sm text-blue-900 mt-1">
                  💡 <strong>Próximo paso:</strong> Descarga los archivos y usa tu programa PYSE para imprimir los documentos.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Procesadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {results.totalProcessed}
                </p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">APTOS</p>
                <p className="text-2xl font-bold text-green-600">
                  {aptosCount}
                </p>
                <p className="text-xs text-green-600">3+ consumos, sin PP</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">NO APTOS</p>
                <p className="text-2xl font-bold text-red-600">
                  {noAptosCount}
                </p>
                <p className="text-xs text-red-600">{'< 3 consumos o con PP'}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Errores</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {results.errors}
                </p>
                <p className="text-xs text-yellow-600">No verificadas</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Info */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">📊 Desglose Detallado:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Cuentas con deuda válida (3+ consumos):</span>
              <span className="font-semibold text-green-600">{results.withDebt}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Cuentas con plan de pago:</span>
              <span className="font-semibold text-orange-600">{results.withPaymentPlan}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Porcentaje de éxito:</span>
              <span className="font-semibold text-blue-600">
                {((results.totalProcessed - results.errors) / results.totalProcessed * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Download className="h-12 w-12 text-blue-600 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Descargar Resultados
              </h3>
              <p className="text-sm text-gray-600 mb-4 text-center">
                Descarga los archivos Excel por separado:
              </p>
              <div className="space-y-2 text-sm text-left max-w-md mx-auto">
                <div className="flex items-start space-x-2 bg-white p-3 rounded">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">cuentas-aptas-[fecha].xlsx</p>
                    <p className="text-xs text-gray-600">{aptosCount} cuentas con 3+ consumos vencidos, sin plan de pago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 bg-white p-3 rounded">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">cuentas-no-aptas-[fecha].xlsx</p>
                    <p className="text-xs text-gray-600">{noAptosCount} cuentas con menos de 3 consumos o con plan de pago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 bg-white p-3 rounded border-2 border-blue-300">
                  <Clipboard className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">relevamiento-visitas-[fecha].xlsx</p>
                    <p className="text-xs text-gray-600">{aptosCount} clientes APTOS con 6 columnas para completar en campo</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 flex-col sm:flex-row">
              <Button
                onClick={handleDescargarAptos}
                disabled={downloadingAptos || aptosCount === 0}
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {downloadingAptos ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-5 w-5" />
                    Descargar APTOS ({aptosCount})
                  </>
                )}
              </Button>

              <Button
                onClick={handleDescargarNoAptos}
                disabled={downloadingNoAptos || noAptosCount === 0}
                size="lg"
                variant="outline"
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
              >
                {downloadingNoAptos ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-5 w-5" />
                    Descargar NO APTOS ({noAptosCount})
                  </>
                )}
              </Button>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleDescargarMachete}
                disabled={downloadingMachete || aptosCount === 0}
                size="lg"
                variant="outline"
                className="w-full border-2 border-blue-400 text-blue-700 hover:bg-blue-50"
              >
                {downloadingMachete ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                    Generando Relevamiento...
                  </>
                ) : (
                  <>
                    <Clipboard className="mr-2 h-5 w-5" />
                    📋 Descargar RELEVAMIENTO para Visitas ({aptosCount} clientes)
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                ✨ Excel simplificado con 6 columnas para completar en campo (UF, Dirección, Teléfono, Total Deuda, Conexión, Observación)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          onClick={onProcessMore || onReset}
          size="lg"
          className="text-lg"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          📋 Siguiente paso: imprimir avisos/notificaciones en tu programa PYSE
        </Button>
      </div>
    </div>
  )
}
