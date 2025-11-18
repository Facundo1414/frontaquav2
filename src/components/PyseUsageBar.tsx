'use client';

import { useState, useEffect } from 'react';
import { useGlobalContext } from '@/app/providers/context/GlobalContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PyseUsageStatus {
  used_today: number;
  remaining_today: number;
  limit_daily: number;
  percentage_used: number;
  can_query: boolean;
  plan: 'BASE' | 'PRO';
  user_id: string;
}

export function PyseUsageBar() {
  const { accessToken, userId } = useGlobalContext();
  const [status, setStatus] = useState<PyseUsageStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!accessToken || !userId) return;

      try {
        const response = await fetch('/api/pyse/usage/status', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Error fetching PYSE usage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Refrescar cada 30 segundos
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [accessToken, userId]);

  if (loading || !status) return null;

  const isWarning = status.percentage_used >= 80 && status.percentage_used < 100;
  const isCritical = status.percentage_used >= 100;

  return (
    <Card className={`${isCritical ? 'border-red-500' : isWarning ? 'border-yellow-500' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Uso de Consultas PYSE - Plan {status.plan}
        </CardTitle>
        <CardDescription className="text-xs">
          Límite diario: {status.limit_daily} consultas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Usadas hoy:</span>
          <span className="font-semibold">
            {status.used_today} / {status.limit_daily}
          </span>
        </div>

        <Progress 
          value={status.percentage_used} 
          className={`h-2 ${isCritical ? 'bg-red-100' : isWarning ? 'bg-yellow-100' : ''}`}
        />

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{status.percentage_used}% utilizado</span>
          <span className={`font-medium ${isCritical ? 'text-red-600' : 'text-green-600'}`}>
            {status.remaining_today} restantes
          </span>
        </div>

        {isCritical && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Has alcanzado el límite diario de consultas. Se renovará mañana.
            </AlertDescription>
          </Alert>
        )}

        {isWarning && !isCritical && (
          <Alert className="mt-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-300">
              Estás cerca del límite. Quedan {status.remaining_today} consultas hoy.
            </AlertDescription>
          </Alert>
        )}

        {!isWarning && !isCritical && (
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mt-2">
            <CheckCircle className="h-3 w-3" />
            <span>Cuota disponible</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Versión compacta para mostrar en header o nav
 */
export function PyseUsageBadge() {
  const { accessToken, userId } = useGlobalContext();
  const [status, setStatus] = useState<PyseUsageStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!accessToken || !userId) return;

      try {
        const response = await fetch('/api/pyse/usage/status', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Error fetching PYSE usage:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Cada minuto
    return () => clearInterval(interval);
  }, [accessToken, userId]);

  if (!status) return null;

  const isCritical = status.percentage_used >= 100;
  const isWarning = status.percentage_used >= 80 && status.percentage_used < 100;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
        isCritical
          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
          : isWarning
          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
          : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
      }`}
    >
      <TrendingUp className="h-3 w-3" />
      <span>
        {status.remaining_today}/{status.limit_daily} PYSE
      </span>
    </div>
  );
}
