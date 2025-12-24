'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { WhatsAppPreview } from './WhatsAppPreview'
import { AlertTriangle, Users, MessageSquare, FileText, Loader2 } from 'lucide-react'

interface SendConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  totalClients: number
  messagePreview: string
  quotaRemaining?: number
  dailyQuota?: number
  includesAttachment?: boolean
  processType?: 'senddebts' | 'proximos-vencer'
}

export function SendConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  totalClients,
  messagePreview,
  quotaRemaining = 300,
  dailyQuota = 300,
  includesAttachment = true,
  processType = 'senddebts',
}: SendConfirmationModalProps) {
  const exceedsQuota = totalClients > quotaRemaining
  const overQuotaCount = Math.max(0, totalClients - quotaRemaining)
  const estimatedCost = overQuotaCount * 30 // $30 por mensaje extra

  const processTitle = processType === 'senddebts' 
    ? 'Enviar Deudas' 
    : 'Notificar Próximos a Vencer'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="w-6 h-6 text-green-600" />
            Confirmar {processTitle}
          </DialogTitle>
          <DialogDescription>
            Revisá los detalles antes de enviar los mensajes de WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Left: Info & Stats */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Destinatarios</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-1">{totalClients}</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-700">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Adjunto</span>
                </div>
                <p className="text-sm font-semibold text-green-900 mt-1">
                  {includesAttachment ? 'PDF Comprobante' : 'Sin adjunto'}
                </p>
              </div>
            </div>

            {/* Quota Info */}
            <div className={`rounded-lg p-4 ${exceedsQuota ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200'}`}>
              <h4 className={`font-semibold text-sm ${exceedsQuota ? 'text-amber-800' : 'text-gray-700'}`}>
                Cuota diaria de mensajes
              </h4>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Disponible:</span>
                  <span className="font-medium">{quotaRemaining} de {dailyQuota}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">A enviar:</span>
                  <span className="font-medium">{totalClients}</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${exceedsQuota ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, ((dailyQuota - quotaRemaining + totalClients) / dailyQuota) * 100)}%` }}
                  />
                </div>
              </div>

              {exceedsQuota && (
                <div className="mt-3 p-2 bg-amber-100 rounded border border-amber-300">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Excederás tu cuota por {overQuotaCount} mensajes
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Se aplicará un cargo adicional de <strong>${estimatedCost}</strong> en tu próxima factura.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tiempo estimado */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-purple-800">⏱️ Tiempo estimado</h4>
              <p className="text-purple-900 mt-1">
                ~{Math.ceil(totalClients * 8 / 60)} minutos
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Aproximadamente 8 segundos por mensaje (genera PDF + envía WhatsApp)
              </p>
            </div>

            {/* Warning */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                ⚠️ Una vez iniciado el proceso, no podrá cancelarse. 
                Los mensajes se enviarán secuencialmente y podrás ver el progreso en tiempo real.
              </p>
            </div>
          </div>

          {/* Right: WhatsApp Preview */}
          <div className="flex flex-col items-center justify-center">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Así verán el mensaje tus clientes:
            </h4>
            <WhatsAppPreview 
              message={messagePreview}
              hasAttachment={includesAttachment}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={exceedsQuota ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                {exceedsQuota 
                  ? `Enviar de todas formas (${totalClients} mensajes)`
                  : `Confirmar envío (${totalClients} mensajes)`
                }
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
