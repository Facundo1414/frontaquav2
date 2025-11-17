import { ReactNode } from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import { ProBadge } from './ProBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Crown } from 'lucide-react';
import { useState } from 'react';

interface RequiresPlanProps {
  children: ReactNode;
  plan: 'BASE' | 'PRO';
  fallback?: ReactNode;
  showBadge?: boolean;
}

export function RequiresPlan({ 
  children, 
  plan, 
  fallback, 
  showBadge = true 
}: RequiresPlanProps) {
  const { isPro, isBase, isLoading } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  if (isLoading) {
    return <div className="opacity-50">{children}</div>;
  }

  // Check access based on plan
  const hasAccess = plan === 'BASE' ? true : isPro;

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Mostrar el contenido pero deshabilitado con badge PRO
    return (
      <div className="relative inline-block">
        <div 
          className="opacity-60 pointer-events-none cursor-not-allowed"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {children}
        </div>
        {showBadge && plan === 'PRO' && (
          <div className="absolute -top-2 -right-2 z-10">
            <ProBadge />
          </div>
        )}
        
        {/* Overlay invisible para capturar clicks */}
        <div 
          className="absolute inset-0 cursor-pointer z-20"
          onClick={() => setShowUpgradeDialog(true)}
        />

        {/* Modal de upgrade */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Función Premium
              </DialogTitle>
              <DialogDescription>
                Esta función está disponible solo para usuarios con Plan PRO.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Plan PRO - $75,000/mes
                </p>
                <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                  <li>✓ Envío masivo de comprobantes por WhatsApp</li>
                  <li>✓ Notificaciones de próximos vencimientos</li>
                  <li>✓ Generación automática de PDFs</li>
                  <li>✓ Todas las funciones BASE incluidas</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                Contacta al administrador para actualizar tu plan.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setShowUpgradeDialog(false)}>
                Entendido
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return <>{children}</>;
}
