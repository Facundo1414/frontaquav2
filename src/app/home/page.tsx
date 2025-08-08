'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Check, Mail, MessageCircle, Plus, HelpCircle } from 'lucide-react'
import { ServiceCard } from './components/ServiceCard'
import { ModalEnDesarrollo } from './components/modal-en-desarrollo'
import { WhatsappSessionModal } from './components/WhatsappSessionModal'

export default function HomePage() {
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(true)
  const [isSessionReady, setIsSessionReady] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalDevVisible, setModalDevVisible] = useState(false) // nuevo modal

  useEffect(() => {
    setTimeout(() => {
      setIsSessionReady(true)
      setIsInitializing(false)
    }, 1500)
  }, [])

  const handleClick = () => {
    if (!isSessionReady) {
      toast.warning('Inicia sesión en WhatsApp para continuar')
    } else {
      router.push('/senddebts')
    }
  }

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
