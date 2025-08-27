'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Check, Mail, MessageCircle, Plus, HelpCircle } from 'lucide-react'
import { ServiceCard } from './components/ServiceCard'
import { ModalEnDesarrollo } from './components/modal-en-desarrollo'
import { WhatsappSessionModal } from './components/WhatsappSessionModal'
import { useWhatsappStatus } from '@/hooks/useWhatsappStatus'
import { initializeWhatsAppSession } from '@/lib/api'
import { getWhatsappStatus } from '@/lib/api/whatsappApi'

export default function HomePage() {
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(true)
  const [isSessionReady, setIsSessionReady] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalDevVisible, setModalDevVisible] = useState(false) // nuevo modal
  const { status, loading } = useWhatsappStatus()


const handleClick = () => {
  if (status !== 'authenticated') {
    toast.warning('Inicia sesión en WhatsApp para continuar')
    setModalVisible(true)
  } else {
    router.push('/senddebts')
  }
}

  useEffect(() => {
    const initSessionIfNeeded = async () => {
      if (modalVisible && status !== 'authenticated') {
        setIsInitializing(true)
        try {
          const result = await initializeWhatsAppSession()
          if (result.isAuthenticated) {
            setIsSessionReady(true)
          } else {
            setIsSessionReady(false)
          }
        } catch (err) {
          console.error('Error iniciando sesión WhatsApp:', err)
          setIsSessionReady(false)
        } finally {
          setIsInitializing(false)
        }
      }
    }

    initSessionIfNeeded()
  }, [modalVisible])

  useEffect(() => {
    if (!modalVisible) return;
    const interval = setInterval(async () => {
      const data = await getWhatsappStatus()
      setIsSessionReady(data.isActive)
    }, 5000) // chequea cada 5 segundos

    return () => clearInterval(interval)
  }, [modalVisible])



  // Mensajes claros según status
  const statusMessages: Record<string, string> = {
    pending: 'Esperando inicio de sesión... (No hay cliente en memoria)',
    ready: 'QR generado. Escanea para iniciar sesión.',
    authenticated: 'Sesión activa. ¡Listo para enviar mensajes!',
    disconnected: 'Sesión desconectada. Vuelve a iniciar sesión.',
    initializing: 'Inicializando sesión de WhatsApp...',
    restoring: 'Restaurando sesión guardada, por favor espera...',
    inactive: 'Sesión inactiva. Por favor, inicia sesión.',
  };

  return (
    <>
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
        <ServiceCard
          icon={<MessageCircle className="w-6 h-6 text-white" />}
          title="Iniciar sesión en WhatsApp"
          onClick={() => setModalVisible(true)}
          color="bg-blue-500"
        />
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
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            <span>Cargando estado de la sesión...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {status === 'authenticated' && <Check className="text-green-500 w-6 h-6" />}
            {status === 'ready' && <span role="img" aria-label="qr">📱</span>}
            {status === 'pending' && <div className="animate-pulse h-6 w-6 bg-yellow-400 rounded-full" />}
            <span>{statusMessages[status] || 'Estado desconocido'}</span>
          </div>
        )}
      </div>



      {/* Modal para sesión de WhatsApp */}
      <Dialog open={modalVisible} onOpenChange={setModalVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciando sesión en WhatsApp</DialogTitle>
          </DialogHeader>
          {isInitializing ? (
            <div className="flex items-center space-x-2 py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              <span>Verificando sesión activa...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 py-4">
              <Check className="text-green-500" />
              <span>Sesión activa. ¡Listo para enviar!</span>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal en desarrollo */}
      <ModalEnDesarrollo open={modalDevVisible} onOpenChange={setModalDevVisible} />

      {/* Modal de whatsapp */}
      <WhatsappSessionModal open={modalVisible} onOpenChange={setModalVisible} />
    </>
  )
}
