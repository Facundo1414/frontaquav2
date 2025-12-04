'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Train, Activity, GitBranch, DollarSign, RefreshCw, AlertCircle, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api/axiosInstance';
import { logger } from '@/lib/logger';

interface RailwayService {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'deploying' | 'error';
  deploymentStatus: string;
  updatedAt: string;
}

interface RailwayDeployment {
  id: string;
  status: string;
  createdAt: string;
  creator: string;
}

interface RailwayMetrics {
  project: {
    id: string;
    name: string;
    createdAt: string;
  };
  services: RailwayService[];
  deployments: RailwayDeployment[];
  usage: {
    current_month: {
      cpu: number;
      memory: number;
      network: number;
      volume: number;
    };
    estimated_cost: number;
    free_tier_remaining: number;
  };
}

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'down';
  message: string;
  timestamp: string;
}

export default function RailwayAdminPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<RailwayMetrics | null>(null);
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      setError(null);

      logger.log('🔄 [Railway] Fetching metrics...');

      const [metricsRes, healthRes] = await Promise.all([
        api.get('/admin/metrics/railway'),
        api.get('/admin/metrics/railway/health'),
      ]);

      logger.log('📊 [Railway] Metrics response:', metricsRes.data);
      logger.log('🏥 [Railway] Health response:', healthRes.data);

      setMetrics(metricsRes.data);
      setHealth(healthRes.data);
      
      logger.log('✅ [Railway] Data loaded successfully');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error desconocido';
      console.error('❌ [Railway] Error fetching metrics:', err);
      console.error('❌ [Railway] Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: errorMsg
      });
      setError(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      running: { variant: 'default', label: '🟢 Running' },
      stopped: { variant: 'secondary', label: '⚫ Stopped' },
      deploying: { variant: 'outline', label: '🔄 Deploying' },
      error: { variant: 'destructive', label: '🔴 Error' },
      SUCCESS: { variant: 'default', label: '✅ Success' },
      FAILED: { variant: 'destructive', label: '❌ Failed' },
      PENDING: { variant: 'outline', label: '⏳ Pending' },
    };

    const config = statusMap[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push('/admin')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Error al cargar métricas de Railway</p>
            <p className="text-sm mb-2">{error}</p>
            <p className="text-xs">
              Si el error es &quot;Not Authorized&quot;, necesitas generar un nuevo token en:{' '}
              <a 
                href="https://railway.app/account/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline"
              >
                railway.app/account/tokens
              </a>
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!metrics || !health) return null;

  const freeTierUsage = ((5 - metrics.usage.free_tier_remaining) / 5) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => router.push('/admin')}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Dashboard
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Train className="h-8 w-8" />
            Railway Metrics
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoreo de servicios, deployments y costos
          </p>
        </div>
        <Button
          onClick={fetchMetrics}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Health Status */}
      <Alert
        variant={health.status === 'healthy' ? 'default' : health.status === 'degraded' ? 'default' : 'destructive'}
        className={
          health.status === 'healthy'
            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
            : health.status === 'degraded'
            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
            : ''
        }
      >
        {health.status === 'healthy' ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertDescription>
          <strong>Estado: {health.status === 'healthy' ? '🟢 Saludable' : health.status === 'degraded' ? '🟡 Limitado' : '🔴 Con problemas'}</strong> - {health.message}
          {(health.status === 'degraded' || health.status === 'down') && (health.message.includes('Not Authorized') || health.message.includes('RAILWAY_API_TOKEN')) && (
            <div className="mt-2 text-xs">
              💡 <strong>Solución:</strong> Genera un nuevo token en{' '}
              <a 
                href="https://railway.app/account/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                railway.app/account/tokens
              </a>{' '}
              y actualiza la variable <code className="bg-black/10 px-1 rounded">RAILWAY_API_TOKEN</code> en el backend.
            </div>
          )}
          <br />
          <span className="text-xs text-muted-foreground">
            Última actualización: {new Date(health.timestamp).toLocaleString('es-AR')}
          </span>
        </AlertDescription>
      </Alert>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.services.filter((s) => s.status === 'running').length} / {metrics.services.length}
            </div>
            <p className="text-xs text-muted-foreground">servicios corriendo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployments</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.deployments.length}</div>
            <p className="text-xs text-muted-foreground">últimos 10 despliegues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Estimado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.usage.estimated_cost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">mes actual</p>
          </CardContent>
        </Card>

        <Card className={freeTierUsage > 80 ? 'border-red-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Tier</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.usage.free_tier_remaining.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {freeTierUsage.toFixed(0)}% usado de $5.00
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${freeTierUsage > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${freeTierUsage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle>Servicios Deployados</CardTitle>
          <CardDescription>Estado actual de cada servicio en Railway</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {new Date(service.updatedAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  {getStatusBadge(service.status)}
                  {service.deploymentStatus && (
                    <div className="text-xs text-muted-foreground">
                      Deploy: {getStatusBadge(service.deploymentStatus)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Deployments */}
      <Card>
        <CardHeader>
          <CardTitle>Deployments Recientes</CardTitle>
          <CardDescription>Historial de los últimos despliegues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.deployments.map((deployment) => (
              <div
                key={deployment.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <GitBranch className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Deploy by {deployment.creator}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {new Date(deployment.createdAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">{getStatusBadge(deployment.status)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="font-medium">{metrics.project.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono text-sm">{metrics.project.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creado:</span>
              <span className="text-sm">
                {new Date(metrics.project.createdAt).toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
