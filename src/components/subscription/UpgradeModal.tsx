'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Check, X, Mail, MessageCircle } from 'lucide-react';
import { getProFeatures, getBaseFeatures, getFeatureLabel } from '@/context/SubscriptionContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string; // Característica específica que intentó acceder
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  feature,
}) => {
  const proFeatures = getProFeatures();
  const baseFeatures = getBaseFeatures();

  const handleContactAdmin = (method: 'email' | 'whatsapp') => {
    if (method === 'email') {
      window.location.href = 'mailto:admin@aqua.com?subject=Actualizar a Plan PRO';
    } else {
      // Reemplazar con el número de WhatsApp del admin
      const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE || '5493512345678';
      const message = encodeURIComponent('Hola! Me gustaría actualizar mi plan a PRO');
      window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-2xl">Actualiza a Plan PRO</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {feature ? (
              <>
                La función <strong>{getFeatureLabel(feature)}</strong> requiere Plan PRO.
                Desbloquea todas las funcionalidades avanzadas para maximizar tu gestión.
              </>
            ) : (
              <>
                Accede a funciones avanzadas para automatizar tu gestión de clientes
                y ahorrar tiempo con envíos masivos de WhatsApp.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Comparison Table */}
        <div className="grid grid-cols-2 gap-4 my-6">
          {/* Plan Base */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
              Plan Base
              <span className="text-xs font-normal px-2 py-1 bg-gray-200 rounded">Actual</span>
            </h3>
            <ul className="space-y-2">
              {baseFeatures.map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{getFeatureLabel(feat)}</span>
                </li>
              ))}
              {proFeatures.map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-sm text-gray-400">
                  <X className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{getFeatureLabel(feat)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Plan PRO */}
          <div className="border-2 border-amber-500 rounded-lg p-4 bg-gradient-to-br from-amber-50 to-yellow-50 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                ⭐ RECOMENDADO
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-amber-700 flex items-center gap-2 mt-2">
              <Crown className="h-5 w-5" />
              Plan PRO
            </h3>
            <ul className="space-y-2">
              {[...baseFeatures, ...proFeatures].map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className={proFeatures.includes(feat) ? 'font-semibold' : ''}>
                    {getFeatureLabel(feat)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Benefits Highlight */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-900 mb-2">✨ Beneficios Exclusivos PRO:</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Envíos masivos automatizados por WhatsApp</li>
            <li>• Tracking de conversaciones y costos</li>
            <li>• Generación de reportes personalizados</li>
            <li>• Soporte prioritario</li>
            <li>• Actualizaciones tempranas de nuevas funciones</li>
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Tal vez más tarde
          </Button>
          <Button
            variant="outline"
            onClick={() => handleContactAdmin('email')}
            className="w-full sm:w-auto gap-2"
          >
            <Mail className="h-4 w-4" />
            Contactar por Email
          </Button>
          <Button
            onClick={() => handleContactAdmin('whatsapp')}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Contactar Administrador
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
