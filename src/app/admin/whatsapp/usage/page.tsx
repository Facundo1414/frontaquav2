"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/providers/context/GlobalContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Loader2,
  Settings,
  AlertCircle,
  CheckCircle2,
  Shield,
} from "lucide-react";
import api from "@/lib/api/axiosInstance";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface MonthlyUsage {
  total_conversations: number;
  free_tier_used: number;
  paid_conversations: number;
  total_cost: number;
  by_purpose: Record<string, number>;
  current_month: string;
}

interface WhatsappConfig {
  whatsapp_phone_number_id: string;
  whatsapp_business_account_id: string;
  whatsapp_enabled: boolean;
  whatsapp_verified_at?: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];
const FREE_TIER_LIMIT = 1000;
const COST_PER_CONVERSATION = 0.095;
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || '';

export default function WhatsappUsagePage() {
  const router = useRouter();
  const { userId } = useGlobalContext();
  const [config, setConfig] = useState<WhatsappConfig | null>(null);
  const [usage, setUsage] = useState<MonthlyUsage | null>(null);
  const [history, setHistory] = useState<MonthlyUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verificar autenticación
  useEffect(() => {
    if (!userId) {
      toast.error("Debe iniciar sesión para acceder");
      router.push("/login");
      return;
    }

    const isAdmin = userId === ADMIN_UID;
    console.log('🔐 WhatsApp Usage - Auth Check:', {
      userId,
      isAdmin,
    });

    setIsCheckingAuth(false);
  }, [userId, router]);

  useEffect(() => {
    if (!isCheckingAuth) {
      loadData();
    }
  }, [isCheckingAuth]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [configRes, usageRes, historyRes] = await Promise.all([
        api.get<WhatsappConfig>("/whatsapp/config"),
        api.get<MonthlyUsage>("/whatsapp/usage"),
        api.get<MonthlyUsage[]>("/whatsapp/usage/history?months=6"),
      ]);

      setConfig(configRes.data);
      setUsage(usageRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando datos de uso...</p>
        </div>
      </div>
    );
  }

  if (!config || !config.whatsapp_enabled) {
    const isAdmin = userId === ADMIN_UID;
    
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <Alert>
          <AlertCircle className="w-5 h-5" />
          <AlertDescription>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {isAdmin 
                    ? "Cuenta Admin - Sin tracking de uso" 
                    : "WhatsApp Cloud API no configurado"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isAdmin
                    ? "Tu cuenta usa Baileys sin tracking de costos. No hay estadísticas que mostrar."
                    : "Configura tus credenciales para comenzar a usar WhatsApp Business"}
                </p>
              </div>
              {!isAdmin && (
                <Button onClick={() => router.push("/admin/whatsapp/config")}>
                  Configurar Ahora
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const freeRemaining = Math.max(0, FREE_TIER_LIMIT - (usage?.free_tier_used || 0));
  const freePercentage = ((usage?.free_tier_used || 0) / FREE_TIER_LIMIT) * 100;
  const projectedMonthly =
    history.length > 0
      ? history.slice(0, 3).reduce((sum, m) => sum + m.total_conversations, 0) / Math.min(3, history.length)
      : 0;
  const projectedCost = Math.max(0, (projectedMonthly - FREE_TIER_LIMIT) * COST_PER_CONVERSATION);

  // Prepare chart data
  const historyChartData = history
    .slice()
    .reverse()
    .map((m) => ({
      month: m.current_month,
      Conversaciones: m.total_conversations,
      Costo: parseFloat(m.total_cost.toFixed(2)),
    }));

  const purposeChartData = usage
    ? Object.entries(usage.by_purpose).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Uso de WhatsApp Business API</h1>
          <p className="text-muted-foreground mt-2">
            Monitorea tus conversaciones y costos en tiempo real
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/whatsapp/config")}>
          <Settings className="w-4 h-4 mr-2" />
          Configuración
        </Button>
      </div>

      {/* Status Banner */}
      <Alert
        className={
          freePercentage < 80
            ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
            : freePercentage < 95
            ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
            : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
        }
      >
        <CheckCircle2 className="w-5 h-5" />
        <AlertDescription>
          <p className="font-medium">
            {freePercentage < 80
              ? "✅ Estás dentro del free tier"
              : freePercentage < 95
              ? "⚠️ Acercándote al límite gratuito"
              : "🔴 Has superado el free tier"}
          </p>
          <p className="text-sm mt-1">
            {freeRemaining > 0
              ? `Te quedan ${freeRemaining} conversaciones gratuitas este mes`
              : `Has usado ${usage?.paid_conversations || 0} conversaciones pagadas`}
          </p>
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversaciones (Mes)</CardTitle>
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage?.total_conversations || 0}</div>
            <p className="text-xs text-muted-foreground">
              {usage?.free_tier_used || 0} gratuitas, {usage?.paid_conversations || 0} pagadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Tier Restante</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{freeRemaining}</div>
            <Progress value={freePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {freePercentage.toFixed(1)}% usado de 1,000
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Este Mes</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(usage?.total_cost || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyección Mensual</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${projectedCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ~{Math.round(projectedMonthly)} conversaciones/mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Uso (6 meses)</CardTitle>
            <CardDescription>Conversaciones y costos por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={historyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="Conversaciones"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="Costo"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Purpose Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Conversaciones por Propósito</CardTitle>
            <CardDescription>Distribución de uso este mes</CardDescription>
          </CardHeader>
          <CardContent>
            {purposeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={purposeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {purposeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No hay datos de conversaciones aún
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Footer */}
      <Card className="bg-muted">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">💡 Optimiza tus costos</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Agrupa mensajes al mismo contacto en 24 horas = 1 sola conversación</li>
            <li>• Usa mensajes de sesión cuando el cliente te escribió primero (gratis hasta que responda)</li>
            <li>• Los templates siempre se cobran (aunque el cliente no responda)</li>
            <li>• Planifica envíos para maximizar el free tier de 1,000/mes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
