import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProBadgeProps {
  className?: string;
}

export function ProBadge({ className = '' }: ProBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={`bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-md ${className}`}
      title="Esta función requiere Plan PRO"
    >
      <Crown className="w-3 h-3 mr-1" />
      PRO
    </Badge>
  );
}
