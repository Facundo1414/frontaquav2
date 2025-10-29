'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ArrowLeft, HelpCircle, BookOpen, Video, FileQuestion } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PreguntasFrecuentesPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto p-6 max-w-5xl">
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
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Preguntas Frecuentes e Instructivos</h1>
            <p className="text-muted-foreground">
              Guía completa para usar el sistema de gestión de deudas
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Tutoriales Paso a Paso</h3>
            <p className="text-sm text-gray-600">Guías visuales para cada función</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <FileQuestion className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Preguntas Frecuentes</h3>
            <p className="text-sm text-gray-600">Respuestas a dudas comunes</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Video className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Video Tutoriales</h3>
            <p className="text-sm text-gray-600">Próximamente disponibles</p>
          </CardContent>
        </Card>
      </div>

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
                      <li>Para recordar a clientes sobre planes de pago (PCB1 o ATC2)</li>
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
                <AccordionTrigger>¿Qué es PYSE y para qué sirve este filtrado?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    PYSE es el Programa de Suspensión de Energía. Esta función te permite:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Identificar automáticamente clientes <strong>APTOS</strong> para PYSE (3+ consumos vencidos, sin plan de pago)</li>
                    <li>Separar clientes <strong>NO APTOS</strong> (menos de 3 consumos o con plan activo)</li>
                    <li>Generar archivos Excel listos para cargar en tu sistema PYSE</li>
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
                        <li><strong>Offset:</strong> Salta las primeras N cuentas (para continuar al día siguiente)</li>
                        <li><strong>Comprobantes vencidos:</strong> Rango de 3+ consumos</li>
                        <li><strong>Deuda total:</strong> Filtrar por montos mínimos/máximos</li>
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
                <AccordionTrigger>¿Qué es el &quot;Machete para Visitas&quot;?</AccordionTrigger>
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
                        <tr><td className="p-2">UF</td><td className="p-2">Número de unidad funcional</td></tr>
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
                    <li>Si hoy es 28 de octubre → busca cuotas que vencen hasta el 31 de octubre</li>
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
                      <li>Machete para Visitas</li>
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
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="bg-purple-600 hover:bg-purple-700">
                📧 Enviar Email a Soporte
              </Button>
              <Button variant="outline">
                📞 Llamar al +54 351 XXX-XXXX
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
