'use client'

import {  useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Send, MessageCircle, Database, HelpCircle, Clock, Filter, FileArchive } from 'lucide-react'
import { ServiceCard } from './components/ServiceCard'
import { ModalEnDesarrollo } from './components/modal-en-desarrollo'
import { WhatsappSessionModal } from './components/WhatsappSessionModal'
import { useWhatsappSessionContext } from '@/app/providers/context/whatsapp/WhatsappSessionContext'
import { simpleWaState } from '@/lib/api/simpleWaApi'


export default function HomePage() {
  const router = useRouter()
  // Eliminamos flags duplicados; se deriva de status global (navbar) o se muestra modal
  const [modalVisible, setModalVisible] = useState(false)
  const [modalDevVisible, setModalDevVisible] = useState(false) // nuevo modal
  // Consumimos el snapshot global (estado único)
  const { snapshot, updateFromStatus } = useWhatsappSessionContext() as any
  // Nuevo modelo simplificado: snapshot.state ('none'|'launching'|'waiting_qr'|'syncing'|'ready'|'closing')
  const effectiveState = snapshot?.state || 'none'
  const isReady = !!snapshot?.ready


const handleClick = async () => {
  // Consultar snapshot orquestador actual para evitar abrir modal innecesario
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
}

const handleClickProximosVencer = async () => {
  // Misma lógica de validación de sesión WhatsApp que el método original
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
}

const handleClickFiltrarClientes = () => {
  // No necesita sesión WhatsApp, va directo al filtro
  router.push('/filtrar-clientes')
}

const handleClickRecuperarArchivos = () => {
  // Página independiente para recuperar archivos de respaldo
  router.push('/recuperar-archivos')
}

const handleClickClientesDatabase = () => {
  // Página para importar y gestionar clientes desde Excel
  router.push('/clientes-database')
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
  <div className="flex w-full min-h-screen">
      <div className="flex-1 px-6 pb-10">
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

      {/* Banner de sesión WhatsApp no lista */}
      {!isReady && (
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

      {/* Banner NUEVO: Sistema de Filtrado PYSE */}
      <div className="mb-8 rounded-lg border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-md">
              <Filter className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-green-900">
                ✨ Nuevo Sistema de Filtrado para PYSE
              </h3>
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                Nuevo
              </span>
            </div>
            <p className="text-green-800 mb-3 text-lg">
              <strong>Sube tu universo de cuentas UNA SOLA VEZ</strong> y procesa diferentes barrios cada día. 
              Ideal para verificar deudas de forma controlada (~300 cuentas/día).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-green-700">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Archivo guardado permanentemente</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Selección por barrios</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Clasificación automática</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>2 Excel: APTOS y NO APTOS</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => router.push('/filtrar-clientes')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white text-lg font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Filter className="w-5 h-5" />
              Probar Ahora
            </button>
          </div>
        </div>
      </div>

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
        <ServiceCard
          icon={<Send className="w-6 h-6 text-white" />}
          title="Enviar Deudas de PP a Clientes"
          onClick={handleClick}
          color="bg-teal-500"
        />
        <ServiceCard
          icon={<Clock className="w-6 h-6 text-white" />}
          title="Enviar PP que aun no vencieron"
          onClick={handleClickProximosVencer}
          color="bg-orange-500"
        />
        <ServiceCard
          icon={<Filter className="w-6 h-6 text-white" />}
          title="Filtrar Clientes para PYSE"
          onClick={handleClickFiltrarClientes}
          color="bg-green-500"
        />
        <ServiceCard
          icon={<FileArchive className="w-6 h-6 text-white" />}
          title="Recuperar Archivos de Respaldo"
          onClick={handleClickRecuperarArchivos}
          color="bg-amber-500"
        />
        <ServiceCard
          icon={<Database className="w-6 h-6 text-white" />}
          title="Base de datos de Clientes"
          onClick={handleClickClientesDatabase}
          color="bg-purple-500"
        />
        <ServiceCard
          icon={<HelpCircle className="w-6 h-6 text-white" />}
          title="Preguntas Frecuentes"
          onClick={() => setModalDevVisible(true)} // mostrar modal nuevo
          color="bg-blue-500"
        />
      </div>

      {/* Panel de estado duplicado removido: el banner inicial cubre esta función */}



      {/* Modal en desarrollo (otros features) */}
      <ModalEnDesarrollo open={modalDevVisible} onOpenChange={setModalDevVisible} />

      {/* Modal WhatsApp unificado (usa SSE + regeneraciones) */}
      <WhatsappSessionModal
        open={modalVisible}
        onOpenChange={setModalVisible}
        token={getAccessToken() || ''}
        autoCloseOnAuth
      />
      </div>
    </div>
  )
}
