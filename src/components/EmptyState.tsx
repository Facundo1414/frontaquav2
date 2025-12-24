import { LucideIcon, FileQuestion, Inbox, Search, FolderOpen, Database, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateVariant = 'default' | 'minimal' | 'card' | 'illustrated' | 'compact';
type EmptyStateTheme = 'neutral' | 'info' | 'warning' | 'success';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: EmptyStateVariant;
  theme?: EmptyStateTheme;
  className?: string;
}

// Iconos predeterminados según contexto
const defaultIcons: Record<string, LucideIcon> = {
  search: Search,
  files: FolderOpen,
  data: Database,
  inbox: Inbox,
  default: FileQuestion
};

// Colores según tema
const themeStyles: Record<EmptyStateTheme, { icon: string; bg: string; border: string }> = {
  neutral: { 
    icon: 'text-slate-400', 
    bg: 'from-slate-100 to-slate-50', 
    border: 'border-slate-200/50' 
  },
  info: { 
    icon: 'text-cyan-500', 
    bg: 'from-cyan-50 to-slate-50', 
    border: 'border-cyan-200/50' 
  },
  warning: { 
    icon: 'text-amber-500', 
    bg: 'from-amber-50 to-slate-50', 
    border: 'border-amber-200/50' 
  },
  success: { 
    icon: 'text-emerald-500', 
    bg: 'from-emerald-50 to-slate-50', 
    border: 'border-emerald-200/50' 
  }
};

export function EmptyState({ 
  icon: Icon = FileQuestion, 
  title, 
  description, 
  action,
  variant = 'default',
  theme = 'neutral',
  className
}: EmptyStateProps) {
  const styles = themeStyles[theme];

  // Variante minimal - muy simple
  if (variant === 'minimal') {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 px-4 text-center", className)}>
        <Icon className={cn("w-8 h-8 mb-3", styles.icon)} />
        <p className="text-sm text-muted-foreground">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }

  // Variante compact - para espacios pequeños
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-3 py-4 px-4 text-left", className)}>
        <div className={cn("p-2 rounded-lg bg-gradient-to-br", styles.bg, styles.border)}>
          <Icon className={cn("w-5 h-5", styles.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        {action}
      </div>
    );
  }

  // Variante card - con borde punteado
  if (variant === 'card') {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center rounded-xl",
        "bg-gradient-to-br from-slate-50/80 to-white",
        "border-2 border-dashed border-slate-200",
        className
      )}>
        <div className={cn(
          "rounded-2xl p-4 mb-4 shadow-sm border bg-white",
          styles.border
        )}>
          <Icon className={cn("w-8 h-8", styles.icon)} />
        </div>
        <h3 className="text-base font-medium text-slate-700 mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    );
  }

  // Variante illustrated - con decoración de fondo
  if (variant === 'illustrated') {
    return (
      <div className={cn(
        "relative flex flex-col items-center justify-center py-16 px-4 text-center overflow-hidden",
        className
      )}>
        {/* Decoración de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-slate-100/60 rounded-full blur-2xl" />
        </div>
        
        <div className={cn(
          "relative rounded-3xl p-6 mb-6 border bg-white/80 backdrop-blur-sm shadow-lg",
          styles.border
        )}>
          <Icon className={cn("w-12 h-12", styles.icon)} />
        </div>
        <h3 className="relative text-xl font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="relative text-muted-foreground mb-6 max-w-md">{description}</p>
        {action && <div className="relative">{action}</div>}
      </div>
    );
  }

  // Variante default
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center",
      className
    )}>
      <div className={cn(
        "rounded-2xl p-5 mb-5 border bg-gradient-to-br",
        styles.bg, 
        styles.border
      )}>
        <Icon className={cn("w-10 h-10", styles.icon)} />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md text-sm">{description}</p>
      {action}
    </div>
  );
}

// Empty states preconfigurados para casos comunes
export function NoResultsState({ 
  searchTerm,
  onClear
}: { 
  searchTerm?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      icon={Search}
      title="Sin resultados"
      description={searchTerm 
        ? `No encontramos resultados para "${searchTerm}"`
        : "No encontramos lo que buscas"
      }
      variant="card"
      theme="info"
      action={onClear && (
        <Button variant="outline" size="sm" onClick={onClear}>
          Limpiar búsqueda
        </Button>
      )}
    />
  );
}

export function NoDataState({ 
  title = "Sin datos",
  description = "No hay datos disponibles en este momento",
  action
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <EmptyState
      icon={Database}
      title={title}
      description={description}
      variant="default"
      theme="neutral"
      action={action}
    />
  );
}

export function EmptyInboxState({
  title = "Bandeja vacía",
  description = "No tienes elementos pendientes"
}: {
  title?: string;
  description?: string;
}) {
  return (
    <EmptyState
      icon={Inbox}
      title={title}
      description={description}
      variant="illustrated"
      theme="success"
    />
  );
}

// Skeleton loader reutilizable
export function SkeletonLoader({ 
  className = '',
  variant = 'text'
}: { 
  className?: string;
  variant?: 'text' | 'circle' | 'card' | 'avatar' | 'button';
}) {
  const baseClasses = 'animate-pulse bg-slate-200 rounded';
  
  const variants = {
    text: 'h-4 w-full',
    circle: 'rounded-full',
    card: 'h-32 w-full rounded-xl',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-9 w-24 rounded-md',
  };

  return <div className={cn(baseClasses, variants[variant], className)} />;
}

// Componente de loading para páginas completas
export function PageLoader({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-slate-200 rounded-full" />
        <div className="absolute inset-0 w-12 h-12 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Skeleton para tablas
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-slate-200">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLoader key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader 
              key={colIndex} 
              className={cn(
                "h-4 flex-1",
                colIndex === 0 && "max-w-[150px]"
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Skeleton para cards de servicio
export function ServiceCardSkeleton() {
  return (
    <div className="h-[160px] rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 animate-pulse p-5 flex flex-col items-center justify-center gap-3 border border-slate-200/50">
      <div className="w-10 h-10 rounded-xl bg-slate-200" />
      <div className="w-32 h-4 bg-slate-200 rounded" />
      <div className="w-48 h-3 bg-slate-200 rounded" />
    </div>
  );
}

// Skeleton para lista de items
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
          <SkeletonLoader variant="avatar" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="h-4 w-1/3" />
            <SkeletonLoader className="h-3 w-2/3" />
          </div>
          <SkeletonLoader variant="button" />
        </div>
      ))}
    </div>
  );
}

// Stats skeleton
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white">
          <SkeletonLoader className="h-3 w-20 mb-2" />
          <SkeletonLoader className="h-7 w-16" />
        </div>
      ))}
    </div>
  );
}
