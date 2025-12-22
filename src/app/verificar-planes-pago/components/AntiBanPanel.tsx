'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  TrendingUp
} from "lucide-react"
import {
  getRecommendedDelay,
  getCurrentTimeSlot,
  isWithinRecommendedHours,
  getTimeWarning,
  formatTimeRemaining
} from '@/lib/whatsapp-anti-ban'

interface AntiBanPanelProps {
  sentCount: number
  totalClients: number
  currentVariantId?: number | null
  onTimerComplete?: () => void
}

export function AntiBanPanel({ sentCount, totalClients, currentVariantId, onTimerComplete }: AntiBanPanelProps) {
  const [recommendedDelay, setRecommendedDelay] = useState<number>(0)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isWaiting, setIsWaiting] = useState(false)

  const timeSlot = getCurrentTimeSlot()
  const isGoodTime = isWithinRecommendedHours()
  const timeWarning = getTimeWarning()

  useEffect(() => {
    // Generar nuevo delay cuando se envía un mensaje (se reinicia en cada envío)
    if (sentCount > 0) {
      const delay = getRecommendedDelay()
      setRecommendedDelay(delay)
      setTimeRemaining(delay)
      setIsWaiting(true)
    }
  }, [sentCount])

  useEffect(() => {
    if (timeRemaining <= 0 && isWaiting) {
      setIsWaiting(false)
      onTimerComplete?.()
      return
    }

    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [timeRemaining, isWaiting, onTimerComplete])

  const progress = recommendedDelay > 0 
    ? ((recommendedDelay - timeRemaining) / recommendedDelay) * 100 
    : 0

  return (
    <>
      {/* Panel principal (no sticky) */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Protección Anti-Ban WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        {/* Advertencia de horario */}
        {timeWarning && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{timeWarning}</AlertDescription>
          </Alert>
        )}

        {/* Estado actual */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Enviados</div>
            <div className="text-2xl font-bold text-blue-600">{sentCount}</div>
          </div>
          
          <div className={`p-3 rounded-lg ${isGoodTime ? 'bg-green-50 dark:bg-green-950/30' : 'bg-orange-50 dark:bg-orange-950/30'}`}>
            <div className="text-xs text-muted-foreground mb-1">Horario</div>
            <div className={`text-xs font-semibold ${isGoodTime ? 'text-green-600' : 'text-orange-600'}`}>
              {timeSlot}
            </div>
          </div>
        </div>

        {/* Temporizador de espera */}
        {isWaiting && timeRemaining > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                Espera antes del próximo envío
              </span>
              <span className="font-mono font-bold text-blue-600">
                {formatTimeRemaining(timeRemaining)}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Delay humano recomendado: {recommendedDelay}s
            </p>
          </div>
        )}

        {!isWaiting && sentCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 p-2 rounded">
            <CheckCircle2 className="w-4 h-4" />
            <span>Listo para el próximo envío</span>
          </div>
        )}

        {/* Instrucciones */}
        <div className="space-y-2 pt-3 border-t">
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            📋 REGLAS DE PROTECCIÓN ACTIVAS:
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Mensajes varían cada 4-5 clientes</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Delay aleatorio 15-45s entre envíos</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Máximo 1 mensaje por cliente</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Horario recomendado: 8am - 9pm</span>
            </div>
          </div>
        </div>

        {/* Consejo importante */}
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <TrendingUp className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>IMPORTANTE:</strong> Espera el delay completo antes de hacer clic en el próximo envío. 
            Esto ayuda a que WhatsApp interprete los mensajes como naturales.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>

    {/* Badge flotante compacto - Solo visible si hay enviados */}
    {sentCount > 0 && (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="border-blue-500 dark:border-blue-600 shadow-2xl bg-white dark:bg-gray-900">
          <CardContent className="p-4 space-y-3">
            {/* Temporizador destacado si está activo */}
            {isWaiting && timeRemaining > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                  <div>
                    <div className="text-xs text-muted-foreground">Próximo envío recomendado:</div>
                    <div className="text-3xl font-bold text-blue-600 font-mono">
                      {formatTimeRemaining(timeRemaining)}
                    </div>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/30 p-2 rounded">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-semibold">Listo para enviar</span>
              </div>
            )}

            {/* Stats compactos */}
            <div className="flex gap-3 pt-2 border-t">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Enviados</div>
                <div className="text-xl font-bold text-blue-600">{sentCount}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Pendientes</div>
                <div className="text-xl font-bold text-orange-600">{totalClients - sentCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )}
    </>
  )
}
