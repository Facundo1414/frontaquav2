'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, Phone } from 'lucide-react'
import { useSendDebtsContext } from '@/app/providers/context/SendDebtsContext'
import { ProgressCard } from './ProgressCard'
import { Badge } from '@/components/ui/badge'

interface VerificationResult {
  telefono: string
  nombre: string
  hasWhatsApp: boolean
  verified: boolean
}

export function StepVerifyWhatsApp() {
  const { rawData, setFilteredData, setActiveStep, progressStats, setProgressStats } = useSendDebtsContext()

  const [verifying, setVerifying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<VerificationResult[]>([])
  const [estimatedTime, setEstimatedTime] = useState<string>('')

  // 📊 Calcular estadísticas en tiempo real
  const totalRecords = rawData.length
  const verifiedCount = results.filter(r => r.verified).length
  const hasWhatsAppCount = results.filter(r => r.hasWhatsApp).length
  const noWhatsAppCount = results.filter(r => r.verified && !r.hasWhatsApp).length
  const pendingCount = totalRecords - verifiedCount

  useEffect(() => {
    // Actualizar stats en contexto
    setProgressStats({
      total: totalRecords,
      completed: hasWhatsAppCount,
      failed: noWhatsAppCount,
      pending: pendingCount,
    })
  }, [totalRecords, hasWhatsAppCount, noWhatsAppCount, pendingCount, setProgressStats])

  const handleVerify = async () => {
    setVerifying(true)
    setProgress(0)
    setResults([])

    // Simular verificación (en producción esto llamaría al backend)
    const startTime = Date.now()
    const totalTime = totalRecords * 100 // ~100ms por registro

    for (let i = 0; i < totalRecords; i++) {
      await new Promise(resolve => setTimeout(resolve, 100))

      const record = rawData[i]
      const hasWhatsApp = Math.random() > 0.3 // 70% tienen WhatsApp

      setResults(prev => [
        ...prev,
        {
          telefono: record.telefono || 'Sin teléfono',
          nombre: record.nombre || 'Sin nombre',
          hasWhatsApp,
          verified: true,
        },
      ])

      const currentProgress = ((i + 1) / totalRecords) * 100
      setProgress(currentProgress)

      // Calcular tiempo estimado restante
      const elapsed = Date.now() - startTime
      const avgTimePerRecord = elapsed / (i + 1)
      const remaining = (totalRecords - (i + 1)) * avgTimePerRecord
      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      setEstimatedTime(`${minutes}m ${seconds}s`)
    }

    // Filtrar solo los que tienen WhatsApp
    const withWhatsApp = rawData.filter((_, index) => results[index]?.hasWhatsApp)
    setFilteredData(withWhatsApp)
    setVerifying(false)
  }

  const handleSkip = () => {
    // Saltar verificación (usar todos los datos)
    setFilteredData(rawData)
    setActiveStep(2) // Ir a enviar
  }

  const handleNext = () => {
    setActiveStep(2) // Ir a enviar
  }

  const handleBack = () => {
    setActiveStep(0) // Volver a cargar archivo
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex flex-col space-y-6"
    >
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Phone className="w-5 h-5 text-blue-600" />
          Verificación de WhatsApp
        </h3>
        <p className="text-sm text-muted-foreground">
          Verifica qué números tienen WhatsApp activo antes de enviar. Esto mejora la tasa de entrega.
        </p>
      </div>

      {/* Progress Card */}
      {(verifying || results.length > 0) && (
        <ProgressCard
          title="Verificando números de WhatsApp"
          description={`Procesando ${totalRecords} registros`}
          progress={progress}
          stats={{
            total: totalRecords,
            completed: hasWhatsAppCount,
            failed: noWhatsAppCount,
            pending: pendingCount,
          }}
          status={verifying ? 'processing' : progress === 100 ? 'completed' : 'idle'}
          estimatedTime={verifying ? estimatedTime : undefined}
          lastProcessed={results.length > 0 ? results[results.length - 1]?.nombre : undefined}
          showDetails={true}
        />
      )}

      {/* Resumen de resultados */}
      {results.length > 0 && !verifying && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700">Con WhatsApp</span>
            </div>
            <p className="text-3xl font-bold text-green-700">{hasWhatsAppCount}</p>
            <p className="text-xs text-green-600 mt-1">
              {totalRecords > 0 ? Math.round((hasWhatsAppCount / totalRecords) * 100) : 0}% del total
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-700">Sin WhatsApp</span>
            </div>
            <p className="text-3xl font-bold text-red-700">{noWhatsAppCount}</p>
            <p className="text-xs text-red-600 mt-1">
              {totalRecords > 0 ? Math.round((noWhatsAppCount / totalRecords) * 100) : 0}% del total
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-700">Total Registros</span>
            </div>
            <p className="text-3xl font-bold text-blue-700">{totalRecords}</p>
            <p className="text-xs text-blue-600 mt-1">Verificados: {verifiedCount}</p>
          </div>
        </div>
      )}

      {/* Lista de últimos verificados (scroll) */}
      {results.length > 0 && (
        <div className="flex-1 bg-white border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h4 className="font-semibold text-sm">Últimos verificados</h4>
          </div>
          <div className="overflow-y-auto max-h-[300px]">
            <div className="divide-y">
              {results.slice(-20).reverse().map((result, index) => (
                <div key={index} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{result.nombre}</p>
                      <p className="text-xs text-gray-500">{result.telefono}</p>
                    </div>
                    <Badge
                      variant={result.hasWhatsApp ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {result.hasWhatsApp ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Con WhatsApp
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Sin WhatsApp
                        </span>
                      )}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBack} disabled={verifying}>
            ← Volver
          </Button>
        </div>

        <div className="flex gap-2">
          {!verifying && results.length === 0 && (
            <>
              <Button variant="secondary" onClick={handleSkip}>
                Omitir verificación
              </Button>
              <Button onClick={handleVerify} disabled={totalRecords === 0}>
                Iniciar verificación
              </Button>
            </>
          )}

          {!verifying && results.length > 0 && (
            <Button onClick={handleNext} disabled={hasWhatsAppCount === 0}>
              Continuar con {hasWhatsAppCount} números →
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
