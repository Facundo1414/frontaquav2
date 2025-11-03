'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Send, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useWhatsappSessionContext } from '@/app/providers/context/whatsapp/WhatsappSessionContext'

type TipoDocumento = 'AVISO' | 'NOTIFICACION' | 'INTIMACION'

interface Cliente {
  uf: number
  titular: string
  barrio: string
  domicilio: string
  telefono?: string
  deudaTotal: number
  comprobantes?: {
    numero: string
    monto: number
    vencimiento: string
  }[]
  // canonical field that matches DB values (english): pending|notified|visited|verified
  status?: 'pending' | 'notified' | 'visited' | 'verified'
}

export default function GenerarDocumentosWhatsAppPage() {
  const router = useRouter()
  const { snapshot } = useWhatsappSessionContext()
  const sessionStatus = snapshot?.state || 'none'
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>('AVISO')
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [selectedClientes, setSelectedClientes] = useState<Set<number>>(new Set())
  const [generando, setGenerando] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    cargarClientesVerificados()
  }, [])

  const cargarClientesVerificados = async () => {
    setLoading(true)
    try {
      // TODO: Implementar llamada al backend para obtener clientes verificados
      // Por ahora, datos de ejemplo
      const ejemploClientes: Cliente[] = [
        {
          uf: 123456,
          titular: 'Juan Pérez',
          barrio: 'Centro',
          domicilio: 'Av. Colón 123',
          telefono: '3514567890',
          deudaTotal: 15000,
          status: 'verified',
          comprobantes: [
            { numero: 'FCPP001', monto: 5000, vencimiento: '2025-09-15' },
            { numero: 'FCPP002', monto: 10000, vencimiento: '2025-10-25' },
          ],
        },
        {
          uf: 789012,
          titular: 'María García',
          barrio: 'Nueva Córdoba',
          domicilio: 'Bv. Illia 456',
          telefono: '3517654321',
          deudaTotal: 8500,
          status: 'verified',
          comprobantes: [
            { numero: 'FCPP003', monto: 8500, vencimiento: '2025-10-20' },
          ],
        },
      ]
      setClientes(ejemploClientes)
    } catch (error) {
      toast.error('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedClientes.size === clientes.length) {
      setSelectedClientes(new Set())
    } else {
      setSelectedClientes(new Set(clientes.map((c) => c.uf)))
    }
  }

  const handleToggleCliente = (uf: number) => {
    const newSelected = new Set(selectedClientes)
    if (newSelected.has(uf)) {
      newSelected.delete(uf)
    } else {
      newSelected.add(uf)
    }
    setSelectedClientes(newSelected)
  }

  const handleGenerarPDFs = async () => {
    if (selectedClientes.size === 0) {
      toast.error('Selecciona al menos un cliente')
      return
    }

    setGenerando(true)
    try {
      const clientesSeleccionados = clientes.filter((c) =>
        selectedClientes.has(c.uf)
      )

      // TODO: Implementar generación de PDFs
      // Por ahora simulación
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success(`✅ ${selectedClientes.size} PDFs generados correctamente`)
    } catch (error) {
      toast.error('Error al generar PDFs')
    } finally {
      setGenerando(false)
    }
  }

  const handleEnviarWhatsApp = async () => {
    if (selectedClientes.size === 0) {
      toast.error('Selecciona al menos un cliente')
      return
    }

    if (sessionStatus !== 'ready') {
      toast.error('La sesión de WhatsApp no está lista')
      return
    }

    setEnviando(true)
    try {
      const clientesSeleccionados = clientes.filter((c) =>
        selectedClientes.has(c.uf)
      )

      // TODO: Implementar envío por WhatsApp
      // Por ahora simulación
      await new Promise((resolve) => setTimeout(resolve, 3000))

      toast.success(`✅ Mensajes enviados a ${selectedClientes.size} clientes`)
      setSelectedClientes(new Set())
    } catch (error) {
      toast.error('Error al enviar mensajes')
    } finally {
      setEnviando(false)
    }
  }

  const handleGenerarYEnviar = async () => {
    if (selectedClientes.size === 0) {
      toast.error('Selecciona al menos un cliente')
      return
    }

    if (sessionStatus !== 'ready') {
      toast.error('La sesión de WhatsApp no está lista')
      return
    }

    setGenerando(true)
    setEnviando(true)

    try {
      // Paso 1: Generar PDFs
      toast.info('📄 Generando PDFs...')
      await handleGenerarPDFs()

      // Paso 2: Enviar por WhatsApp
      toast.info('📱 Enviando mensajes...')
      await handleEnviarWhatsApp()

      toast.success('✅ Proceso completado exitosamente')
    } catch (error) {
      toast.error('Error en el proceso')
    } finally {
      setGenerando(false)
      setEnviando(false)
    }
  }

  const clientesConTelefono = clientes.filter((c) => c.telefono)

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
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Generar Documentos y Enviar por WhatsApp</h1>
            <p className="text-muted-foreground">
              Genera PDFs de 3 páginas (AVISO, NOTIFICACIÓN, INTIMACIÓN) y envíalos automáticamente
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp Status */}
      <Card className={`mb-6 ${sessionStatus === 'ready' ? 'bg-green-50' : 'bg-yellow-50'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {sessionStatus === 'ready' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              <div>
                <p className="font-medium">
                  {sessionStatus === 'ready'
                    ? '✅ Sesión de WhatsApp activa'
                    : '⚠️ Sesión de WhatsApp no iniciada'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {sessionStatus === 'ready'
                    ? 'Puedes enviar mensajes automáticamente'
                    : 'Inicia sesión en el menú superior para enviar mensajes'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selección de tipo de documento */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tipo de Documento a Generar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setTipoDocumento('AVISO')}
              className={`p-4 rounded-lg border-2 transition-all ${
                tipoDocumento === 'AVISO'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
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
              onClick={() => setTipoDocumento('NOTIFICACION')}
              className={`p-4 rounded-lg border-2 transition-all ${
                tipoDocumento === 'NOTIFICACION'
                  ? 'border-amber-500 bg-amber-50 shadow-md'
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
              onClick={() => setTipoDocumento('INTIMACION')}
              className={`p-4 rounded-lg border-2 transition-all ${
                tipoDocumento === 'INTIMACION'
                  ? 'border-red-500 bg-red-50 shadow-md'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <h3 className="font-semibold">INTIMACIÓN</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Aviso final antes de corte
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Verificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{clientes.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Con Teléfono
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{clientesConTelefono.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Seleccionados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">{selectedClientes.size}</p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones principales */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="flex-1"
            >
              {selectedClientes.size === clientes.length
                ? 'Deseleccionar todo'
                : 'Seleccionar todo'}
            </Button>

            <Button
              onClick={handleGenerarPDFs}
              disabled={generando || selectedClientes.size === 0}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {generando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando PDFs...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Solo Generar PDFs ({selectedClientes.size})
                </>
              )}
            </Button>

            <Button
              onClick={handleGenerarYEnviar}
              disabled={
                generando ||
                enviando ||
                selectedClientes.size === 0 ||
                sessionStatus !== 'ready'
              }
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {generando || enviando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generar y Enviar WhatsApp ({selectedClientes.size})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes Verificados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay clientes verificados
            </div>
          ) : (
            <div className="space-y-2">
              {clientes.map((cliente) => (
                <div
                  key={cliente.uf}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedClientes.has(cliente.uf)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => handleToggleCliente(cliente.uf)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedClientes.has(cliente.uf)}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="font-medium">
                            UF {cliente.uf} - {cliente.titular}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {cliente.domicilio} - {cliente.barrio}
                          </p>
                          {cliente.telefono && (
                            <p className="text-xs text-green-600">
                              📱 {cliente.telefono}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        ${cliente.deudaTotal.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cliente.comprobantes?.length || 0} comprobantes
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
