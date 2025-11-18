'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import api from '@/lib/api/axiosInstance'

interface PyseQuotaStatus {
    used_today: number
    remaining_today: number
    limit_daily: number
    percentage_used: number
    can_query: boolean
    limit_hourly: number
    limit_per_minute: number
}

export function PyseUsageWidget({ refreshTrigger }: { refreshTrigger?: number }) {
    const [status, setStatus] = useState<PyseQuotaStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchQuotaStatus()
    }, [refreshTrigger]) // Solo actualiza cuando refreshTrigger cambia o al montar

    const fetchQuotaStatus = async () => {
        try {
            const response = await api.get<PyseQuotaStatus>('/pyse/usage/status')
            setStatus(response.data)
            setError(null)
        } catch (err: any) {
            console.error('Error fetching PYSE quota:', err)
            setError(err.response?.data?.message || 'Error al obtener cuota')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        Cuota PYSE - Cargando...
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </CardContent>
            </Card>
        )
    }

    if (error || !status) {
        return (
            <Alert className="mb-6 border-yellow-300 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                    No se pudo cargar la cuota PYSE. Intente nuevamente más tarde.
                </AlertDescription>
            </Alert>
        )
    }

    const getColorByUsage = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500'
        if (percentage >= 70) return 'bg-orange-500'
        if (percentage >= 50) return 'bg-yellow-500'
        return 'bg-green-500'
    }

    const getAlertVariant = (percentage: number) => {
        if (percentage >= 90) return 'destructive'
        if (percentage >= 70) return 'warning'
        return 'default'
    }

    return (
        <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        Cuota PYSE Diaria
                    </CardTitle>
                    {status.can_query ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            Disponible
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                            <AlertCircle className="w-4 h-4" />
                            Límite alcanzado
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Barra de progreso */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-purple-700">Consultas realizadas hoy</span>
                        <span className={`${status.percentage_used >= 90 ? 'text-red-600' : 'text-purple-900'} font-bold`}>
                            {status.used_today} / {status.limit_daily}
                        </span>
                    </div>
                    <div className="relative">
                        <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${getColorByUsage(status.percentage_used)}`}
                                style={{ width: `${Math.min(status.percentage_used, 100)}%` }}
                            />
                        </div>
                        <span className="absolute right-2 top-0 text-xs font-bold text-white drop-shadow-md">
                            {status.percentage_used.toFixed(1)}%
                        </span>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                        <div className="text-3xl font-bold text-purple-600">{status.remaining_today}</div>
                        <div className="text-xs text-gray-600">Consultas Restantes</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                        <div className="text-3xl font-bold text-purple-600">{status.limit_hourly || 600}</div>
                        <div className="text-xs text-gray-600">Límite por Hora</div>
                    </div>
                </div>

                {/* Alert si se está acercando al límite */}
                {status.percentage_used >= 70 && status.can_query && (
                    <Alert className="border-orange-300 bg-orange-50">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-sm text-orange-800">
                            {status.percentage_used >= 90 ? (
                                <>
                                    <strong>¡Atención!</strong> Has usado el {status.percentage_used.toFixed(0)}% de tu cuota diaria.
                                    Quedan solo {status.remaining_today} consultas.
                                </>
                            ) : (
                                <>
                                    Has usado el {status.percentage_used.toFixed(0)}% de tu cuota diaria.
                                    Planifica tus consultas para no quedarte sin cuota.
                                </>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Alert si alcanzó el límite */}
                {!status.can_query && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            <strong>Cuota diaria agotada.</strong> Se restablecerá mañana a las 00:00 hs.
                            Límite: {status.limit_daily} consultas/día.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Info sobre límites */}
                <div className="text-xs text-gray-600 space-y-1 border-t border-purple-200 pt-3">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Los límites evitan saturar el sistema de Aguas Cordobesas</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span>Límite diario: 1000 consultas | Límite horario: 600 consultas/hora</span>
                    </div>
                    <div className="text-xs text-purple-700 italic mt-2">
                        💡 Este widget se actualiza al entrar a la página y después de procesar clientes
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
