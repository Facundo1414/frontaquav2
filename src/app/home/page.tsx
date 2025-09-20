'use client'

import {  useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Mail, MessageCircle, Plus, HelpCircle } from 'lucide-react'
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
          icon={<Mail className="w-6 h-6 text-white" />}
          title="Enviar Deudas a Clientes"
          onClick={handleClick}
          color="bg-teal-500"
        />
  {!isReady && (
          <ServiceCard
            icon={<MessageCircle className="w-6 h-6 text-white" />}
            title="Iniciar sesión en WhatsApp"
            onClick={() => setModalVisible(true)}
            color="bg-blue-500"
          />
        )}
        <ServiceCard
          icon={<Plus className="w-6 h-6 text-white" />}
          title="Guardar Clientes"
          onClick={() => setModalDevVisible(true)} // mostrar modal nuevo
          color="bg-teal-500"
        />
        <ServiceCard
          icon={<HelpCircle className="w-6 h-6 text-white" />}
          title="Preguntas Frecuentes"
          onClick={() => setModalDevVisible(true)} // mostrar modal nuevo
          color="bg-blue-500"
        />
      </div>

      {/* Sección de feedback de sesión WhatsApp */}
      <div className="mt-10 p-6 bg-white rounded-lg shadow-md flex flex-col items-center space-y-4">
        <h3 className="text-xl font-semibold">Estado de WhatsApp</h3>
        <div className="flex items-center space-x-2">
          {effectiveState === 'ready' && <Check className="text-green-500 w-6 h-6" />}
          {effectiveState === 'syncing' && <div className="animate-spin h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full" />}
          {effectiveState === 'waiting_qr' && <span role="img" aria-label="qr">📱</span>}
          {!['ready','syncing','waiting_qr'].includes(effectiveState) && (
            <div className="animate-pulse h-6 w-6 bg-yellow-400 rounded-full" />
          )}
          <span>{statusMessages[effectiveState] || 'Estado desconocido'}</span>
        </div>
      </div>



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
