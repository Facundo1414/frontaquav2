'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, HardDrive, Users, Activity, RefreshCw, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api/axiosInstance';

interface StorageBucket {
  name: string;
  id: string;
  public: boolean;
  file_count: number;
  size_mb: number;
}

interface DatabaseTable {
  table_name: string;
  row_count: number;
  size_mb: number;
}

interface SupabaseMetrics {
  storage: {
    buckets: StorageBucket[];
    total_size_mb: number;
    total_files: number;
  };
  database: {
    tables: DatabaseTable[];
    total_rows: number;
    total_size_mb: number;
  };
  auth: {
    total_users: number;
    active_users_24h: number;
    active_users_7d: number;
    signups_last_30d: number;
  };
}

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'down';
  message: string;
  timestamp: string;
}

export default function SupabaseAdminPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<SupabaseMetrics | null>(null);
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const [metricsRes, healthRes] = await Promise.all([
        api.get('/admin/metrics/supabase'),
        api.get('/admin/metrics/supabase/health'),
      ]);

      setMetrics(metricsRes.data);
      setHealth(healthRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error desconocido');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

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
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!metrics || !health) return null;

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
            <Database className="h-8 w-8" />
            Supabase Metrics
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoreo de storage, database y auth
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
        variant={health.status === 'healthy' ? 'default' : 'destructive'}
        className={
          health.status === 'healthy'
            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
            : ''
        }
      >
        {health.status === 'healthy' ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertDescription>
          <strong>Estado: {health.status === 'healthy' ? '🟢 Saludable' : '🔴 Con problemas'}</strong> - {health.message}
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
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.storage.total_size_mb.toFixed(2)} MB
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.storage.total_files} archivos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Rows</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.database.total_rows.toLocaleString('es-AR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.database.tables.length} tablas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auth Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.auth.total_users}
            </div>
            <p className="text-xs text-muted-foreground">
              usuarios registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buckets</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.storage.buckets.length}
            </div>
            <p className="text-xs text-muted-foreground">
              storage buckets activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Storage Buckets Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Buckets</CardTitle>
          <CardDescription>
            Detalle de uso de cada bucket de almacenamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.storage.buckets.map((bucket) => (
              <div
                key={bucket.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{bucket.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {bucket.public ? '🌐 Público' : '🔒 Privado'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{bucket.size_mb.toFixed(2)} MB</p>
                  <p className="text-sm text-muted-foreground">
                    {bucket.file_count} archivos
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Database Tables Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
          <CardDescription>
            Conteo de filas por tabla principal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.database.tables
              .sort((a, b) => b.row_count - a.row_count)
              .map((table) => (
                <div
                  key={table.table_name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{table.table_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Tabla de datos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {table.row_count.toLocaleString('es-AR')} filas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ~{table.size_mb.toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
