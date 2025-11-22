'use client';

import { MessageCircle, Phone } from 'lucide-react';

interface ContactAdvisorButtonProps {
  advisorPhone: string;
  advisorName: string;
  businessName: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export function ContactAdvisorButton({
  advisorPhone,
  advisorName,
  businessName,
  className = '',
  variant = 'default',
}: ContactAdvisorButtonProps) {
  const handleWhatsAppClick = () => {
    // Formato del mensaje predefinido
    const message = encodeURIComponent(
      `Hola ${advisorName}, tengo una consulta sobre mi comprobante de ${businessName}.`
    );
    
    // Link directo a WhatsApp
    const whatsappUrl = `https://wa.me/${advisorPhone.replace(/\D/g, '')}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleWhatsAppClick}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors ${className}`}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="font-medium">Hablar con asesor</span>
      </button>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <Phone className="h-6 w-6 text-white" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            ¿Tenés alguna consulta?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Nuestro asesor <strong>{advisorName}</strong> está disponible para ayudarte.
          </p>
          
          <button
            onClick={handleWhatsAppClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">Contactar por WhatsApp</span>
          </button>
          
          <p className="text-xs text-gray-500 mt-3">
            Te responderemos en horario de 9:00 a 16:00 hs
          </p>
        </div>
      </div>
    </div>
  );
}
