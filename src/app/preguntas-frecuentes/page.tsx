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
import { HelpCircle, BookOpen, Video, FileQuestion, Phone, Play, CheckCircle2, AlertCircle, Info, Upload, Send, Download, Printer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { ButtonPreview } from '@/components/ButtonPreview'
import { PageHeader } from '@/components/PageHeader'

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
      title: '📤 Enviar Comprobantes de Deuda por WhatsApp',
      difficulty: 'Fácil',
      duration: '8 min',
      description: 'Envía notificaciones masivas de deuda con comprobantes PDF adjuntos via WhatsApp Cloud API',
      steps: [
        {
          number: 1,
          title: 'Accede al módulo SendDebts',
          description: 'Desde el menú principal, haz clic en "Enviar Deudas"',
          details: 'Verás un wizard de 3 pasos que te guiará por todo el proceso: Cargar Archivo → Enviar Mensajes → Descargar Resultados.',
          tip: 'El sistema utiliza WhatsApp Cloud API oficial de Meta, no requiere tener el celular conectado',
          preview: <ButtonPreview label="Enviar Deudas" icon={Send} variant="default" />
        },
        {
          number: 2,
          title: 'Carga el archivo Excel',
          description: 'Arrastra o selecciona tu archivo Excel con datos de clientes',
          details: 'El archivo debe contener las columnas: unidad (UF), Cliente_01 (nombre), tel_uni y/o tel_clien (teléfonos). Columnas opcionales: tipo_plan, plan_num, barrio, totalDeuda, etc. Máximo 10,000 registros por archivo.',
          tip: '⚠️ El sistema validará automáticamente el formato. Al menos uno de los teléfonos (tel_uni o tel_clien) debe ser válido (8-15 dígitos)',
          preview: <ButtonPreview label="Seleccionar archivo" icon={Upload} variant="outline" />
        },
        {
          number: 3,
          title: 'Verificación automática de WhatsApp',
          description: 'El sistema filtra clientes con WhatsApp válido',
          details: 'Automáticamente se verifican los números y se separan en dos archivos: clientes CON WhatsApp (listos para envío) y clientes SIN WhatsApp (para gestión alternativa). Esta verificación usa caché inteligente (90% más rápido en cargas repetidas).',
          tip: '💡 Los clientes sin WhatsApp se guardan en un archivo separado que podrás descargar al final'
        },
        {
          number: 4,
          title: 'Revisa las opciones de envío',
          description: 'El mensaje usa una plantilla oficial de Meta (NO editable)',
          details: 'La plantilla incluye: saludo personalizado con nombre del cliente, información sobre el vencimiento, PDF del comprobante adjunto, y botón de respuesta. El texto está pre-aprobado por Meta y no puede modificarse.',
          tip: '⚠️ IMPORTANTE: Las plantillas son fijas para cumplir con las políticas de WhatsApp Business API'
        },
        {
          number: 5,
          title: 'Opción de Intimación (si disponible)',
          description: 'Activa la casilla "Incluir Intimación" si corresponde',
          details: 'La intimación es un documento legal adicional que se genera SOLO si el cliente está cargado en la base de datos de Aqua con datos completos: dirección, barrio, manzana, lote (formato UF: unidad-distrito-zona-manzana-parcela). Sin estos datos, la opción no estará disponible.',
          tip: '⚠️ REQUISITO: El cliente debe tener UF con 5 partes separadas por guión para generar intimación legal'
        },
        {
          number: 6,
          title: 'Inicia el envío masivo',
          description: 'Haz clic en "Enviar" y monitorea el progreso en tiempo real',
          details: 'Verás: total de mensajes, enviados, exitosos, fallidos. El sistema genera un PDF de comprobante para cada cliente y lo envía por WhatsApp. Delays automáticos de 3-10 segundos entre mensajes para protección anti-ban.',
          tip: 'El progreso se actualiza via WebSocket en tiempo real. Cuota diaria: 300 mensajes (excedente tiene cargo adicional)',
          preview: <ButtonPreview label="Enviar mensajes →" icon={Send} variant="default" />
        },
        {
          number: 7,
          title: 'Descarga los resultados',
          description: 'Obtén el Excel con el estado de cada envío',
          details: 'Archivo "resultado-procesamiento.xlsx": incluye columna "motivo" que indica la razón si no se pudo enviar (sin WhatsApp, error de conexión, etc.). También disponible: archivo de clientes sin WhatsApp.',
          tip: '💡 Filtra por la columna "motivo" para identificar clientes que necesitan reenvío o gestión alternativa',
          preview: <ButtonPreview label="Descargar resultados" icon={Download} variant="default" />
        },
        {
          number: 8,
          title: 'Manejo de errores comunes',
          description: 'Qué hacer si algo falla durante el proceso',
          details: 'Si Espacio Clientes está caído: la columna "motivo" indicará "no se pudo generar comprobante", reenvía esos clientes más tarde. Si hay timeout: el sistema guarda respaldo automático en "Recuperar Archivos". Si WhatsApp falla: verifica las credenciales en Admin → WhatsApp.',
          tip: '💡 Los archivos se guardan automáticamente cada 5 minutos como respaldo en caso de interrupción'
        }
      ]
    },
    {
      id: 'filtrar-clientes',
      title: '🔍 Filtrar Clientes para PYSE',
      difficulty: 'Intermedio',
      duration: '10 min',
      description: 'Clasifica clientes en APTOS y NO APTOS según criterios de deuda para gestión de cortes',
      steps: [
        {
          number: 1,
          title: 'Accede al módulo Filtrar Clientes',
          description: 'Desde el menú, selecciona "Filtrar Clientes"',
          details: 'Este módulo consulta la API de Aguas Cordobesas (PYSE) para verificar deudas en tiempo real y clasificar clientes según criterios específicos.',
          tip: 'El sistema tiene límite de 500 consultas/hora a la API de Aguas Cordobesas'
        },
        {
          number: 2,
          title: 'Configura los filtros de selección',
          description: 'Usa los múltiples filtros disponibles para segmentar',
          details: 'Filtros disponibles: Búsqueda por texto (titular, UF, barrio), Teléfono (todos/con teléfono/sin teléfono), Estado de notificación (Pendiente/Notificado/Visitado/Verificado), Barrios (selector múltiple).',
          tip: 'Combina filtros para obtener listados más específicos. El contador muestra cuántos clientes coinciden'
        },
        {
          number: 3,
          title: 'Filtro por ubicación catastral (opcional)',
          description: 'Filtra por Distrito → Zona → Manzanas',
          details: 'Solo disponible si seleccionaste barrios. Permite filtrar por número catastral: primero elige Distrito, luego Zona, y finalmente las Manzanas específicas.',
          tip: 'Útil para organizar visitas por sectores geográficos específicos'
        },
        {
          number: 4,
          title: 'Configura el rango de clientes (opcional)',
          description: 'Define "Desde" y "Hasta" para procesar en lotes',
          details: 'Ejemplo: Si un barrio tiene 500 clientes, puedes procesar del 1 al 200 hoy, y del 201 al 400 mañana. Esto ayuda a distribuir el trabajo diario.',
          tip: '💡 Día 1: Desde vacío, Hasta 200 = primeras 200 cuentas. Día 2: Desde 201, Hasta 400 = siguientes 200 cuentas'
        },
        {
          number: 5,
          title: 'Ejecuta el procesamiento',
          description: 'Haz clic en "Procesar" y espera la verificación',
          details: 'El sistema consulta a Aguas Cordobesas por cada cliente y clasifica según: APTOS = 3+ comprobantes vencidos Y sin plan de pago. NO APTOS = menos de 3 comprobantes O con plan de pago activo.',
          tip: 'El progreso se muestra en tiempo real. Puede tomar varios minutos para lotes grandes (máx 25 consultas simultáneas)'
        },
        {
          number: 6,
          title: 'Revisa las estadísticas',
          description: 'Verás un resumen del procesamiento',
          details: 'Total procesadas, cantidad APTOS, cantidad NO APTOS, errores, clientes con deuda válida, clientes con plan de pago, porcentaje de éxito.',
          tip: 'Los clientes con errores de consulta pueden reintentarse más tarde'
        },
        {
          number: 7,
          title: 'Descarga los 3 archivos Excel',
          description: 'Genera los reportes para cada clasificación',
          details: '1) APTOS-[fecha].xlsx: UF, Comprobantes Vencidos, Total Deuda, Barrio. 2) NO-APTOS-[fecha].xlsx: incluye columna "Razón" del rechazo. 3) relevamiento-visitas-[fecha].xlsx: solo APTOS con 6 columnas para campo.',
          tip: 'El relevamiento incluye columnas vacías "Conexión" y "Observación" para completar en las visitas',
          preview: <ButtonPreview label="Descargar Archivos" icon={Download} variant="default" />
        },
        {
          number: 8,
          title: 'Usa el Relevamiento en campo',
          description: 'Imprime el Excel simplificado para visitas domiciliarias',
          details: 'Columnas del relevamiento: UF (8 chars), Dirección (calle + número + barrio), Teléfono, Total Deuda, Conexión (vacío), Observación (vacío). Diseñado para llevar impreso.',
          tip: '💡 Imprime en formato horizontal (landscape) para mejor legibilidad. Completa Conexión y Observación durante la visita'
        }
      ]
    },
    {
      id: 'proximos-vencer',
      title: '⏰ Próximos a Vencer',
      difficulty: 'Fácil',
      duration: '6 min',
      description: 'Envía recordatorios preventivos a clientes con cuotas próximas a vencer en el mes actual',
      steps: [
        {
          number: 1,
          title: 'Accede al módulo Próximos a Vencer',
          description: 'Haz clic en "Próximos a Vencer" desde el menú',
          details: 'Este módulo es PREVENTIVO: notifica ANTES del vencimiento para evitar que los clientes entren en mora. Usa el mismo wizard de 3 pasos que SendDebts.',
          tip: 'Ideal para ejecutar a principios de mes o cuando se aproximan fechas de vencimiento masivas'
        },
        {
          number: 2,
          title: 'Verifica el rango de fechas automático',
          description: 'El sistema calcula automáticamente hasta fin de mes',
          details: 'Ejemplo: Si hoy es 23 de diciembre, buscará cuotas que vencen hasta el 31 de diciembre (8 días de anticipación). Si es el último día del mes, automáticamente usa el mes siguiente.',
          tip: '⚠️ No necesitas configurar fechas manualmente, el cálculo es automático'
        },
        {
          number: 3,
          title: 'Carga el archivo Excel',
          description: 'Sube el archivo con datos de planes de pago',
          details: 'Columnas obligatorias: unidad (UF 6-8 dígitos), Cliente_01 (nombre, mín 3 chars), tel_uni o tel_clien (8-15 dígitos). Columnas opcionales: tipo_plan, plan_num, barrio, etc. Máximo 1,000 registros.',
          tip: '⚠️ Al menos un teléfono debe ser válido para enviar el recordatorio',
          preview: <ButtonPreview label="Seleccionar archivo" icon={Upload} variant="outline" />
        },
        {
          number: 4,
          title: 'Verificación automática',
          description: 'El sistema filtra clientes con WhatsApp válido',
          details: 'Igual que en SendDebts: se verifica cada número, se separan los que tienen WhatsApp de los que no. La verificación usa caché inteligente para mayor velocidad.',
          tip: '💡 Los clientes sin WhatsApp se guardan en archivo separado para gestión alternativa'
        },
        {
          number: 5,
          title: 'Revisa la plantilla de recordatorio',
          description: 'El mensaje usa una plantilla oficial de Meta (NO editable)',
          details: 'Template "recordatorio_proximo_vencer": Saludo con nombre del cliente, aviso de vencimiento próximo, PDF del comprobante adjunto, botón para consultas. La variable {{1}} se reemplaza por el nombre del cliente.',
          tip: '⚠️ IMPORTANTE: Las plantillas son fijas, aprobadas por Meta, y no pueden modificarse'
        },
        {
          number: 6,
          title: 'Inicia el envío de recordatorios',
          description: 'Haz clic en "Enviar" y monitorea el progreso',
          details: 'El sistema genera PDFs y envía vía WhatsApp Cloud API. Delays automáticos de 3-10 segundos entre mensajes. Progreso en tiempo real via WebSocket.',
          tip: 'Los recordatorios tienen mejor recepción que las notificaciones de deuda. Úsalos como primera línea de prevención',
          preview: <ButtonPreview label="Enviar Recordatorios →" icon={Send} variant="default" />
        },
        {
          number: 7,
          title: 'Descarga los resultados',
          description: 'Obtén el Excel con el estado de cada envío',
          details: 'Archivo con todos los clientes procesados. Columna "motivo" indica fallos: "Sin WhatsApp válido", "Error de conexión", "Límite de envíos alcanzado", etc.',
          tip: '💡 Estos recordatorios pueden reducir significativamente la morosidad si se envían con suficiente anticipación',
          preview: <ButtonPreview label="Descargar resultados" icon={Download} variant="default" />
        }
      ]
    },
    {
      id: 'archivos',
      title: '📁 Recuperar Archivos',
      difficulty: 'Fácil',
      duration: '3 min',
      description: 'Accede a respaldos, resultados y archivos generados automáticamente por el sistema',
      steps: [
        {
          number: 1,
          title: 'Accede a Recuperar Archivos',
          description: 'Haz clic en "Archivos" desde el menú lateral',
          details: 'Aquí se guardan automáticamente: respaldos de universos cargados, archivos guardados cuando un proceso se interrumpe, backups automáticos de datos importantes.',
          tip: 'Los archivos se clasifican automáticamente por origen según el nombre'
        },
        {
          number: 2,
          title: 'Usa los filtros para encontrar archivos',
          description: 'Filtra por origen, fecha o tipo de archivo',
          details: 'Filtros disponibles: Por Origen (Sin WhatsApp, Resultado, Filtrado, Original, Otro), Por Fecha (Hoy, Última semana, Último mes), Por Tipo (extensión del archivo), Búsqueda por nombre.',
          tip: '💡 El filtro por origen detecta automáticamente archivos como "not-whatsapp", "resultado", "filtered", etc.'
        },
        {
          number: 3,
          title: 'Revisa la información de cada archivo',
          description: 'Cada archivo muestra nombre, tamaño y fecha',
          details: 'Información visible: nombre completo del archivo, tamaño formateado (KB, MB), fecha y hora de creación en zona horaria Argentina.',
          tip: 'Los archivos más recientes aparecen primero por defecto'
        },
        {
          number: 4,
          title: 'Descarga los archivos que necesites',
          description: 'Haz clic en el botón de descarga',
          details: 'El archivo se descarga instantáneamente con su nombre original. Puedes descargar el mismo archivo múltiples veces si lo necesitas.',
          tip: 'Útil para recuperar archivos de procesos interrumpidos o para acceder a resultados anteriores',
          preview: <ButtonPreview label="Descargar" icon={Download} variant="outline" />
        },
        {
          number: 5,
          title: 'Elimina archivos antiguos (con cuidado)',
          description: 'Libera espacio eliminando archivos que ya no necesites',
          details: 'Haz clic en el ícono de papelera roja. Se mostrará confirmación "¿Eliminar?" con botones Sí/No. La eliminación es PERMANENTE.',
          tip: '⚠️ Solo elimina archivos de los que ya tengas respaldo local. Mantén al menos los archivos del último mes'
        }
      ]
    },
    {
      id: 'conversaciones',
      title: '💬 Centro de Conversaciones WhatsApp',
      difficulty: 'Fácil',
      duration: '5 min',
      description: 'Gestiona las respuestas de clientes en tiempo real con interfaz estilo WhatsApp',
      steps: [
        {
          number: 1,
          title: 'Accede al Centro de Conversaciones',
          description: 'Haz clic en "Conversaciones" desde el menú lateral',
          details: 'Verás una interfaz similar a WhatsApp Web con 3 paneles: lista de conversaciones (izquierda), chat (centro), y datos del cliente (derecha, opcional).',
          tip: 'Las conversaciones se actualizan en tiempo real via WebSocket'
        },
        {
          number: 2,
          title: 'Explora la lista de conversaciones',
          description: 'El panel izquierdo muestra todas las conversaciones activas',
          details: 'Cada conversación muestra: nombre del cliente, preview del último mensaje (50 chars), tiempo relativo ("hace 5 min"), estado de lectura (✓✓ azul si fue leído), y contador de mensajes no leídos.',
          tip: 'Las conversaciones con mensajes sin leer muestran un badge verde con el número'
        },
        {
          number: 3,
          title: 'Usa los filtros para encontrar conversaciones',
          description: 'Filtra por estado o busca por nombre/teléfono',
          details: 'Filtros disponibles: Todas, No leídos, Activas (ventana 24hs vigente), Expiradas (ventana 24hs vencida). La búsqueda funciona por nombre del cliente o número de teléfono.',
          tip: '💡 Usa el filtro "No leídos" para atender primero las conversaciones pendientes'
        },
        {
          number: 4,
          title: 'Selecciona una conversación para responder',
          description: 'Haz clic en una conversación para ver el historial completo',
          details: 'El panel central muestra el chat completo con burbujas estilo WhatsApp. Mensajes entrantes en gris, salientes en verde. Los mensajes se marcan automáticamente como leídos.',
          tip: 'Los estados de mensaje: 🕐 Pendiente, ✓ Enviado, ✓✓ Entregado, ✓✓ azul Leído'
        },
        {
          number: 5,
          title: 'Responde dentro de la ventana de 24 horas (GRATIS)',
          description: 'Si la ventana está activa, escribe y envía mensajes libremente',
          details: 'Escribe tu mensaje en el campo de texto y presiona Enter o el botón enviar. Mientras la ventana de 24hs esté activa, puedes enviar mensajes de texto libre SIN COSTO adicional.',
          tip: '⚠️ La ventana de 24hs se reinicia cada vez que el cliente te escribe'
        },
        {
          number: 6,
          title: 'Responde fuera de la ventana de 24 horas (PAGO)',
          description: 'Si la ventana expiró, solo puedes enviar plantillas aprobadas',
          details: 'Verás un aviso de "Ventana expirada". Para responder, debes seleccionar una plantilla pre-aprobada por Meta. Cada plantilla tiene un costo de ~$0.047 USD.',
          tip: '💰 Las plantillas tienen costo porque inician una nueva conversación con Meta'
        },
        {
          number: 7,
          title: 'Controla el Bot automático',
          description: 'Decide si el bot responde o tomas el control manual',
          details: 'Estados: Bot ON (verde) = respuestas automáticas, Bot OFF (naranja) = atención manual. Usa "Tomar" para desactivar el bot y atender personalmente. Usa "Liberar" para reactivar el bot.',
          tip: '💡 Toma el control cuando el cliente necesita atención personalizada que el bot no puede resolver'
        },
        {
          number: 8,
          title: 'Consulta los datos del cliente',
          description: 'Abre el panel de información del cliente',
          details: 'Haz clic en el ícono de usuario en el header del chat. Verás: nombre, teléfono, número de cuenta, última deuda enviada, estado de la ventana 24hs, y última actividad.',
          tip: 'Útil para tener contexto del cliente mientras respondes'
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

      {/* Header con PageHeader */}
      <div className="no-print">
        <PageHeader
          title="Centro de Ayuda"
          description="Guía completa para usar el sistema de gestión"
          icon={HelpCircle}
          breadcrumbs={[{ label: 'FAQ' }]}
        />
      </div>

      {/* View Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 no-print">
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${activeView === 'tutorials' ? 'ring-2 ring-cyan-500 bg-cyan-50/50' : ''}`}
          onClick={() => {
            setActiveView('tutorials')
            setActiveTutorial(null)
          }}
        >
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-cyan-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Tutoriales Paso a Paso</h3>
            <p className="text-sm text-muted-foreground">Guías visuales para cada función</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${activeView === 'faq' ? 'ring-2 ring-emerald-500 bg-emerald-50/50' : ''}`}
          onClick={() => setActiveView('faq')}
        >
          <CardContent className="p-6 text-center">
            <FileQuestion className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Preguntas Frecuentes</h3>
            <p className="text-sm text-muted-foreground">Respuestas a dudas comunes</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow opacity-60">
          <CardContent className="p-6 text-center">
            <Video className="w-8 h-8 text-rose-600 mx-auto mb-3" />
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
              Enviar Comprobantes de Deuda por WhatsApp
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Qué es &quot;Enviar Deudas&quot; (SendDebts)?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Es el módulo principal para enviar notificaciones masivas de deuda con comprobantes PDF adjuntos 
                    mediante WhatsApp Cloud API oficial de Meta.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-semibold text-blue-900 mb-2">Características principales:</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>Envío masivo de hasta 10,000 clientes por archivo</li>
                      <li>Generación automática de PDF de comprobante para cada cliente</li>
                      <li>Plantillas oficiales de Meta (NO editables)</li>
                      <li>Verificación inteligente de WhatsApp con caché</li>
                      <li>Progreso en tiempo real via WebSocket</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>¿Cómo funciona el proceso (3 pasos)?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                      <div>
                        <p className="font-medium">Cargar Archivo</p>
                        <p className="text-sm text-gray-600">Sube Excel con columnas: unidad, Cliente_01, tel_uni/tel_clien. El sistema filtra automáticamente clientes con WhatsApp válido.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                      <div>
                        <p className="font-medium">Enviar Mensajes</p>
                        <p className="text-sm text-gray-600">Se generan PDFs y se envían por WhatsApp con plantilla fija. Opcionalmente incluir intimación legal.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                      <div>
                        <p className="font-medium">Descargar Resultados</p>
                        <p className="text-sm text-gray-600">Obtén Excel con estado de cada envío (columna &quot;motivo&quot; indica fallos) y archivo de clientes sin WhatsApp.</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>¿Puedo personalizar el mensaje?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    <strong>NO.</strong> Los mensajes usan plantillas oficiales de Meta que están pre-aprobadas y no pueden modificarse.
                    Esto es un requisito de WhatsApp Business API para garantizar la calidad y evitar spam.
                  </p>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="font-semibold text-amber-900 mb-2">⚠️ Plantilla fija incluye:</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>Saludo personalizado con nombre del cliente</li>
                      <li>Información sobre el vencimiento de la cuota</li>
                      <li>PDF del comprobante adjunto</li>
                      <li>Botón de respuesta para consultas</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>¿Qué es la opción de Intimación?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    La intimación es un documento legal adicional que se puede adjuntar al envío.
                    <strong> Solo está disponible si el cliente cumple requisitos específicos.</strong>
                  </p>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="font-semibold text-red-900 mb-2">⚠️ Requisitos para Intimación:</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>Cliente cargado en base de datos de Aqua</li>
                      <li>Datos completos: dirección, barrio, manzana, lote</li>
                      <li>UF con formato válido: <code>unidad-distrito-zona-manzana-parcela</code></li>
                      <li>Plan de pago vencido (no aplica a próximos a vencer)</li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    💡 Si el cliente no tiene estos datos completos, la opción de intimación no estará disponible.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>¿Qué pasa si un cliente no tiene WhatsApp?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    El sistema verifica automáticamente cada número y separa los clientes en dos archivos:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>clients-with-whatsapp-xxx.xlsx:</strong> Clientes con WhatsApp válido (se procesan)</li>
                    <li><strong>not-whatsapp-xxx.xlsx:</strong> Clientes sin WhatsApp (para gestión alternativa)</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">
                    💡 La verificación usa caché inteligente: si ya verificaste un número antes, se usa el resultado guardado (90% más rápido).
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>¿Cuál es el límite de envíos?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    El sistema tiene una cuota diaria de <strong>300 mensajes</strong>. Si necesitas enviar más:
                  </p>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="font-semibold text-amber-900 mb-2">💰 Cargos por exceso:</p>
                    <p className="text-sm text-gray-700">
                      Cada mensaje adicional sobre la cuota diaria tiene un cargo de <strong>$30 por mensaje</strong>.
                      El sistema te avisará antes de proceder.
                    </p>
                  </div>
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
                    Este módulo consulta la API de Aguas Cordobesas (PYSE) en tiempo real para clasificar clientes según su estado de deuda:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>APTOS:</strong> 3 o más comprobantes vencidos Y sin plan de pago activo</li>
                    <li><strong>NO APTOS:</strong> Menos de 3 comprobantes O con plan de pago activo</li>
                  </ul>
                  <div className="bg-blue-50 p-4 rounded-lg mt-3">
                    <p className="text-sm text-gray-600">
                      ⚠️ <strong>Límite:</strong> 500 consultas/hora a la API de Aguas Cordobesas
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pyse-2">
                <AccordionTrigger>¿Qué filtros puedo usar?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="font-semibold text-green-900 mb-2">📊 Filtros Disponibles:</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        <li><strong>Búsqueda:</strong> Por titular, UF o barrio</li>
                        <li><strong>Teléfono:</strong> Todos / Solo con teléfono / Solo sin teléfono</li>
                        <li><strong>Estado:</strong> Pendiente / Notificado / Visitado / Verificado</li>
                        <li><strong>Barrios:</strong> Selector múltiple</li>
                        <li><strong>Catastral:</strong> Distrito → Zona → Manzanas</li>
                        <li><strong>Rango:</strong> Desde N hasta M clientes por barrio</li>
                      </ul>
                    </div>
                    <p className="text-sm text-gray-600">
                      💡 <strong>Ejemplo:</strong> Procesar clientes 1-200 del barrio &quot;Centro&quot; hoy, y 201-400 mañana.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pyse-3">
                <AccordionTrigger>¿Qué archivos genera el proceso?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Se generan <strong>3 archivos Excel</strong>:
                  </p>
                  <div className="space-y-3">
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="font-semibold text-green-900">1. APTOS-[fecha].xlsx</p>
                      <p className="text-sm text-gray-600">UF, Comprobantes Vencidos, Total Deuda, Barrio, Tiene Plan Pago</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <p className="font-semibold text-red-900">2. NO-APTOS-[fecha].xlsx</p>
                      <p className="text-sm text-gray-600">Igual que APTOS + columna &quot;Razón&quot; del rechazo</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="font-semibold text-blue-900">3. relevamiento-visitas-[fecha].xlsx</p>
                      <p className="text-sm text-gray-600">Solo APTOS con 6 columnas: UF, Dirección, Teléfono, Deuda, Conexión (vacío), Observación (vacío)</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pyse-4">
                <AccordionTrigger>¿Qué es el &quot;Relevamiento para Visitas&quot;?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Es un Excel simplificado con <strong>solo clientes APTOS</strong>, diseñado para imprimir y llevar a campo:
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
                        <tr><td className="p-2">UF</td><td className="p-2">Unidad de facturación (8 chars)</td></tr>
                        <tr><td className="p-2">Dirección</td><td className="p-2">Calle + Número + Barrio</td></tr>
                        <tr><td className="p-2">Teléfono</td><td className="p-2">Para contacto directo</td></tr>
                        <tr><td className="p-2">Total Deuda</td><td className="p-2">Monto adeudado</td></tr>
                        <tr><td className="p-2">Conexión</td><td className="p-2"><strong>(Vacío)</strong> Para completar en campo</td></tr>
                        <tr><td className="p-2">Observación</td><td className="p-2"><strong>(Vacío)</strong> Para notas del operador</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    💡 Imprime en formato horizontal (landscape) para mejor legibilidad.
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
                    Es un módulo <strong>preventivo</strong> para enviar recordatorios a clientes con cuotas 
                    próximas a vencer dentro del mes actual. Usa el mismo flujo de 3 pasos que SendDebts.
                  </p>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="font-semibold text-amber-900 mb-2">🎯 Objetivo:</p>
                    <p className="text-sm text-gray-600">
                      Notificar ANTES del vencimiento para evitar que los clientes entren en mora. 
                      Estos recordatorios tienen mejor recepción que las notificaciones de deuda.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="prox-2">
                <AccordionTrigger>¿Cómo se calculan los días de anticipación?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    El sistema calcula <strong>automáticamente</strong> hasta el final del mes actual:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Si hoy es 23 de diciembre → busca cuotas que vencen hasta el 31 de diciembre (8 días)</li>
                    <li>Si es el último día del mes → automáticamente usa el mes siguiente</li>
                    <li>No necesitas configurar fechas manualmente</li>
                  </ul>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-3">
                    <p className="text-sm text-blue-900">
                      💡 El rango de fechas se muestra en la interfaz: &quot;Hoy&quot; hasta &quot;Último día del mes&quot;
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="prox-3">
                <AccordionTrigger>¿Qué archivo Excel necesito?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Columnas obligatorias del archivo:
                  </p>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-amber-200">
                          <th className="text-left p-2">Columna</th>
                          <th className="text-left p-2">Requisitos</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="p-2 font-semibold">unidad</td><td className="p-2">UF de 6-8 dígitos, único, mayor a 0</td></tr>
                        <tr><td className="p-2 font-semibold">Cliente_01</td><td className="p-2">Nombre del cliente (mín 3 caracteres)</td></tr>
                        <tr><td className="p-2 font-semibold">tel_uni o tel_clien</td><td className="p-2">Al menos uno válido (8-15 dígitos)</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    ⚠️ Máximo 1,000 registros por archivo. El sistema validará el formato automáticamente.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="prox-4">
                <AccordionTrigger>¿Puedo personalizar el mensaje?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    <strong>NO.</strong> Al igual que SendDebts, los mensajes usan plantillas oficiales de Meta.
                  </p>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="font-semibold text-amber-900 mb-2">📋 Template &quot;recordatorio_proximo_vencer&quot;:</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>Saludo con nombre del cliente (variable)</li>
                      <li>Aviso de vencimiento próximo</li>
                      <li>PDF del comprobante adjunto</li>
                      <li>Botón de respuesta para consultas</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Sección 4: WhatsApp Cloud API */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">4</span>
              WhatsApp Business Cloud API
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="wa-1">
                <AccordionTrigger>¿Cómo funciona WhatsApp Cloud API?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Aqua utiliza la <strong>API oficial de WhatsApp Business</strong> de Meta. A diferencia del método anterior (QR), 
                    esta integración es completamente oficial, segura y no requiere tener el celular conectado.
                  </p>
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <p className="font-semibold text-emerald-900 mb-2">✅ Ventajas de Cloud API:</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>No necesitas escanear QR ni tener el celular conectado</li>
                      <li>Envío de mensajes 100% oficial y sin riesgo de bloqueos</li>
                      <li>Uso de plantillas (templates) aprobadas por Meta</li>
                      <li>1,000 conversaciones gratuitas por mes</li>
                      <li>Mayor velocidad y confiabilidad de envío</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="wa-2">
                <AccordionTrigger>¿Cómo configuro WhatsApp Cloud API?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    La configuración requiere crear una cuenta en Meta Business y obtener credenciales:
                  </p>
                  <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Phone Number ID:</strong> Identificador de tu número de WhatsApp Business</li>
                    <li><strong>Access Token:</strong> Token de acceso permanente (generado en Meta)</li>
                    <li><strong>Business Account ID:</strong> ID de tu cuenta de negocio en Meta</li>
                  </ol>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-3">
                    <p className="text-sm text-blue-900">
                      📖 <strong>Documentación:</strong> Consulta la guía oficial en <a href="https://developers.facebook.com/docs/whatsapp" target="_blank" rel="noopener noreferrer" className="underline">developers.facebook.com/docs/whatsapp</a>
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="wa-3">
                <AccordionTrigger>¿Cuánto cuesta usar WhatsApp Cloud API?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Meta ofrece <strong>1,000 conversaciones gratuitas por mes</strong>. Después se cobra por conversación:
                  </p>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-amber-200">
                          <th className="text-left p-2">Tipo</th>
                          <th className="text-left p-2">Costo aproximado (Argentina)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="p-2">Primeras 1,000 conversaciones</td><td className="p-2 text-green-700 font-semibold">GRATIS</td></tr>
                        <tr><td className="p-2">Conversación de utilidad (templates)</td><td className="p-2">~$0.008 USD</td></tr>
                        <tr><td className="p-2">Conversación de marketing</td><td className="p-2">~$0.025 USD</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    💡 <strong>Tip:</strong> Puedes monitorear tu uso en la sección <strong>WhatsApp → Uso</strong>
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="wa-4">
                <AccordionTrigger>¿Qué son las plantillas (templates) de WhatsApp?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Los templates son mensajes pre-aprobados por Meta que puedes usar para iniciar conversaciones. 
                    Se usan para enviar comprobantes, recordatorios de pago y notificaciones.
                  </p>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="font-semibold text-purple-900 mb-2">📋 Templates disponibles en Aqua:</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li><strong>comprobante_personal_v3:</strong> Envío de comprobante de deuda con PDF</li>
                      <li><strong>recordatorio_pago_v3:</strong> Recordatorio de cuotas próximas a vencer</li>
                      <li><strong>intimacion_v1:</strong> Notificación de intimación formal</li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    ⚠️ Los templates deben estar aprobados por Meta antes de poder usarlos.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="wa-5">
                <AccordionTrigger>¿Por qué no puedo enviar mensajes?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Verifica los siguientes puntos:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>✅ Las credenciales estén correctamente configuradas (Admin → WhatsApp)</li>
                    <li>✅ El Access Token no haya expirado</li>
                    <li>✅ Los templates estén aprobados por Meta</li>
                    <li>✅ El número destino tenga WhatsApp activo</li>
                    <li>✅ No hayas excedido los límites de envío de Meta</li>
                  </ul>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200 mt-3">
                    <p className="text-sm text-red-900">
                      ⚠️ <strong>Si el problema persiste:</strong> Verifica las credenciales en Admin → WhatsApp → Configuración y contacta a soporte.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="wa-6">
                <AccordionTrigger>¿Cómo veo mi consumo de conversaciones?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Puedes monitorear tu uso en tiempo real desde la sección <strong>WhatsApp → Uso</strong>:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>📊 Conversaciones del mes actual</li>
                    <li>🆓 Conversaciones gratuitas restantes (de 1,000)</li>
                    <li>💰 Costo acumulado si superaste el free tier</li>
                    <li>📈 Proyección mensual basada en tu historial</li>
                    <li>🎯 Distribución por tipo de mensaje</li>
                  </ul>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-3">
                    <p className="text-sm text-blue-900">
                      💡 <strong>Indicador en navbar:</strong> Verás un badge de color (verde/amarillo/rojo) que indica tu consumo actual.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Sección 5: Conversaciones */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">5</span>
              Centro de Conversaciones
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="conv-1">
                <AccordionTrigger>¿Qué es el Centro de Conversaciones?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Es una interfaz estilo WhatsApp Web para gestionar las respuestas de clientes en tiempo real.
                    Aquí ves todos los mensajes que los clientes envían después de recibir sus comprobantes.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-900 mb-2">📱 Características:</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li>Chat en tiempo real con actualizaciones via WebSocket</li>
                      <li>Control del bot automático (activar/desactivar)</li>
                      <li>Gestión de la ventana de 24 horas de WhatsApp</li>
                      <li>Panel de información del cliente</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="conv-2">
                <AccordionTrigger>¿Qué es la &quot;Ventana de 24 horas&quot;?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Es una regla de WhatsApp Business API: cuando un cliente te escribe, tienes 24 horas para responder 
                    con mensajes de texto libre <strong>SIN COSTO adicional</strong>.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="font-semibold text-green-900">✅ Dentro de las 24hs:</p>
                      <p className="text-sm text-gray-600">Puedes enviar mensajes de texto libre GRATIS</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded border border-amber-200">
                      <p className="font-semibold text-amber-900">⚠️ Después de las 24hs:</p>
                      <p className="text-sm text-gray-600">Solo puedes enviar plantillas aprobadas (~$0.047 USD cada una)</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    💡 La ventana se reinicia cada vez que el cliente te escribe un nuevo mensaje.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="conv-3">
                <AccordionTrigger>¿Cómo funciona el Bot automático?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    El bot responde automáticamente a mensajes comunes de los clientes. Puedes controlarlo:
                  </p>
                  <div className="space-y-3">
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="font-semibold text-green-900">🟢 Bot ON (verde):</p>
                      <p className="text-sm text-gray-600">El bot responde automáticamente las consultas comunes</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded border border-amber-200">
                      <p className="font-semibold text-amber-900">🟠 Bot OFF (naranja):</p>
                      <p className="text-sm text-gray-600">Atención manual - tú respondes directamente</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    💡 Usa <strong>&quot;Tomar&quot;</strong> para desactivar el bot y atender personalmente. 
                    Usa <strong>&quot;Liberar&quot;</strong> para reactivar el bot.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="conv-4">
                <AccordionTrigger>¿Qué significan los estados de los mensajes?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 mb-3">
                    Los íconos de check indican el estado de entrega del mensaje:
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-blue-200">
                          <th className="text-left p-2">Ícono</th>
                          <th className="text-left p-2">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="p-2">🕐</td><td className="p-2">Pendiente de envío</td></tr>
                        <tr><td className="p-2">✓</td><td className="p-2">Enviado al servidor</td></tr>
                        <tr><td className="p-2">✓✓</td><td className="p-2">Entregado al cliente</td></tr>
                        <tr><td className="p-2">✓✓ <span className="text-blue-500">azul</span></td><td className="p-2">Leído por el cliente</td></tr>
                        <tr><td className="p-2">⚠️</td><td className="p-2">Error en el envío</td></tr>
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Sección 6: Recuperar Archivos */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">6</span>
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
