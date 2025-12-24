'use client'

import {  useState } from 'react'
import { useRouter } from 'next/navigation'
import { Filter, MessageCircle, Check, Send, Clock, FileArchive, Database, HelpCircle, Settings } from 'lucide-react'
import { ServiceCard } from './components/ServiceCard'
import { ModalEnDesarrollo } from './components/modal-en-desarrollo'
import { WhatsappUsageWidget } from './components/WhatsappUsageWidget'
import { WhatsAppCloudAPINoticeModal, useWhatsAppCloudAPINotice } from './components/WhatsAppCloudAPINoticeModal'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { RequiresPlan } from '@/components/subscription'
import { useWhatsappNavigation } from '@/hooks/useWhatsappNavigation'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'
import { useJobRecovery } from '@/hooks/useJobRecovery'
import { OnboardingTour, StartTourButton } from '@/components/OnboardingTour'
import { TooltipProvider } from '@/components/ui/tooltip'


export default function HomePage() {
  const router = useRouter()
  const [modalDevVisible, setModalDevVisible] = useState(false)
  const [isTourOpen, setIsTourOpen] = useState(false)
  
  // Hook para el modal de aviso WhatsApp Cloud API
  const { showNotice, setShowNotice } = useWhatsAppCloudAPINotice()
  
  const { userId } = useGlobalContext()
  
  // Hook centralizado para navegación con validación WhatsApp
  const { navigateWithWhatsappCheck, isAdmin } = useWhatsappNavigation()

  // Hook para obtener mensajes sin leer
  const { unreadCount } = useUnreadMessages()
  
  // Hook para detectar procesos en curso
  const { activeJobs, hasActiveJobs, recoverJob } = useJobRecovery()

  // Obtener jobs activos por tipo
  const sendDebtsJob = activeJobs.find(j => j.type === 'senddebts')
  const proximosVencerJob = activeJobs.find(j => j.type === 'proximos_vencer')

  // Pasos del tour de onboarding - Completo
  const tourSteps = [
    {
      target: '[data-tour="whatsapp-usage"]',
      title: '📊 Monitor de Mensajes',
      content: 'Aquí puedes ver cuántos mensajes WhatsApp te quedan disponibles este mes y monitorear tu consumo en tiempo real.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="enviar-comprobantes"]',
      title: '📨 Envío de Comprobantes Vencidos',
      content: 'Envía automáticamente por WhatsApp los comprobantes de deuda vencidos a todos tus clientes con plan de pago activo.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="proximos-vencer"]',
      title: '⏰ Próximos a Vencer',
      content: 'Envía recordatorios preventivos a clientes cuya cuota está próxima a vencer. Ideal para reducir la morosidad.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="conversaciones"]',
      title: '💬 Conversaciones WhatsApp',
      content: 'Gestiona las respuestas de tus clientes desde un panel centralizado. Verás una notificación cuando tengas mensajes sin leer.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="filtrar-clientes"]',
      title: '🔍 Filtrar Clientes PYSE',
      content: 'Selecciona barrios específicos y genera un Excel con clientes aptos y no aptos para PYSE.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="verificar-planes"]',
      title: '✅ Verificar Planes de Pago',
      content: 'Consulta rápidamente qué clientes tienen planes de pago vigentes y el estado de sus cuotas.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="base-clientes"]',
      title: '📋 Base de Clientes',
      content: 'Importa y actualiza tu base de clientes desde archivos Excel. Mantén la información de contacto siempre actualizada.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="recuperar-archivos"]',
      title: '📁 Recuperar Archivos',
      content: 'Accede a los archivos Excel y reportes generados en procesos anteriores. Útil para descargar respaldos.',
      position: 'bottom' as const,
    },
    {
      target: '[data-tour="faq"]',
      title: '❓ Preguntas Frecuentes',
      content: '¿Tienes dudas? Encuentra respuestas a las preguntas más comunes sobre cómo usar AQUA.',
      position: 'left' as const,
    },
  ]

  const handleClick = () => {
    navigateWithWhatsappCheck('/senddebts')
  }

  const handleClickProximosVencer = () => {
    navigateWithWhatsappCheck('/proximos-vencer')
  }

  const handleClickFiltrarClientes = () => {
    // No necesita sesión WhatsApp, va directo al filtro
    router.push('/filtrar-clientes')
  }

  const handleClickVerificarPlanesPago = () => {
  // Nueva funcionalidad para verificar planes de pago vigentes
  router.push('/verificar-planes-pago')
}

const handleClickRecuperarArchivos = () => {
  // Página independiente para recuperar archivos de respaldo
  router.push('/recuperar-archivos')
}

const handleClickGenerarDocumentosWhatsApp = () => {
  // Página unificada para generar PDFs de deuda y notificaciones
  router.push('/generar-documentos-whatsapp')
}

const handleClickClientesDatabase = () => {
  // Página para importar y gestionar clientes desde Excel
  router.push('/clientes-database')
}

const handleClickFAQ = () => {
  // Página de preguntas frecuentes
  router.push('/preguntas-frecuentes')
}

  // Eliminada lógica de init duplicada: el modal ya llama a /init y abre SSE.





  // Mensajes claros según status
  const statusMessages: Record<string, string> = {
    none: 'Iniciá sesión para comenzar.',
    launching: 'Inicializando...',
    waiting_qr: 'Escaneá el QR para iniciar sesión.',
    syncing: 'Autenticado. Sincronizando...',
    ready: 'Sesión lista.',
    closing: 'Cerrando sesión...'
  }

  function getAccessToken(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') || ''
    }
    return ''
  }

  return (
  <TooltipProvider>
  <div className="w-full min-h-screen px-6 pb-10 pt-2">
      {/* Tour de onboarding - controlado por el usuario */}
      <OnboardingTour 
        steps={tourSteps} 
        tourId="home-tour-v1"
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onComplete={() => console.log('Tour completado')}
      />

      {/* Header - Más profesional y elegante */}
      <div className="relative flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-8 mb-8 overflow-hidden shadow-card">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white tracking-tight">AQUA</h1>
          <p className="text-slate-300 mt-1 font-light">Sistema de gestión inteligente</p>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          {/* Botón Tour - Bien visible en el header */}
          <StartTourButton 
            onClick={() => setIsTourOpen(true)} 
            variant="compact"
          />
          <img src="/logoWater.png" alt="Logo" className="h-28 object-contain opacity-90" />
        </div>
      </div>

      {/* Widget de Cuota de Mensajes WhatsApp Cloud API */}
      {userId && (
        <div className="mb-8" data-tour="whatsapp-usage">
          <WhatsappUsageWidget />
        </div>
      )}

      {/* Servicios Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Servicios Disponibles</h2>
        <p className="text-muted-foreground text-base max-w-xl mx-auto mt-2">
          Automatiza tu comunicación con clientes de forma simple y eficiente
        </p>
        <div className="w-12 h-1 bg-gradient-to-r from-cyan-500 to-teal-500 mx-auto mt-4 rounded-full" />
      </div>

      {/* Tarjetas de Servicios - Organizadas por categoría */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* === SECCIÓN: COMUNICACIÓN / WHATSAPP (Cyan/Teal) === */}
        <RequiresPlan plan="PRO">
          <div data-tour="enviar-comprobantes">
            <ServiceCard
              icon={<Send className="w-6 h-6 text-white" />}
              title="Enviar Comprobantes Vencidos"
              description="Envía comprobantes vencidos a clientes con plan de pago"
              onClick={handleClick}
              color="bg-teal-500"
              tooltip="Envía automáticamente por WhatsApp los comprobantes de deuda vencidos a todos los clientes con plan de pago activo"
              pendingAction={sendDebtsJob ? {
                label: `Continuar envío (${sendDebtsJob.processedItems ?? 0}/${sendDebtsJob.totalItems ?? '?'})`,
                onClick: () => recoverJob(sendDebtsJob.jobId)
              } : undefined}
            />
          </div>
        </RequiresPlan>
        <RequiresPlan plan="PRO">
          <div data-tour="proximos-vencer">
            <ServiceCard
              icon={<Clock className="w-6 h-6 text-white" />}
              title="Notificar Próximos a Vencer"
              description="Avisa a clientes con plan de pago próximos a vencer"
              onClick={handleClickProximosVencer}
              color="bg-orange-500"
              tooltip="Envía recordatorios preventivos a clientes cuya cuota está próxima a vencer"
              pendingAction={proximosVencerJob ? {
                label: `Continuar envío (${proximosVencerJob.processedItems ?? 0}/${proximosVencerJob.totalItems ?? '?'})`,
                onClick: () => recoverJob(proximosVencerJob.jobId)
              } : undefined}
            />
          </div>
        </RequiresPlan>
        <div data-tour="conversaciones">
          <ServiceCard
            icon={<MessageCircle className="w-6 h-6 text-white" />}
            title="Conversaciones WhatsApp"
            description="Gestiona y responde mensajes de clientes en tiempo real"
            onClick={() => router.push('/conversaciones')}
            color="bg-green-500"
            badge={unreadCount > 0 ? `${unreadCount} SIN LEER` : undefined}
            tooltip="Visualiza y responde los mensajes de tus clientes desde un panel centralizado"
            pendingAction={unreadCount > 0 ? {
              label: `Ver ${unreadCount} mensaje${unreadCount > 1 ? 's' : ''} pendiente${unreadCount > 1 ? 's' : ''}`,
            } : undefined}
          />
        </div>
        
        {/* === SECCIÓN: GESTIÓN DE DATOS (Slate/Indigo) === */}
        <div data-tour="filtrar-clientes">
          <ServiceCard
            icon={<Filter className="w-6 h-6 text-white" />}
            title="Filtrar Clientes para PYSE"
            description="Selecciona barrios y genera Excel de aptos/no aptos"
            onClick={handleClickFiltrarClientes}
            color="bg-green-600"
            tooltip="Filtra tu base de clientes por barrio y genera un Excel con clientes aptos y no aptos para PYSE"
          />
        </div>
        <div data-tour="verificar-planes">
          <ServiceCard
            icon={<Check className="w-6 h-6 text-white" />}
            title="Verificar Planes de Pago"
            description="Consulta qué clientes tienen planes de pago vigentes"
            onClick={handleClickVerificarPlanesPago}
            color="bg-blue-600"
            tooltip="Verifica el estado de los planes de pago de tus clientes y sus cuotas"
          />
        </div>
        <div data-tour="base-clientes">
          <ServiceCard
            icon={<Database className="w-6 h-6 text-white" />}
            title="Base de Clientes"
            description="Importa tu universo de cuentas y gestiona tu base de datos"
            onClick={handleClickClientesDatabase}
            color="bg-purple-500"
            tooltip="Importa y mantén actualizada tu base de clientes desde archivos Excel"
          />
        </div>
        
        {/* === SECCIÓN: UTILIDADES (Amber/Neutral) === */}
        <div data-tour="recuperar-archivos">
          <ServiceCard
            icon={<FileArchive className="w-6 h-6 text-white" />}
            title="Recuperar Archivos"
            description="Descarga archivos de respaldo procesados anteriormente"
            onClick={handleClickRecuperarArchivos}
            color="bg-amber-500"
            tooltip="Accede a los archivos Excel y reportes generados en procesos anteriores"
          />
        </div>
        <div data-tour="faq">
          <ServiceCard
            icon={<HelpCircle className="w-6 h-6 text-white" />}
            title="Preguntas Frecuentes"
            description="Consulta dudas comunes sobre el uso de la plataforma"
            onClick={handleClickFAQ}
            color="bg-blue-500"
            tooltip="Encuentra respuestas a las preguntas más comunes sobre AQUA"
          />
        </div>
        
        {/* === SECCIÓN: ADMINISTRACIÓN === */}
        {isAdmin && (
          <ServiceCard
            icon={<Settings className="w-6 h-6 text-white" />}
            title="Panel de Administración"
            description="Gestiona usuarios, servicios y configuración del sistema"
            onClick={() => router.push('/admin')}
            color="bg-gradient-to-r from-blue-600 to-purple-600"
            badge="ADMIN"
            tooltip="Accede al panel de administración para gestionar usuarios y configuración"
          />
        )}
      </div>

      {/* Panel de estado duplicado removido: el banner inicial cubre esta función */}



      {/* Modal en desarrollo (otros features) */}
      <ModalEnDesarrollo open={modalDevVisible} onOpenChange={setModalDevVisible} />

      {/* Modal de aviso WhatsApp Cloud API */}
      <WhatsAppCloudAPINoticeModal 
        open={showNotice} 
        onOpenChange={setShowNotice} 
      />

    </div>
  </TooltipProvider>
  )
}
