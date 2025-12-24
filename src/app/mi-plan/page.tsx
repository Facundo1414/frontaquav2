'use client'

import { useSubscription, getFeatureLabel, getProFeatures, getBaseFeatures } from '@/context/SubscriptionContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  Check, 
  X, 
  Sparkles, 
  MessageCircle, 
  FileText, 
  Users, 
  Bell,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  ArrowRight,
  Loader2,
  Calendar,
  CreditCard
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MiPlanPage() {
  const router = useRouter()
  const { 
    subscription, 
    isLoading, 
    isPro, 
    isBase, 
    daysUntilBilling,
    isOverdue 
  } = useSubscription()

  const proFeatures = getProFeatures()
  const baseFeatures = getBaseFeatures()

  // Características detalladas para mostrar
  const allFeatures = [
    {
      id: 'send_debts',
      name: 'Enviar Comprobantes Vencidos',
      description: 'Envía automáticamente comprobantes de deuda a todos tus clientes con plan de pago',
      icon: FileText,
      isPro: true,
    },
    {
      id: 'send_proximos_vencer',
      name: 'Notificar Próximos a Vencer',
      description: 'Alerta a clientes sobre vencimientos cercanos para mejorar la cobranza',
      icon: Bell,
      isPro: true,
    },
    {
      id: 'generate_reports',
      name: 'Generar Reportes de Deuda',
      description: 'Crea reportes detallados en PDF para enviar a tus clientes',
      icon: TrendingUp,
      isPro: true,
    },
    {
      id: 'send_sin_plan',
      name: 'Enviar a Clientes sin Plan',
      description: 'Contacta clientes con +3 comprobantes vencidos sin plan de pago activo',
      icon: Users,
      isPro: true,
    },
    {
      id: 'filter_clients',
      name: 'Filtrar Clientes PYSE',
      description: 'Filtra y segmenta tu cartera de clientes por diferentes criterios',
      icon: Users,
      isPro: false,
    },
    {
      id: 'recover_files',
      name: 'Recuperar Archivos',
      description: 'Accede a respaldos de archivos enviados anteriormente',
      icon: Shield,
      isPro: false,
    },
    {
      id: 'client_database',
      name: 'Base de Clientes',
      description: 'Importa y gestiona tu base de datos de clientes desde Excel',
      icon: Users,
      isPro: false,
    },
    {
      id: 'faq',
      name: 'Preguntas Frecuentes',
      description: 'Accede a la documentación y guías de uso',
      icon: MessageCircle,
      isPro: false,
    },
  ]

  // Beneficios adicionales del plan PRO
  const proBenefits = [
    { icon: Zap, text: 'Envíos ilimitados de WhatsApp' },
    { icon: Clock, text: 'Soporte prioritario' },
    { icon: Shield, text: 'Respaldos automáticos' },
    { icon: TrendingUp, text: 'Estadísticas avanzadas' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Mi Plan
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Gestiona tu suscripción y conoce todos los beneficios disponibles
          </p>
        </div>

        {/* Plan Actual Card */}
        <Card className={`border-2 ${isPro ? 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30' : 'border-slate-200'}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isPro ? (
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                ) : (
                  <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-xl">
                    <CreditCard className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-xl">
                    Plan {isPro ? 'PRO' : 'BASE'}
                  </CardTitle>
                  <CardDescription>
                    {isPro ? 'Acceso completo a todas las funcionalidades' : 'Funcionalidades básicas incluidas'}
                  </CardDescription>
                </div>
              </div>
              <Badge 
                variant={isPro ? 'default' : 'secondary'}
                className={isPro ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : ''}
              >
                {subscription?.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Info de facturación */}
            {subscription && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Próximo cobro</p>
                    <p className="font-medium text-sm">
                      {subscription.next_billing_date 
                        ? new Date(subscription.next_billing_date).toLocaleDateString('es-AR')
                        : 'No definido'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Días restantes</p>
                    <p className={`font-medium text-sm ${isOverdue ? 'text-red-500' : ''}`}>
                      {daysUntilBilling !== null 
                        ? (daysUntilBilling > 0 ? `${daysUntilBilling} días` : 'Vencido')
                        : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Precio mensual</p>
                    <p className="font-medium text-sm">
                      ${subscription.plan_price?.toLocaleString('es-AR') || '0'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CTA para upgrade si es BASE */}
            {isBase && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-200 dark:border-cyan-800">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-cyan-600" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">¿Querés más funcionalidades?</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Mejorá a PRO y desbloquea todo el potencial</p>
                  </div>
                </div>
                <Button 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  onClick={() => window.open('https://wa.me/3513479404?text=Hola%2C%20quiero%20mejorar%20mi%20plan%20a%20PRO', '_blank')}
                >
                  Mejorar a PRO
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparación de planes */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Plan BASE */}
          <Card className={`${isBase ? 'ring-2 ring-slate-400' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-slate-500" />
                  Plan BASE
                </CardTitle>
                {isBase && <Badge variant="outline">Tu plan actual</Badge>}
              </div>
              <CardDescription>Funcionalidades esenciales para comenzar</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {allFeatures.map((feature) => (
                  <li key={feature.id} className="flex items-start gap-3">
                    {!feature.isPro ? (
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${feature.isPro ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {feature.name}
                      </p>
                      {!feature.isPro && (
                        <p className="text-xs text-slate-500">{feature.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Plan PRO */}
          <Card className={`${isPro ? 'ring-2 ring-cyan-400' : ''} relative overflow-hidden`}>
            {/* Badge PRO - Solo mostrar RECOMENDADO si no tiene plan PRO */}
            {!isPro && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                RECOMENDADO
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-cyan-500" />
                  Plan PRO
                </CardTitle>
                {isPro && <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600">Tu plan actual</Badge>}
              </div>
              <CardDescription>Todo lo que necesitás para maximizar tu cobranza</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {allFeatures.map((feature) => (
                  <li key={feature.id} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {feature.name}
                      </p>
                      <p className="text-xs text-slate-500">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Beneficios extra */}
              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Beneficios adicionales:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {proBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <benefit.icon className="h-4 w-4 text-cyan-500" />
                      <span>{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              {isBase && (
                <Button 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  onClick={() => window.open('https://wa.me/3513479404?text=Hola%2C%20quiero%20mejorar%20mi%20plan%20a%20PRO', '_blank')}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Mejorar a PRO
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ rápido */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">¿Tenés dudas?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="font-medium text-sm text-slate-700 dark:text-slate-200">
                  ¿Cómo cambio de plan?
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Contactanos por WhatsApp y te ayudamos con el proceso de upgrade o cambio de plan.
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="font-medium text-sm text-slate-700 dark:text-slate-200">
                  ¿Puedo cancelar cuando quiera?
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Sí, podés cancelar tu suscripción en cualquier momento sin penalidades.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => router.push('/preguntas-frecuentes')}
              >
                Ver todas las preguntas frecuentes
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('https://wa.me/3513479404?text=Hola%2C%20tengo%20una%20consulta%20sobre%20mi%20plan', '_blank')}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Contactar soporte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
