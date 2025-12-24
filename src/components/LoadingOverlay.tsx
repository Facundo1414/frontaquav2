import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type LoadingVariant = 'default' | 'minimal' | 'fullscreen' | 'inline';
type LoadingStatus = 'loading' | 'success' | 'error';

interface LoadingOverlayProps {
  message?: string;
  variant?: LoadingVariant;
  status?: LoadingStatus;
  progress?: number; // 0-100
  subMessage?: string;
}

export function LoadingOverlay({ 
  message = 'Cargando...', 
  variant = 'default',
  status = 'loading',
  progress,
  subMessage
}: LoadingOverlayProps) {
  
  // Variante inline - para usar dentro de componentes
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />}
        {status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        {status === 'error' && <AlertCircle className="w-4 h-4 text-rose-500" />}
        <span>{message}</span>
      </div>
    );
  }

  // Variante minimal - spinner simple
  if (variant === 'minimal') {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <div className="relative">
          <div className="w-8 h-8 border-2 border-slate-200 rounded-full" />
          <div className="absolute inset-0 w-8 h-8 border-2 border-cyan-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }

  // Contenido del loader
  const LoaderContent = () => (
    <div className="flex flex-col items-center gap-4">
      {/* Spinner con estados */}
      <div className="relative">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-3 border-slate-200 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-3 border-cyan-500 rounded-full border-t-transparent animate-spin" />
          </>
        )}
        {status === 'success' && (
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
        )}
        {status === 'error' && (
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
            <AlertCircle className="w-7 h-7 text-rose-600" />
          </div>
        )}
      </div>

      {/* Mensaje principal */}
      <div className="text-center">
        <p className={cn(
          "font-medium",
          status === 'loading' && "text-slate-700",
          status === 'success' && "text-emerald-700",
          status === 'error' && "text-rose-700"
        )}>
          {message}
        </p>
        {subMessage && (
          <p className="text-sm text-muted-foreground mt-1">{subMessage}</p>
        )}
      </div>

      {/* Barra de progreso opcional */}
      {progress !== undefined && status === 'loading' && (
        <div className="w-full max-w-[200px]">
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1.5">
            {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );

  // Variante fullscreen - ocupa toda la pantalla
  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
        <LoaderContent />
      </div>
    );
  }

  // Variante default - overlay con card
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-150">
      <Card className="p-8 min-w-[280px] shadow-card border-slate-200/50 animate-in zoom-in-95 duration-200">
        <LoaderContent />
      </Card>
    </div>
  );
}

// Skeleton loader para contenido
export function ContentSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "h-4 bg-slate-200 rounded animate-pulse",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

// Skeleton para cards
export function CardSkeleton({ 
  hasImage = false,
  hasActions = false 
}: { 
  hasImage?: boolean;
  hasActions?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
      {hasImage && (
        <div className="h-40 bg-slate-200 animate-pulse" />
      )}
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-slate-200 rounded animate-pulse w-full" />
        <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6" />
        {hasActions && (
          <div className="flex gap-2 pt-2">
            <div className="h-9 bg-slate-200 rounded animate-pulse w-24" />
            <div className="h-9 bg-slate-200 rounded animate-pulse w-24" />
          </div>
        )}
      </div>
    </div>
  );
}

// Spinner inline simple
export function Spinner({ 
  size = 'md',
  className = ''
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={cn("animate-spin text-cyan-600", sizes[size], className)} />
  );
}

// Loading dots animados
export function LoadingDots() {
  return (
    <div className="flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
