'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Info, ExternalLink, CheckCircle2 } from 'lucide-react'

interface WhatsAppCloudAPINoticeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WhatsAppCloudAPINoticeModal({
  open,
  onOpenChange,
}: WhatsAppCloudAPINoticeModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleClose = () => {
    if (dontShowAgain) {
      // Guardar en localStorage que el usuario ya vio el aviso
      localStorage.setItem('whatsapp_cloud_notice_dismissed', 'true')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[1000px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <DialogTitle className="text-xl">
              Cambio Importante: WhatsApp Cloud API
            </DialogTitle>
          </div>
          <DialogDescription className="text-base mt-4">
            Información sobre la migración al servicio oficial de WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Aviso principal */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>El servicio de WhatsApp gratuito ya no está disponible.</strong>
              <br />
              WhatsApp ha intensificado sus controles de seguridad y está bloqueando cuentas 
              que usan métodos no oficiales.
            </AlertDescription>
          </Alert>

          {/* Explicación */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              ¿Qué cambió?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground ml-6">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>
                  El método anterior (no oficial) resultaba en <strong>bloqueos frecuentes</strong> de cuentas WhatsApp
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>
                  Migramos a <strong>WhatsApp Cloud API</strong>, el servicio oficial de Meta para empresas
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>
                  Esto garantiza <strong>estabilidad, seguridad y cumplimiento legal</strong>
                </span>
              </li>
            </ul>
          </div>

          {/* Costos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              ¿Qué costo tiene?
            </h3>
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p className="font-medium">Modelo de precios del sistema:</p>
              <ul className="space-y-1 ml-4">
                <li>• <strong>Plan BASE:</strong> $35 USD/mes - Sin WhatsApp Cloud API</li>
                <li>• <strong>Plan PRO:</strong> $60 USD/mes - <strong>400 mensajes/mes incluidos</strong></li>
                <li>• Mensajes adicionales: <strong>$0.05 USD por mensaje</strong> (sin sobrecargo)</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                💡 <strong>Ejemplo:</strong> Si enviás 350 notificaciones en un mes = $0 extra (dentro del plan PRO)
              </p>
              <p className="text-xs text-muted-foreground">
                📊 Si enviás 500 notificaciones = 100 mensajes extra = <strong>$5 USD adicionales</strong>
              </p>
            </div>
          </div>

          {/* Nueva funcionalidad */}
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-sm">
              <strong className="text-green-600">Nueva funcionalidad disponible:</strong>
              <br />
              Agregamos la opción <strong>"Verificar Planes de Pago"</strong> para que puedas 
              subir el archivo Incumplidos y consultar automáticamente qué clientes tienen planes de pago vigentes 
              para luego enviar manualmente desde tu celular los comprobantes de pago.
            </AlertDescription>
          </Alert>

          {/* Documentación */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Más información:</h3>
            <a
              href="https://developers.facebook.com/docs/whatsapp/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Precios oficiales de WhatsApp Cloud API
            </a>
          </div>

          {/* Checkbox "No mostrar de nuevo" */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="dont-show-again"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label
              htmlFor="dont-show-again"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              No mostrar este aviso nuevamente
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full sm:w-auto">
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook para controlar la visibilidad del modal al entrar
 */
export function useWhatsAppCloudAPINotice() {
  const [showNotice, setShowNotice] = useState(false)

  useEffect(() => {
    // Verificar si el usuario ya vio el aviso
    const dismissed = localStorage.getItem('whatsapp_cloud_notice_dismissed')
    if (!dismissed) {
      // Mostrar el modal después de 1 segundo
      const timer = setTimeout(() => {
        setShowNotice(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  return { showNotice, setShowNotice }
}
