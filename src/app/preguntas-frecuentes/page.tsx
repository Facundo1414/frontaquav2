'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ArrowLeft, HelpCircle, BookOpen, Video, FileQuestion, Phone, Play, CheckCircle2, AlertCircle, Info, Upload, Send, Download, Printer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { ButtonPreview } from '@/components/ButtonPreview'

export default function PreguntasFrecuentesPage() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<'faq' | 'tutorials'>('faq')
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null)
  const tutorialDetailRef = useRef<HTMLDivElement>(null)

  // Scroll suave cuando se selecciona un tutorial
  useEffect(() => {
    if (activeTutorial && tutorialDetailRef.current) {
      // Delay pequeño para asegurar que el contenido se renderizó
      setTimeout(() => {
        tutorialDetailRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 100)
    }
  }, [activeTutorial])

  const tutorials = [
    {
      id: 'enviar-deudas',
      title: '📤 Enviar Notificaciones de Deuda por WhatsApp',
      difficulty: 'Fácil',
      duration: '5 min',
      description: 'Aprende a notificar a tus clientes sobre sus deudas pendientes de forma masiva',
      steps: [
        {
          number: 1,
          title: 'Accede al módulo',
          description: 'Desde el menú principal, haz clic en "Enviar Deudas"',
          details: 'Verás la pantalla principal donde podrás configurar el envío masivo de notificaciones.',
          tip: 'Asegúrate de que WhatsApp esté conectado (verás un indicador verde en la parte superior)',
          preview: <ButtonPreview label="Enviar Deudas" icon={Send} variant="default" />
        },
        {
          number: 2,
          title: 'Selecciona el archivo Excel',
          description: 'Haz clic en "Seleccionar archivo" y elige tu base de datos de clientes',
          details: 'Para clientes con plan de pago activo, debes subir el archivo llamado "incumplidos" que contiene la información de cuotas vencidas. El archivo debe contener las columnas: UF, Nombre, Teléfono, y Deuda. El sistema detectará automáticamente el formato.',
          tip: '⚠️ IMPORTANTE: Para planes de pago, usa el archivo "incumplidos". El sistema acepta archivos .xlsx y .xls. Tamaño máximo recomendado: 1000 clientes por envío',
          preview: <ButtonPreview label="Seleccionar archivo" icon={Upload} variant="outline" />
        },
        {
          number: 3,
          title: 'Personaliza el mensaje (opcional)',
          description: 'Modifica el texto del mensaje si lo deseas',
          details: 'Puedes usar variables como {nombre}, {deuda}, {uf} para personalizar cada mensaje. El sistema reemplazará automáticamente estos valores con los datos de cada cliente.',
          tip: 'Mantén el mensaje corto y profesional para evitar que sea marcado como spam'
        },
        {
          number: 4,
          title: 'Configura las opciones de intimación',
          description: 'Marca si deseas incluir texto de intimación legal',
          details: 'La intimación es opcional. Si la activas, se agregará un texto legal al mensaje notificando acciones posteriores.',
          tip: 'Usa la intimación solo cuando sea necesario, no en todos los envíos'
        },
        {
          number: 5,
          title: 'Inicia el envío',
          description: 'Haz clic en "Enviar mensajes" y monitorea el progreso',
          details: 'Verás en tiempo real cuántos mensajes se enviaron exitosamente, cuántos fallaron, y el estado de cada cliente. El proceso puede pausarse en cualquier momento.',
          tip: 'El sistema envía con delays automáticos para evitar bloqueos de WhatsApp (2-5 segundos entre mensajes)',
          preview: <ButtonPreview label="Enviar mensajes →" icon={Send} variant="default" />
        },
        {
          number: 6,
          title: 'Descarga el reporte',
          description: 'Al finalizar, descarga el Excel con los resultados',
          details: 'El archivo incluye columnas adicionales: "Estado del envío", "Hora de envío", "Error (si aplica)". Este reporte te permite hacer seguimiento y reenviar a clientes que no recibieron el mensaje.',
          tip: 'Guarda este reporte en tu carpeta de archivos. También queda disponible en la sección "Archivos"',
          preview: <ButtonPreview label="Descargar resultados" icon={Download} variant="default" />
        },
        {
          number: 7,
          title: 'Manejo de errores: Espacio Clientes caído',
          description: 'Si Espacio Clientes está en mantenimiento o caído durante el envío',
          details: 'Cuando Espacio Clientes no está disponible, en el archivo final la columna "motivo" indicará que no se pudo generar el comprobante de pago. En estos casos, puedes volver a enviar solo los clientes que tuvieron este error una vez que Espacio Clientes esté operativo nuevamente.',
          tip: '💡 Filtrar el Excel final por la columna "motivo" para identificar rápidamente los clientes afectados y reenviarles el comprobante más tarde'
        }
      ]
    },
    {
      id: 'filtrar-clientes',
      title: '🔍 Filtrar Clientes Aptos',
      difficulty: 'Intermedio',
      duration: '8 min',
      description: 'Filtra clientes según criterios de deuda y genera reportes personalizados',
      steps: [
        {
          number: 1,
          title: 'Accede al filtrado',
          description: 'Desde el menú, selecciona "Filtrar Clientes"',
          details: 'Este módulo te permite segmentar tu base de clientes según múltiples criterios de deuda y ubicación.',
          tip: 'Ideal para planificar visitas domiciliarias o acciones de cobranza específicas'
        },
        {
          number: 2,
          title: 'Selecciona los barrios',
          description: 'Elige uno o varios barrios para procesar',
          details: 'Puedes seleccionar todos los barrios o solo algunos específicos. La lista se carga automáticamente desde tu base de datos. Simplemente marca los barrios que quieres incluir en el análisis.',
          tip: 'Trabaja por zonas para optimizar rutas de visitas. El sistema procesará todos los clientes de los barrios seleccionados según los demás filtros'
        },
        {
          number: 3,
          title: 'Configura el rango de clientes (opcional)',
          description: 'Define qué clientes procesar de cada barrio seleccionado',
          details: 'El "Rango de clientes por barrio" te permite procesar un subconjunto específico. Por ejemplo: si el barrio Las Flores tiene 500 clientes, puedes procesar solo del 1 al 200 (o dejar "Hasta" vacío para procesar desde 1 hasta el final). Si dejas ambos campos vacíos, se procesan TODOS los clientes del barrio.',
          tip: '💡 Ejemplo práctico:\n\n• Día 1: Seleccionar "Las Flores" + Rango "Desde: (vacío) Hasta: 200" = Procesa las primeras 200 cuentas\n\n• Día 2 (Opción A): Seleccionar "Las Flores" + Estado "Pendiente" = Procesa solo las que NO se procesaron el día anterior\n\n• Día 2 (Opción B - MÁS RECOMENDADO): Seleccionar "Las Flores" + Rango "Desde: 201 Hasta: 400" = Procesa las siguientes 200 cuentas sin importar el estado'
        },
        {
          number: 4,
          title: 'Ejecuta el filtrado',
          description: 'Haz clic en "Procesar" y espera los resultados',
          details: 'El sistema analizará tu base completa y clasificará clientes en APTOS y NO APTOS según los criterios definidos. Puedes usar filtros de estado de notificación (Pendiente, Notificado, Verificado, Visitado) para refinar tu búsqueda.',
          tip: 'El proceso puede tomar varios minutos si tienes muchos clientes. El sistema consulta deudas en tiempo real desde Sylanus'
        },
        {
          number: 5,
          title: 'Descarga los archivos',
          description: 'Obtén los Excel de clientes APTOS y NO APTOS',
          details: 'APTOS: Clientes que cumplen todos los criterios (listos para acción). NO APTOS: Clientes que no califican (tienen plan de pago, menos comprobantes, etc.).',
          tip: 'Revisa el archivo NO APTOS para identificar clientes con planes de pago activos'
        },
        {
          number: 6,
          title: 'Genera el Relevamiento para Visitas',
          description: 'Si lo necesitas, descarga el archivo simplificado para campo',
          details: 'Este archivo contiene solo 6 columnas (UF, Dirección, Teléfono, Deuda, Conexión, Observación) ideal para imprimir y llevar en visitas.',
          tip: 'Imprime este archivo y completa las columnas "Conexión" y "Observación" durante las visitas'
        }
      ]
    },
    {
      id: 'proximos-vencer',
      title: '⏰ Próximos a Vencer',
      difficulty: 'Fácil',
      duration: '4 min',
      description: 'Notifica a clientes sobre cuotas próximas a vencer para prevenir deudas',
      steps: [
        {
          number: 1,
          title: 'Accede al módulo',
          description: 'Haz clic en "Próximos a Vencer" desde el menú',
          details: 'Esta función es preventiva: notifica antes del vencimiento para evitar que los clientes caigan en mora.',
          tip: 'Úsala a principios o mediados de mes para mejores resultados'
        },
        {
          number: 2,
          title: 'Revisa el periodo calculado',
          description: 'El sistema muestra automáticamente hasta fin de mes',
          details: 'Por ejemplo: si hoy es 5 de noviembre, buscará cuotas que vencen del 5 al 30 de noviembre. Los días de anticipación se calculan automáticamente.',
          tip: 'No necesitas configurar fechas manualmente, el sistema lo hace por ti'
        },
        {
          number: 3,
          title: 'Selecciona el archivo Excel',
          description: 'Carga tu base de datos de cuotas',
          details: '⚠️ IMPORTANTE: Debes subir el archivo de Plan de pago llamado "incumplidos". El archivo debe incluir: UF, Nombre, Teléfono, Cuota, Vencimiento, Monto.',
          tip: 'Asegúrate de que las fechas de vencimiento estén en formato correcto (DD/MM/YYYY)',
          preview: <ButtonPreview label="Seleccionar archivo" icon={Upload} variant="outline" />
        },
        {
          number: 4,
          title: 'Personaliza el mensaje recordatorio',
          description: 'Modifica el texto del recordatorio si lo deseas',
          details: 'Usa un tono amigable y preventivo. Variables disponibles: {nombre}, {cuota}, {vencimiento}, {monto}.',
          tip: 'Mensaje sugerido: "Hola {nombre}, te recordamos que tu cuota {cuota} vence el {vencimiento}"'
        },
        {
          number: 5,
          title: 'Inicia el envío',
          description: 'Haz clic en "Enviar Recordatorios"',
          details: 'El proceso es similar al envío de deudas: verás el progreso en tiempo real y se aplicarán delays automáticos.',
          tip: 'Este tipo de mensaje tiene mejor recepción que las notificaciones de deuda'
        },
        {
          number: 6,
          title: 'Descarga el reporte',
          description: 'Obtén el Excel con los resultados del envío',
          details: 'El reporte incluye qué clientes fueron notificados exitosamente y cuáles tuvieron errores.',
          tip: 'Estos recordatorios pueden reducir significativamente la morosidad'
        }
      ]
    },
    {
      id: 'archivos',
      title: '📁 Gestión de Archivos',
      difficulty: 'Fácil',
      duration: '3 min',
      description: 'Accede y descarga todos los archivos generados por el sistema',
      steps: [
        {
          number: 1,
          title: 'Accede a la sección Archivos',
          description: 'Haz clic en "Archivos" desde el menú lateral',
          details: 'Aquí se almacenan automáticamente todos los Excel y PDFs generados por cualquier módulo del sistema.',
          tip: 'Los archivos se organizan por fecha de creación'
        },
        {
          number: 2,
          title: 'Navega por la lista',
          description: 'Explora los archivos ordenados cronológicamente',
          details: 'Cada archivo muestra: nombre descriptivo, fecha de creación, tamaño, y tipo (Excel, PDF).',
          tip: 'Usa el buscador para encontrar archivos específicos rápidamente'
        },
        {
          number: 3,
          title: 'Descarga lo que necesites',
          description: 'Haz clic en el botón de descarga de cualquier archivo',
          details: 'Los archivos se descargan instantáneamente a tu carpeta de descargas predeterminada.',
          tip: 'Puedes descargar el mismo archivo múltiples veces si lo necesitas'
        },
        {
          number: 4,
          title: 'Elimina archivos antiguos (opcional)',
          description: 'Libera espacio eliminando archivos que ya no necesites',
          details: 'Solo elimina archivos de los que ya tengas respaldo local. La eliminación es permanente.',
          tip: 'Mantén al menos los archivos del último mes para seguimiento'
        }
      ]
    }
  ]

  return (
    <div className="w-full min-h-screen px-6 pb-10">
      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          /* Ocultar elementos de navegación */
          .no-print {
            display: none !important;
          }
          
          /* Ocultar header con botón volver */
          header,
          nav,
          .print-hide {
            display: none !important;
          }
          
          /* Ajustar márgenes de página */
          @page {
            margin: 1cm;
          }
          
          /* Evitar saltos de página dentro de pasos */
          .step-container {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Header */}
      <div className="mb-6 no-print">
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
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Centro de Ayuda</h1>
            <p className="text-muted-foreground">
              Guía completa para usar el sistema de gestión de deudas
            </p>
          </div>
        </div>
      </div>

      {/* View Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 no-print">
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${activeView === 'tutorials' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => {
            setActiveView('tutorials')
            setActiveTutorial(null)
          }}
        >
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Tutoriales Paso a Paso</h3>
            <p className="text-sm text-gray-600">Guías visuales para cada función</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${activeView === 'faq' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => setActiveView('faq')}
        >
          <CardContent className="p-6 text-center">
            <FileQuestion className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Preguntas Frecuentes</h3>
            <p className="text-sm text-gray-600">Respuestas a dudas comunes</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow opacity-60">
          <CardContent className="p-6 text-center">
            <Video className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Video Tutoriales</h3>
            <p className="text-sm text-gray-600">Próximamente disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ View */}
      {activeView === 'faq' && (
        <>

      {/* Main Content */}
      <Card>
        <CardContent className="p-8">
          {/* Sección 1: Enviar Deudas */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-purple-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">1</span>
              Enviar Deudas por WhatsApp
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Qué es &quot;Enviar Deudas&quot;?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Es la función principal del sistema que te permite notificar automáticamente a tus clientes 
                    sobre sus deudas pendientes mediante WhatsApp.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-semibold text-blue-900 mb-2">¿Cuándo usarlo?</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>Cuando necesites enviar comprobantes de deuda masivamente</li>
                      <li>Para recordar a clientes sobre deudas vencidas o próximas a vencer</li>
                      <li>Envío automatizado con seguimiento en tiempo real</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>¿Cómo funciona el proceso?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                      <div>
                        <p className="font-medium">Subir archivo Excel</p>
                        <p className="text-sm text-gray-600">Usa el template con las columnas requeridas (UF, titular, teléfono, etc.)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                      <div>
                        <p className="font-medium">Personalizar mensaje</p>
                        <p className="text-sm text-gray-600">Edita el texto que se enviará con el PDF adjunto</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                      <div>
                        <p className="font-medium">Enviar y seguir</p>
                        <p className="text-sm text-gray-600">El sistema envía automáticamente y genera un Excel con los resultados</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>¿Qué pasa si un cliente no tiene WhatsApp?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    El sistema automáticamente detecta clientes sin WhatsApp y los separa en un archivo aparte 
                    llamado <strong>&quot;sin-whatsapp.xlsx&quot;</strong> que puedes descargar al finalizar.
                  </p>
                  <p className="text-sm text-gray-600">
                    💡 <strong>Tip:</strong> Usa ese archivo para contactar a esos clientes por otro medio (correo, teléfono, correo postal).
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Sección 2: Filtrar Clientes PYSE */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-green-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">2</span>
              Filtrar Clientes para PYSE
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="pyse-1">
                <AccordionTrigger>¿Qué es el filtrado de clientes y para qué sirve?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Esta función te permite filtrar y clasificar clientes según su estado de deuda:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Identificar automáticamente clientes <strong>APTOS</strong> para corte (3+ comprobantes vencidos, sin plan de pago)</li>
                    <li>Separar clientes <strong>NO APTOS</strong> (menos de 3 comprobantes o con plan activo)</li>
                    <li>Generar archivos Excel listos para procesos de gestión de cobranzas</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pyse-2">
                <AccordionTrigger>¿Cómo uso los filtros avanzados?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="font-semibold text-green-900 mb-2">📊 Filtros Disponibles:</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        <li><strong>Por barrio:</strong> Selecciona uno o múltiples barrios</li>
                        <li><strong>Límite por barrio:</strong> Procesa máximo N clientes por barrio (útil para trabajo diario)</li>
                        <li><strong>Offset por barrio:</strong> Salta las primeras N cuentas de cada barrio (para continuar al día siguiente)</li>
                        <li><strong>Comprobantes vencidos:</strong> Filtrar por cantidad mínima y máxima de comprobantes vencidos</li>
                        <li><strong>Deuda total:</strong> Filtrar por montos mínimos y máximos de deuda</li>
                      </ul>
                    </div>
                    <p className="text-sm text-gray-600">
                      💡 <strong>Ejemplo práctico:</strong> Hoy procesas 100 clientes del barrio &quot;Centro&quot; (offset=0, límite=100). 
                      Mañana procesas los siguientes 100 (offset=100, límite=100).
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pyse-3">
                <AccordionTrigger>¿Qué es el &quot;Relevamiento para Visitas&quot;?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Es un Excel simplificado con 6 columnas diseñado para trabajo en campo:
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-blue-200">
                          <th className="text-left p-2">Columna</th>
                          <th className="text-left p-2">Descripción</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="p-2">UF</td><td className="p-2">Unidad de facturación (identificador único)</td></tr>
                        <tr><td className="p-2">Dirección</td><td className="p-2">Calle + Barrio del cliente</td></tr>
                        <tr><td className="p-2">Teléfono</td><td className="p-2">Para contacto directo</td></tr>
                        <tr><td className="p-2">Total Deuda</td><td className="p-2">Monto adeudado</td></tr>
                        <tr><td className="p-2">Conexión</td><td className="p-2">(Vacío) Para completar en campo</td></tr>
                        <tr><td className="p-2">Observación</td><td className="p-2">(Vacío) Para notas del operador</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    ✅ Ideal para imprimirlo y llevarlo en las visitas domiciliarias.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Sección 3: Próximos a Vencer */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-amber-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">3</span>
              Próximos a Vencer
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="prox-1">
                <AccordionTrigger>¿Qué es &quot;Próximos a Vencer&quot;?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Es un recordatorio automático para clientes con <strong>planes de pago</strong> cuyas cuotas 
                    están próximas a vencer (dentro del mes actual).
                  </p>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="font-semibold text-amber-900 mb-2">🎯 Objetivo:</p>
                    <p className="text-sm text-gray-600">
                      💡 <strong>Ejemplo práctico:</strong> Hoy procesas 100 clientes del barrio &quot;Centro&quot; (offset=0, límite=100). 
                      antes de la fecha de vencimiento.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="prox-2">
                <AccordionTrigger>¿Cómo configuro los días de anticipación?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    El sistema calcula automáticamente hasta el <strong>final del mes actual</strong>. Por ejemplo:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Si hoy es 5 de noviembre → busca cuotas que vencen hasta el 30 de noviembre</li>
                    <li>Los días de anticipación se muestran en la interfaz</li>
                    <li>No necesitas configurar manualmente las fechas</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Sección 4: WhatsApp */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">4</span>
              Conexión de WhatsApp
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="wa-1">
                <AccordionTrigger>¿Por qué no puedo enviar mensajes?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Verifica que:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>✅ La sesión de WhatsApp esté iniciada (ícono en el navbar debe estar verde)</li>
                    <li>✅ El QR haya sido escaneado con tu celular</li>
                    <li>✅ El celular tenga conexión a internet</li>
                    <li>✅ No hay mensaje de &quot;Sincronizando...&quot; (espera a que termine)</li>
                  </ul>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200 mt-3">
                    <p className="text-sm text-red-900">
                      ⚠️ <strong>Si el problema persiste:</strong> Cierra la sesión y vuelve a escanear el QR.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="wa-2">
                <AccordionTrigger>¿El QR no se regenera?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    El QR se regenera automáticamente cada 60 segundos si no fue escaneado. Si no aparece:
                  </p>
                  <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                    <li>Recarga la página</li>
                    <li>Cierra sesión de WhatsApp</li>
                    <li>Vuelve a iniciar sesión</li>
                    <li>Si el problema persiste, contacta a soporte</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Sección 5: Recuperar Archivos */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">5</span>
              Recuperar Archivos
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="arch-1">
                <AccordionTrigger>¿Dónde están mis archivos generados?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Todos los archivos Excel y PDFs que generas se guardan automáticamente en la nube (Supabase Storage). 
                    Puedes acceder a ellos desde la página <strong>/recuperar-archivos</strong>.
                  </p>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-900 mb-2">📁 Tipos de archivos guardados:</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>Archivos APTOS y NO APTOS (Filtrar Clientes)</li>
                      <li>Relevamiento para Visitas</li>
                      <li>Resultados de Envío de Deudas</li>
                      <li>Archivos de Próximos a Vencer</li>
                      <li>Documentos PDF generados</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Soporte */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <h3 className="text-xl font-semibold mb-3 text-purple-900">
              💬 ¿Necesitas más ayuda?
            </h3>
            <p className="text-gray-700 mb-4">
              Si tu pregunta no está aquí, contacta a nuestro equipo de soporte:
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/3513479404"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Contactar por WhatsApp
              </a>
              <p className="text-sm text-gray-600">
                +54 351 347-9404
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </>
      )}

      {/* Tutorials View */}
      {activeView === 'tutorials' && (
        <>
          {/* Tutorials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 no-print">
            {tutorials.map((tutorial) => (
              <Card
                key={tutorial.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300"
                onClick={() => setActiveTutorial(tutorial.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {tutorial.title}
                    </h3>
                    <Badge
                      variant={tutorial.difficulty === 'Fácil' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {tutorial.difficulty}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{tutorial.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {tutorial.steps.length} pasos
                    </span>
                    <span className="flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      {tutorial.duration}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Active Tutorial Detail */}
          {activeTutorial && (
            <Card ref={tutorialDetailRef} className="border-2 border-purple-300 shadow-2xl">
              <CardContent className="p-8">
                {tutorials
                  .filter((t) => t.id === activeTutorial)
                  .map((tutorial) => (
                    <div key={tutorial.id}>
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            {tutorial.title}
                          </h2>
                          <p className="text-gray-600">{tutorial.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => setActiveTutorial(null)}
                          className="text-gray-500 hover:text-gray-700 no-print"
                        >
                          Cerrar
                        </Button>
                      </div>

                      {/* Steps */}
                      <div className="space-y-6">
                        {tutorial.steps.map((step) => (
                          <div
                            key={step.number}
                            className="flex gap-4 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
                          >
                            {/* Step Number */}
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {step.number}
                              </div>
                            </div>

                            {/* Step Content */}
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {step.title}
                              </h3>
                              <p className="text-gray-700 font-medium mb-2">
                                {step.description}
                              </p>
                              {/* @ts-ignore */}
                              {step.preview && (
                                <div className="mb-3">
                                  {/* @ts-ignore */}
                                  {step.preview}
                                </div>
                              )}
                              <p className="text-gray-600 text-sm mb-3">
                                {step.details}
                              </p>
                              {step.tip && (
                                <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded border border-yellow-200">
                                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-semibold text-yellow-900">
                                      💡 Tip:
                                    </p>
                                    <p className="text-sm text-yellow-800">
                                      {step.tip}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Completion Badge */}
                      <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 text-center">
                        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-green-900 mb-2">
                          ¡Excelente trabajo!
                        </h3>
                        <p className="text-green-700 mb-4">
                          Ahora dominas esta función. Practica para ganar confianza.
                        </p>
                        
                        {/* Opción de imprimir tutorial */}
                        <div className="mt-6 pt-6 border-t border-green-200 no-print">
                          <div className="bg-white rounded-lg p-4 border border-green-200">
                            <div className="flex items-center justify-center gap-3 mb-3">
                              <Printer className="w-5 h-5 text-purple-600" />
                              <h4 className="font-semibold text-gray-900">Opción de imprimir en PDF</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              Puedes imprimir el archivo de resultados directamente desde Excel o convertirlo a PDF para archivarlo. 
                              Esto es útil para mantener registros físicos de los envíos realizados.
                            </p>
                            <div className="flex items-center justify-center">
                              <Button
                                onClick={() => window.print()}
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <Printer className="w-4 h-4" />
                                Imprimir Tutorial
                              </Button>
                            </div>
                            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                              <p className="text-xs text-yellow-900">
                                <span className="font-semibold">💡 Tip:</span> En Excel: Archivo → Imprimir → Guardar como PDF
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
