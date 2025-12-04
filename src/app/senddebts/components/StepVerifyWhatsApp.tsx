'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, Phone } from 'lucide-react'
import { useSendDebtsContext } from '@/app/providers/context/SendDebtsContext'
import { ProgressCard } from './ProgressCard'
import { Badge } from '@/components/ui/badge'
import { simpleWaBulkVerify, getPhonesByUFs } from '@/lib/api'
import { toast } from 'sonner'
import { logger } from '@/lib/logger';

interface VerificationResult {
  telefono: string
  nombre: string
  hasWhatsApp: boolean
  verified: boolean
}

export function StepVerifyWhatsApp() {
  const { rawData, setFilteredData, setActiveStep, progressStats, setProgressStats, setFileNameFiltered } = useSendDebtsContext()

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

  /**
   * Normalizar y formatear número de teléfono
   * Acepta: 3513479404, +543513479404, 543513479404
   * Retorna: +543513479404 (formato internacional Argentina)
   */
  const normalizePhone = (phone: string): string | null => {
    if (!phone) return null
    
    // Limpiar espacios, guiones, paréntesis
    const cleaned = phone.replace(/[\s\-()]/g, '')
    
    // Solo dígitos
    const digits = cleaned.replace(/\D/g, '')
    
    // Validar longitud (mínimo 8 dígitos)
    if (digits.length < 8) return null
    
    // Si ya tiene + al inicio, retornar
    if (cleaned.startsWith('+')) return cleaned
    
    // Si tiene 10 dígitos (ej: 3513479404), agregar código país Argentina
    if (digits.length === 10) {
      return `+54${digits}`
    }
    
    // Si tiene 12 dígitos y empieza con 54 (ej: 543513479404)
    if (digits.length === 12 && digits.startsWith('54')) {
      return `+${digits}`
    }
    
    // Si tiene 13 dígitos y empieza con 549 (formato móvil con 9)
    if (digits.length === 13 && digits.startsWith('549')) {
      return `+${digits}`
    }
    
    // Otros casos: retornar con + si tiene más de 10 dígitos
    if (digits.length > 10) {
      return `+${digits}`
    }
    
    return `+54${digits}`
  }

  const handleVerify = async () => {
    setVerifying(true)
    setProgress(0)
    setResults([])

    try {
      const startTime = Date.now()
      
      logger.log('📋 rawData completo:', rawData)
      
      // 0. Verificar que la sesión de WhatsApp esté lista
      toast.info('Verificando sesión de WhatsApp...')
      const { simpleWaState } = await import('@/lib/api')
      const sessionState = await simpleWaState()
      
      logger.log('📊 Estado de sesión:', sessionState)
      
      // El orquestador wrapea la respuesta en { worker, type, data }
      const session = sessionState.data || sessionState
      
      if (!session.authenticated || !session.ready) {
        toast.error('La sesión de WhatsApp no está lista. Por favor, inicia sesión primero.')
        setVerifying(false)
        return
      }
      
      toast.success('Sesión de WhatsApp lista ✅')
      
      // 1. Extraer UFs para buscar teléfonos actualizados en BD
      const ufs = rawData
        .map((record: any) => record.unidad)
        .filter((uf: any) => uf && !isNaN(uf))
      
      logger.log(`📞 Consultando BD para ${ufs.length} UFs...`)
      toast.info(`Consultando base de datos para ${ufs.length} clientes...`)
      
      // 2. Obtener teléfonos actualizados desde la base de datos
      const dbPhones = await getPhonesByUFs(ufs)
      logger.log(`📊 Teléfonos encontrados en BD:`, dbPhones)
      logger.log(`✅ ${Object.keys(dbPhones).length} teléfonos actualizados encontrados en BD`)
      
      // 3. Extraer y normalizar teléfonos del rawData (con prioridad de BD)
      const phonesData = rawData.map((record: any) => {
        const uf = record.unidad
        
        // Prioridad 1: Teléfono de BD (siempre más actualizado)
        let rawPhone = dbPhones[uf]
        let source = rawPhone ? 'database' : 'excel'
        
        // Prioridad 2: Teléfono del Excel
        if (!rawPhone) {
          rawPhone = record.tel_clien || record.tel_uni || record.telefono
        }
        
        logger.log(`Registro UF ${uf} (${record.Cliente_01}):`)
        logger.log(`  - BD: ${dbPhones[uf] || 'N/A'}`)
        logger.log(`  - Excel tel_clien: ${record.tel_clien}`)
        logger.log(`  - Excel tel_uni: ${record.tel_uni}`)
        logger.log(`  - Fuente elegida: ${source}`)
        
        const normalized = normalizePhone(rawPhone)
        logger.log(`  -> Normalizado: ${normalized}`)
        
        return {
          original: record,
          phone: normalized,
          nombre: record.Cliente_01 || record.nombre || 'Sin nombre',
          source, // Para tracking
        }
      })

      // 2. Filtrar solo los que tienen teléfono válido
      const validPhones = phonesData.filter(item => item.phone !== null)
      
      if (validPhones.length === 0) {
        toast.error('No se encontraron teléfonos válidos en el archivo')
        setVerifying(false)
        return
      }

      toast.info(`Verificando ${validPhones.length} números de WhatsApp...`)

      // 3. Llamar al API de verificación bulk
      const phoneNumbers = validPhones.map(item => item.phone!)
      logger.log('📞 Números a verificar:', phoneNumbers)
      
      const response = await simpleWaBulkVerify(phoneNumbers)
      logger.log('📡 Respuesta del API:', response)

      // 4. Mapear resultados
      const verificationResults: VerificationResult[] = validPhones.map((item, index) => {
        const apiResult = response.results.find((r: any) => r.phone === item.phone)
        logger.log(`Buscando ${item.phone} en resultados:`, apiResult)
        const hasWhatsApp = apiResult?.isWhatsApp || false

        return {
          telefono: item.phone!,
          nombre: item.nombre,
          hasWhatsApp,
          verified: true,
        }
      })

      setResults(verificationResults)
      setProgress(100)

      // 5. Filtrar datos originales solo con los que tienen WhatsApp
      const phoneToHasWhatsApp = new Map(
        verificationResults.map(r => [r.telefono, r.hasWhatsApp])
      )

      const filteredRecords = phonesData
        .filter(item => item.phone && phoneToHasWhatsApp.get(item.phone))
        .map(item => item.original)

      setFilteredData(filteredRecords)

      // ✅ El archivo filtrado ya fue generado por el backend en el paso anterior
      // No es necesario generarlo de nuevo aquí

      const elapsed = Date.now() - startTime
      const seconds = Math.floor(elapsed / 1000)
      
      const dbCount = phonesData.filter(p => p.source === 'database').length
      const excelCount = phonesData.filter(p => p.source === 'excel').length
      
      toast.success(
        `✅ Verificación completada en ${seconds}s. ${filteredRecords.length} números tienen WhatsApp (${dbCount} desde BD, ${excelCount} desde Excel)`
      )
    } catch (error: any) {
      console.error('Error en verificación:', error)
      toast.error('Error al verificar números de WhatsApp')
    } finally {
      setVerifying(false)
    }
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
