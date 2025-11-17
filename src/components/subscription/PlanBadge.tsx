'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/context/SubscriptionContext';
import { Crown, Shield, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanBadgeProps {
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({ 
  className, 
  showIcon = true,
  size = 'md'
}) => {
  const { subscription, isLoading, isPro, isBase } = useSubscription();

  if (isLoading) {
    return (
      <Badge variant="outline" className={cn('gap-1', className)}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Cargando...</span>
      </Badge>
    );
  }

  // No mostrar nada si no hay suscripción
  if (!subscription) {
    return null;
  }

  // Estilos según tamaño
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  if (isPro) {
    return (
      <Badge 
        className={cn(
          'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-none',
          'shadow-md hover:shadow-lg transition-shadow',
          'gap-1.5 font-semibold',
          sizeClasses[size],
          className
        )}
      >
        {showIcon && <Crown className={iconSizes[size]} />}
        <span>Plan PRO</span>
      </Badge>
    );
  }

  if (isBase) {
    return (
      <Badge 
        variant="secondary"
        className={cn(
          'bg-gray-200 text-gray-700 border-gray-300',
          'gap-1.5',
          sizeClasses[size],
          className
        )}
      >
        {showIcon && <Shield className={iconSizes[size]} />}
        <span>Plan Base</span>
      </Badge>
    );
  }

  return null;
};

export default PlanBadge;
