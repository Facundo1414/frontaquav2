'use client'

import {  useState } from 'react'
import { useRouter } from 'next/navigation'
import { Filter, Upload, UploadCloud, Download, MessageCircle, Bell, FileText, Users, Check, Send, Clock, FileArchive, Database, HelpCircle, Settings } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ServiceCard } from './components/ServiceCard'
import { ModalEnDesarrollo } from './components/modal-en-desarrollo'
import { WhatsappSessionModal } from './components/WhatsappSessionModal'
import { WhatsappUsageWidget } from './components/WhatsappUsageWidget'
import { WhatsappModeSelector } from './components/WhatsappModeSelector'
import { WhatsAppCloudAPINoticeModal, useWhatsAppCloudAPINotice } from './components/WhatsAppCloudAPINoticeModal'
import { useWhatsappSessionContext } from '@/app/providers/context/whatsapp/WhatsappSessionContext'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { simpleWaState } from '@/lib/api/simpleWaApi'
import { RequiresPlan } from '@/components/subscription'
import { toast } from 'sonner'
import { useWhatsappNavigation } from '@/hooks/useWhatsappNavigation'


export default function HomePage() {
  const router = useRouter()
  const [modalVisible, setModalVisible] = useState(false)
  const [modalDevVisible, setModalDevVisible] = useState(false)
  
  // Hook para el modal de aviso WhatsApp Cloud API
  const { showNotice, setShowNotice } = useWhatsAppCloudAPINotice()
  
  // Consumimos el snapshot global (estado único)
  const { snapshot, updateFromStatus } = useWhatsappSessionContext() as any
  const { userId } = useGlobalContext()
  
  // Hook centralizado para navegación con validación WhatsApp
  const { navigateWithWhatsappCheck, userMode, isReady, isAdmin } = useWhatsappNavigation()
  
  // Estado efectivo del snapshot
  const effectiveState = snapshot?.state || 'none'
  
  // Estado local para el selector de modo (sincronizado con localStorage)
  const [localUserMode, setLocalUserMode] = useState<'system' | 'personal'>(userMode)

  const handleWhatsAppModeChange = (mode: 'system' | 'personal') => {
    setLocalUserMode(mode)
  }

  const handleConnectWhatsApp = () => {
    setModalVisible(true)
  }

  const handleClick = () => {
    navigateWithWhatsappCheck('/senddebts', setModalVisible)
  }

  const handleClickProximosVencer = () => {
    navigateWithWhatsappCheck('/proximos-vencer', setModalVisible)
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
  <div className="w-full min-h-screen px-6 pb-10">
      {/* Header */}
      <div className="relative flex justify-between items-center bg-white shadow-md rounded-lg p-6 mb-6">
        <div 
          className="absolute inset-0 rounded-lg"
          style={{ backgroundImage: "url('/bg_topEspacioClientes.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white">AQUA</h1>
          <p className="text-white">Al servicio de Cclip.</p>
        </div>
        <img src="/logoWater.png" alt="Logo" className="h-32 object-contain relative z-10" />
      </div>

      {/* Banner Usuario modo personal SIN sesión */}
      {userMode === 'personal' && !isReady && (
        <div className="mb-6 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-3 flex-1">
              <MessageCircle className="w-5 h-5 text-yellow-700 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900">Tu WhatsApp personal no está conectado</p>
                <p className="text-sm text-yellow-700">
                  Conectá tu sesión para poder enviar mensajes desde tu número personal.
                </p>
              </div>
            </div>
            <button
              onClick={() => setModalVisible(true)}
              className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors whitespace-nowrap"
            >
              Conectar ahora
            </button>
          </div>
        </div>
      )}

      {/* Banner Admin cuando sistema NO está conectado */}
      {isAdmin && userMode === 'system' && !isReady && (
        <div className="mb-6 rounded-lg border-2 border-red-300 bg-red-50 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-3 flex-1">
              <MessageCircle className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">El WhatsApp del sistema no está conectado</p>
                <p className="text-sm text-red-700">
                  Necesitás conectar el celular prepago para que los usuarios puedan enviar mensajes.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              Ir a Panel Admin
            </button>
          </div>
        </div>
      )}

      {/* Banner WhatsApp conectado - Solo modo personal */}
      {userMode === 'personal' && isReady && (
        <div className="mb-6 rounded-lg border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-green-900">WhatsApp conectado</p>
              <p className="text-sm text-green-700">Tu sesión está activa y lista para enviar mensajes</p>
            </div>
            <div className="flex-shrink-0">
              <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                ✓ ACTIVO
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Widget de Estado del Sistema WhatsApp - Todos los usuarios */}
      {/* TEMPORALMENTE DESHABILITADO */}
      {/* {userId && (
        <div className="mb-6">
          <WhatsappUsageWidget />
        </div>
      )} */}

      {/* Selector de Modo WhatsApp - Todos los usuarios */}
      {/* TEMPORALMENTE DESHABILITADO */}
      {/* {userId && (
        <div className="mb-6">
          <WhatsappModeSelector 
            onModeChange={handleWhatsAppModeChange}
            onConnectClick={handleConnectWhatsApp}
          />
        </div>
      )} */}

      {/* Servicios Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold">Nuestros Servicios</h2>
        <p className="text-muted-foreground text-xl max-w-xl mx-auto">
          Descubrí todo lo que podemos hacer para ayudarte a automatizar tu comunicación con clientes.
        </p>
        <div className="w-16 h-1 bg-primary mx-auto mt-3 rounded-full" />
      </div>

      {/* Tarjetas de Servicios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <RequiresPlan plan="PRO">
          <ServiceCard
            icon={<Send className="w-6 h-6 text-white" />}
            title="Enviar Comprobantes Vencidos"
            description="Envía comprobantes vencidos a clientes con plan de pago"
            onClick={handleClick}
            color="bg-teal-500"
            disabled
            badge="DESHABILITADO"
          />
        </RequiresPlan>
        <RequiresPlan plan="PRO">
          <ServiceCard
            icon={<Clock className="w-6 h-6 text-white" />}
            title="Notificar Próximos a Vencer"
            description="Avisa a clientes con plan de pago próximos a vencer"
            onClick={handleClickProximosVencer}
            color="bg-orange-500"
            disabled
            badge="DESHABILITADO"
          />
        </RequiresPlan>
        <ServiceCard
          icon={<Filter className="w-6 h-6 text-white" />}
          title="Filtrar Clientes para PYSE"
          description="Selecciona barrios y genera Excel de aptos/no aptos"
          onClick={handleClickFiltrarClientes}
          color="bg-green-600"
        />
        <ServiceCard
          icon={<Check className="w-6 h-6 text-white" />}
          title="Verificar Planes de Pago"
          description="Consulta qué clientes tienen planes de pago vigentes"
          onClick={handleClickVerificarPlanesPago}
          color="bg-blue-600"
          badge="NUEVO"
        />

        <ServiceCard
          icon={<FileArchive className="w-6 h-6 text-white" />}
          title="Recuperar Archivos"
          description="Descarga archivos de respaldo procesados anteriormente"
          onClick={handleClickRecuperarArchivos}
          color="bg-amber-500"
        />
        <ServiceCard
          icon={<Database className="w-6 h-6 text-white" />}
          title="Base de Clientes"
          description="Importa tu universo de cuentas y gestiona tu base de datos de clientes"
          onClick={handleClickClientesDatabase}
          color="bg-purple-500"
        />
        <ServiceCard
          icon={<HelpCircle className="w-6 h-6 text-white" />}
          title="Preguntas Frecuentes"
          description="Consulta dudas comunes sobre el uso de la plataforma"
          onClick={handleClickFAQ}
          color="bg-blue-500"
        />
        <ServiceCard
          icon={<MessageCircle className="w-6 h-6 text-white" />}
          title="Conversaciones WhatsApp"
          description="Gestiona y responde mensajes de clientes en tiempo real"
          onClick={() => router.push('/conversaciones')}
          color="bg-green-500"
          badge="NUEVO"
        />
        {isAdmin && (
          <ServiceCard
            icon={<Settings className="w-6 h-6 text-white" />}
            title="Panel de Administración"
            description="Gestiona usuarios, servicios y configuración del sistema"
            onClick={() => router.push('/admin')}
            color="bg-gradient-to-r from-blue-600 to-purple-600"
            badge="ADMIN"
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

      {/* Modal WhatsApp unificado - Solo modo personal */}
      {userMode === 'personal' && (
        <WhatsappSessionModal
          open={modalVisible}
          onOpenChange={setModalVisible}
          token={getAccessToken() || ''}
          autoCloseOnAuth
        />
      )}
    </div>
  )
}
