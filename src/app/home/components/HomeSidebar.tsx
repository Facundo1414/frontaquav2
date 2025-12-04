"use client";
import { Button } from '@/components/ui/button';
import { LogOut, Settings } from 'lucide-react';
import { useGlobalContext } from '@/app/providers/context/GlobalContext';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

interface HomeSidebarProps {
  onOpenWhatsappModal: () => void;
  onLogout?: () => void; // futura implementación
}

export function HomeSidebar({ onOpenWhatsappModal, onLogout }: HomeSidebarProps) {
  const { userId } = useGlobalContext();
  const router = useRouter();
  // Leer ADMIN_UID desde variables de entorno
  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || '';
  const isAdmin = userId === ADMIN_UID;

  // Debug: verificar comparación
  logger.log('🔍 HomeSidebar Debug:', {
    userId,
    ADMIN_UID,
    isAdmin,
    match: userId === ADMIN_UID
  });

  return (
    <aside className="w-60 shrink-0 border-r bg-white/70 backdrop-blur p-4 flex flex-col gap-4">
      {/* Admin Panel - Solo visible para admin */}
      {isAdmin && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-muted-foreground tracking-wide mb-2">ADMINISTRACIÓN</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/admin')}
            className="justify-start w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 border-0"
          >
            <Settings className="h-4 w-4" />
            <span className="ml-2">⚙️ Panel Admin</span>
          </Button>
        </div>
      )}

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
