/**
 * 🎯 SendButton
 * 
 * Botón con estados visuales progresivos para envío de mensajes WhatsApp
 * 
 * Muestra animaciones para:
 * - checking: Verificando estado de WhatsApp
 * - sending: Enviando mensajes
 * - success: Envío exitoso
 * - error: Error en el proceso
 */

import { Check, Loader2, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SendButtonProps {
  state: 'idle' | 'checking' | 'sending' | 'success' | 'error';
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function SendButton({ 
  state, 
  onClick, 
  disabled = false, 
  label = 'Enviar mensajes',
  className = '' 
}: SendButtonProps) {
  
  const getButtonContent = () => {
    switch (state) {
      case 'checking':
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verificando WhatsApp...</span>
          </>
        );
      
      case 'sending':
        return (
          <>
            <div className="relative">
              <Send className="w-4 h-4 animate-pulse" />
              <div className="absolute inset-0 animate-ping">
                <Send className="w-4 h-4 opacity-75" />
              </div>
            </div>
            <span>Enviando...</span>
          </>
        );
      
      case 'success':
        return (
          <>
            <div className="animate-scale-in">
              <Check className="w-4 h-4" />
            </div>
            <span>¡Enviado!</span>
          </>
        );
      
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4 animate-bounce" />
            <span>Error - Reintentar</span>
          </>
        );
      
      default:
        return (
          <>
            <Send className="w-4 h-4" />
            <span>{label}</span>
          </>
        );
    }
  };

  const getButtonStyles = () => {
    switch (state) {
      case 'checking':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'sending':
        return 'bg-indigo-500 hover:bg-indigo-600';
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return '';
    }
  };

  const isDisabled = disabled || state === 'checking' || state === 'sending' || state === 'success';

  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        flex items-center gap-2 transition-all duration-300
        ${getButtonStyles()}
        ${className}
      `}
    >
      {getButtonContent()}
    </Button>
  );
}
