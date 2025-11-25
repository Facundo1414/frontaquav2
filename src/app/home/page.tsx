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
import { useWhatsappSessionContext } from '@/app/providers/context/whatsapp/WhatsappSessionContext'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { simpleWaState } from '@/lib/api/simpleWaApi'
import { RequiresPlan } from '@/components/subscription'


export default function HomePage() {
  const router = useRouter()
  // Eliminamos flags duplicados; se deriva de status global (navbar) o se muestra modal
  const [modalVisible, setModalVisible] = useState(false)
  const [modalDevVisible, setModalDevVisible] = useState(false) // nuevo modal
  // Inicializar userMode desde localStorage
  const [userMode, setUserMode] = useState<'system' | 'personal'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whatsapp_mode')
      return (saved as 'system' | 'personal') || 'system'
    }
    return 'system'
  })
  // Consumimos el snapshot global (estado único)
  const { snapshot, updateFromStatus } = useWhatsappSessionContext() as any
  const { userId } = useGlobalContext()
  // Nuevo modelo simplificado: snapshot.state ('none'|'launching'|'waiting_qr'|'syncing'|'ready'|'closing')
  const effectiveState = snapshot?.state || 'none'
  const isReady = !!snapshot?.ready
  
  // Admin check
  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || ''
  const isAdmin = userId === ADMIN_UID
  
  // Determinar si el usuario necesita el modal de WhatsApp (admin o modo personal)
  const needsWhatsAppModal = isAdmin || userMode === 'personal'
  
  // Debug: Log subscription status
  console.log('🏠 HomePage - userId:', userId, 'isAdmin:', isAdmin)
  
  // Debug: verificar comparación
  console.log('🔍 HomePage Admin Check:', {
    userId,
    ADMIN_UID,
    isAdmin,
    match: userId === ADMIN_UID
  })


const handleWhatsAppModeChange = (mode: 'system' | 'personal') => {
  setUserMode(mode)
}

const handleConnectWhatsApp = () => {
  setModalVisible(true)
}

const handleClick = async () => {
  // Usuarios con modo personal o admin necesitan verificar sesión
  if (needsWhatsAppModal) {
    try {
      const st = await simpleWaState(); // { worker, authenticated, ready, hasQR, qr? }
      const mappedState = st.ready
        ? 'ready'
        : (st.authenticated
            ? 'syncing'
            : (st.hasQR ? 'waiting_qr' : 'launching'));
      updateFromStatus({ state: mappedState, qr: st.qr || null });
      if (st.ready || st.authenticated) {
        router.push('/senddebts');
        return;
      }
    } catch {/* ignorar y continuar */}
    if (!isReady) {
      setModalVisible(true);
    } else {
      router.push('/senddebts');
    }
  } else {
    // Modo sistema: usar WhatsApp centralizado
    router.push('/senddebts');
  }
}

const handleClickProximosVencer = async () => {
  // Usuarios con modo personal o admin necesitan verificar sesión
  if (needsWhatsAppModal) {
    try {
      const st = await simpleWaState();
      const mappedState = st.ready
        ? 'ready'
        : (st.authenticated
            ? 'syncing'
            : (st.hasQR ? 'waiting_qr' : 'launching'));
      updateFromStatus({ state: mappedState, qr: st.qr || null });
      if (st.ready || st.authenticated) {
        router.push('/proximos-vencer');
        return;
      }
    } catch {/* ignorar y continuar */}
    if (!isReady) {
      setModalVisible(true);
    } else {
      router.push('/proximos-vencer');
    }
  } else {
    // Modo sistema: usar WhatsApp centralizado
    router.push('/proximos-vencer');
  }
}

const handleClickFiltrarClientes = () => {
  // No necesita sesión WhatsApp, va directo al filtro
  router.push('/filtrar-clientes')
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

      {/* Banner de sesión WhatsApp no lista - SOLO ADMIN */}
      {isAdmin && !isReady && (
        <div
          role="alert"
          className="mb-8 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 p-4 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-semibold">Tu sesión de WhatsApp no está lista</p>
                <p className="text-sm opacity-90">Iniciá sesión para poder enviar las deudas a tus clientes.</p>
              </div>
            </div>
            <button
              onClick={() => setModalVisible(true)}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Iniciar sesión en WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Estado WhatsApp - Banner Superior - Admin o modo personal (conectado) */}
      {needsWhatsAppModal && isReady && (
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
      {userId && (
        <div className="mb-6">
          <WhatsappUsageWidget />
        </div>
      )}

      {/* Selector de Modo WhatsApp - Todos los usuarios */}
      {userId && (
        <div className="mb-6">
          <WhatsappModeSelector 
            onModeChange={handleWhatsAppModeChange}
            onConnectClick={handleConnectWhatsApp}
          />
        </div>
      )}

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
          />
        </RequiresPlan>
        <RequiresPlan plan="PRO">
          <ServiceCard
            icon={<Clock className="w-6 h-6 text-white" />}
            title="Notificar Próximos a Vencer"
            description="Avisa a clientes con plan de pago próximos a vencer"
            onClick={handleClickProximosVencer}
            color="bg-orange-500"
          />
        </RequiresPlan>
        <ServiceCard
          icon={<Filter className="w-6 h-6 text-white" />}
          title="Filtrar Clientes para PYSE"
          description="Selecciona barrios y genera Excel de aptos/no aptos"
          onClick={handleClickFiltrarClientes}
          color="bg-green-600"
        />
        <RequiresPlan plan="PRO">
          <ServiceCard
            icon={<FileText className="w-6 h-6 text-white" />}
            title="Generar Reportes de Deuda"
            description="Genera PDFs individuales de intimación e instrucciones de pago"
            onClick={() => router.push('/generar-reportes')}
            color="bg-indigo-500"
          />
        </RequiresPlan>
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

      {/* Modal WhatsApp unificado (usa SSE + regeneraciones) - Admin o modo personal */}
      {needsWhatsAppModal && (
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
