'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/lib/api/axiosInstance';
import { logger } from '@/lib/logger';
import {
  Users,
  Crown,
  Shield,
  DollarSign,
  TrendingUp,
  RefreshCw,
  UserPlus,
  Edit,
  Lock,
  Unlock,
  CreditCard,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

interface UserWithSubscription {
  user_id: string;
  email: string;
  full_name: string;
  subscription: {
    id: string;
    plan_type: 'BASE' | 'PRO';
    plan_price: number;
    is_active: boolean;
    login_enabled: boolean;
    last_payment_date: string | null;
    next_billing_date: string | null;
    total_payments_count: number;
    total_revenue: number;
    created_at: string;
    updated_at: string;
  } | null;
}

interface SubscriptionMetrics {
  total_users: number;
  base_users: number;
  pro_users: number;
  active_subscriptions: number;
  inactive_subscriptions: number;
  total_revenue: number;
  monthly_revenue: number;
  pending_payments: number;
}

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [editModal, setEditModal] = useState<{
    open: boolean;
    user: UserWithSubscription | null;
  }>({ open: false, user: null });

  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    user: UserWithSubscription | null;
  }>({ open: false, user: null });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'manual',
    transaction_id: '',
    notes: '',
  });

  /**
   * Load data
   */
  const loadData = async (showToast = false) => {
    try {
      setIsRefreshing(true);

      const [usersResponse, metricsResponse] = await Promise.all([
        api.get('/subscription/admin/all'),
        api.get('/subscription/admin/metrics'),
      ]);

      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data);
      }

      if (metricsResponse.data.success) {
        setMetrics(metricsResponse.data.data);
      }

      if (showToast) {
        toast.success('Datos actualizados');
      }
    } catch (error: any) {
      console.error('❌ Error loading subscriptions:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });
      toast.error(error.response?.data?.message || 'Error al cargar datos');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Create subscription for user
   */
  const handleCreateSubscription = async (userId: string, planType: 'BASE' | 'PRO') => {
    try {
      const payload = {
        user_id: userId,
        plan_type: planType,
        plan_price: planType === 'PRO' ? 75000 : 50000,
        is_active: true,
        login_enabled: true,
      };
      
      logger.log('📤 Creating subscription with payload:', payload);
      logger.log('📊 Payload types:', {
        user_id: typeof userId,
        plan_type: typeof planType,
        plan_price: typeof (planType === 'PRO' ? 5000 : 0),
        is_active: typeof true,
        login_enabled: typeof true,
      });
      
      const response = await api.post('/subscription/admin/create', payload);

      if (response.data.success) {
        toast.success('Suscripción creada exitosamente');
        await loadData();
      }
    } catch (error: any) {
      console.error('❌ Error creating subscription - Full error:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        validation: error?.response?.data?.message,
        config: error?.config,
        request: error?.request,
      });
      
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || 'Error al crear suscripción';
      
      toast.error(errorMessage);
    }
  };

  /**
   * Update plan type
   */
  const handleUpdatePlan = async (userId: string, newPlan: 'BASE' | 'PRO') => {
    try {
      const response = await api.patch(`/subscription/admin/update-plan/${userId}`, {
        plan_type: newPlan,
        plan_price: newPlan === 'PRO' ? 75000 : 50000,
      });

      if (response.data.success) {
        toast.success(`Plan actualizado a ${newPlan}`);
        await loadData();
        setEditModal({ open: false, user: null });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar plan');
    }
  };

  /**
   * Toggle login access
   */
  const handleToggleLogin = async (userId: string, enabled: boolean) => {
    try {
      const response = await api.patch(`/subscription/admin/toggle-login/${userId}`, {
        login_enabled: enabled,
      });

      if (response.data.success) {
        toast.success(`Login ${enabled ? 'habilitado' : 'deshabilitado'}`);
        await loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado de login');
    }
  };

  /**
   * Record payment
   */
  const handleRecordPayment = async () => {
    if (!paymentModal.user) return;

    try {
      const response = await api.post('/subscription/admin/record-payment', {
        user_id: paymentModal.user.user_id,
        amount: parseFloat(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        transaction_id: paymentForm.transaction_id || undefined,
        notes: paymentForm.notes || undefined,
      });

      if (response.data.success) {
        toast.success('Pago registrado exitosamente');
        await loadData();
        setPaymentModal({ open: false, user: null });
        setPaymentForm({ amount: '', payment_method: 'manual', transaction_id: '', notes: '' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar pago');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Panel
      </Button>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Suscripciones</h1>
          <p className="text-muted-foreground">Administra planes y pagos de usuarios</p>
        </div>
        <Button onClick={() => loadData(true)} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_users}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.base_users} Base / {metrics.pro_users} PRO
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.active_subscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.inactive_subscriptions} inactivas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Total</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.total_revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Acumulado histórico</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Mensual</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.monthly_revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Últimos 30 días</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios y Suscripciones</CardTitle>
          <CardDescription>Lista completa de usuarios registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pagos</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.subscription ? (
                      <Badge
                        variant={user.subscription.plan_type === 'PRO' ? 'default' : 'secondary'}
                        className={
                          user.subscription.plan_type === 'PRO'
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : ''
                        }
                      >
                        {user.subscription.plan_type === 'PRO' && <Crown className="h-3 w-3 mr-1" />}
                        {user.subscription.plan_type === 'BASE' && <Shield className="h-3 w-3 mr-1" />}
                        {user.subscription.plan_type}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Sin suscripción</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.subscription ? (
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={user.subscription.is_active ? 'default' : 'destructive'}
                          className="w-fit"
                        >
                          {user.subscription.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {!user.subscription.login_enabled && (
                          <Badge variant="destructive" className="w-fit">
                            <Lock className="h-3 w-3 mr-1" />
                            Login bloqueado
                          </Badge>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {user.subscription ? user.subscription.total_payments_count : 0}
                  </TableCell>
                  <TableCell>
                    {user.subscription ? `$${user.subscription.total_revenue.toLocaleString()}` : '$0'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!user.subscription ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateSubscription(user.user_id, 'BASE')}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Crear Sub
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditModal({ open: true, user })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleToggleLogin(user.user_id, !user.subscription!.login_enabled)
                            }
                          >
                            {user.subscription.login_enabled ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPaymentModal({ open: true, user })}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={editModal.open} onOpenChange={(open) => setEditModal({ open, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Suscripción</DialogTitle>
            <DialogDescription>
              Usuario: {editModal.user?.full_name} ({editModal.user?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cambiar Plan</Label>
              <Select
                defaultValue={editModal.user?.subscription?.plan_type || 'BASE'}
                onValueChange={(value: 'BASE' | 'PRO') => {
                  if (editModal.user) {
                    handleUpdatePlan(editModal.user.user_id, value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASE">Plan BASE ($35 USD/mes)</SelectItem>
                  <SelectItem value="PRO">Plan PRO ($60 USD/mes + 400 msg)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog
        open={paymentModal.open}
        onOpenChange={(open) => {
          setPaymentModal({ open, user: null });
          if (!open) {
            setPaymentForm({ amount: '', payment_method: 'manual', transaction_id: '', notes: '' });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Usuario: {paymentModal.user?.full_name} ({paymentModal.user?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="50000"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Método de Pago</Label>
              <Select
                value={paymentForm.payment_method}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="mercadopago">MercadoPago</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction">ID de Transacción (Opcional)</Label>
              <Input
                id="transaction"
                placeholder="ABC123..."
                value={paymentForm.transaction_id}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, transaction_id: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones adicionales..."
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPaymentModal({ open: false, user: null });
                setPaymentForm({
                  amount: '',
                  payment_method: 'manual',
                  transaction_id: '',
                  notes: '',
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRecordPayment}
              disabled={!paymentForm.amount || parseFloat(paymentForm.amount) <= 0}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Registrar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
