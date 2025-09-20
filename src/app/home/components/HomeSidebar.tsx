"use client";
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface HomeSidebarProps {
  onOpenWhatsappModal: () => void;
  onLogout?: () => void; // futura implementación
}

export function HomeSidebar({ onOpenWhatsappModal, onLogout }: HomeSidebarProps) {
  // Acciones administrativas removidas (reinit)

  return (
    <aside className="w-60 shrink-0 border-r bg-white/70 backdrop-blur p-4 flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wide mb-2">WHATSAPP</h2>
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" onClick={onOpenWhatsappModal}>
            Abrir sesión / QR
          </Button>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wide mb-2">CUENTA</h2>
        <Button variant="ghost" size="sm" onClick={onLogout} disabled={!onLogout} className="justify-start">
          <LogOut className="h-4 w-4" />
          <span className="ml-2">Cerrar sesión (próx.)</span>
        </Button>
      </div>
      <div className="mt-auto text-[10px] text-muted-foreground">
        v1 · Estado experimental
      </div>
    </aside>
  );
}
