import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Cargando...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="p-6 min-w-[300px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-center font-medium">{message}</p>
        </div>
      </Card>
    </div>
  );
}
