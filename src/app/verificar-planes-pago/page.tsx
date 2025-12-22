'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Download, CheckCircle2, Loader2, FileSpreadsheet, AlertCircle, Copy, MessageSquare, Phone, CheckCheck, RefreshCw, Trash2, Edit3 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import * as XLSX from 'xlsx'
import { useGlobalContext } from '@/app/providers/context/GlobalContext'
import { toast } from 'sonner'
import { getPhonesByUFs } from '@/lib/api'
import { MessageVariantSelector } from '@/lib/whatsapp-anti-ban'
import { AntiBanPanel } from './components/AntiBanPanel'

interface PaymentPlanResult {
  uf: number
  hasPaymentPlan: boolean
  paymentPlanStatus?: string
  details?: string
  error?: string
  // Nuevos campos
  nombre?: string
  telefono?: string
  telefonoExcel?: string
  deuda?: string
  mensaje?: string
  waLink?: string
  linkComprobante?: string
  enviado?: boolean
  estadoSimple?: string
  puedeGenerarComprobante?: boolean
  variantId?: number // 🛡️ ID de variante de mensaje usada
}

export default function VerificarPlanesPagoPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  
  // 🔄 Cargar results desde localStorage al inicializar
  const [results, setResults] = useState<PaymentPlanResult[] | null>(() => {
    const saved = localStorage.getItem('verificar-planes-results')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return null
      }
    }
    return null
  })
  
  // 🔄 Cargar stats desde localStorage al inicializar
  const [stats, setStats] = useState<{
    total: number
    withPlan: number
    withoutPlan: number
    errors: number
    conTelefono?: number
    enviados?: number
  } | null>(() => {
    const saved = localStorage.getItem('verificar-planes-stats')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return null
      }
    }
    return null
  })
  
  // 🔄 Cargar enviados desde localStorage al inicializar (lazy initialization)
  const [enviados, setEnviados] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('verificar-planes-enviados')
    if (saved) {
      try {
        const arr = JSON.parse(saved)
        return new Set(arr)
      } catch (e) {
        console.error('Error cargando enviados:', e)
        return new Set()
      }
    }
    return new Set()
  })
  
  const [editingPhone, setEditingPhone] = useState<Record<number, string>>({})
  
  // 🛡️ Estado para el sistema anti-ban
  // ⚠️ NO inicializar sentCount con datos guardados - solo cuenta envíos nuevos en esta sesión
  const [sentCount, setSentCount] = useState(0)
  const [currentVariantId, setCurrentVariantId] = useState<number | null>(null)

  const { userId } = useGlobalContext()

  // Mostrar notificación si hay datos previos cargados
  useEffect(() => {
    if (results && results.length > 0) {
      toast.info('Datos anteriores cargados', { duration: 3000 })
    }
  }, []) // Solo al montar

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    if (results) {
      localStorage.setItem('verificar-planes-results', JSON.stringify(results))
    }
  }, [results])

  useEffect(() => {
    if (stats) {
      localStorage.setItem('verificar-planes-stats', JSON.stringify(stats))
    }
  }, [stats])

  useEffect(() => {
    const enviadosArray = Array.from(enviados)
    localStorage.setItem('verificar-planes-enviados', JSON.stringify(enviadosArray))
  }, [enviados])

  // Función para normalizar teléfonos (formato WhatsApp: +549...)
  const normalizePhone = (phone: any): string | null => {
    if (!phone) return null
    
    // Convertir a string por si viene como número del Excel
    const phoneStr = String(phone).trim()
    
    // Casos especiales: placeholders comunes
    if (phoneStr.match(/^(s\/t|sin|n\/a|400000)$/i)) {
      return null
    }
    
    // Si tiene múltiples números separados, tomar el primero
    if (phoneStr.includes('/')) {
      const firstNumber = phoneStr.split('/')[0].trim()
      return normalizePhone(firstNumber) // Recursivo con el primero
    }
    
    // Extraer solo dígitos
    let digits = phoneStr.replace(/[^0-9]/g, '')
    
    // Remover leading 00 (prefijo internacional usado a veces)
    if (digits.startsWith('00')) {
      digits = digits.substring(2)
    }
    
    // 🆕 NORMALIZACIÓN INTELIGENTE: Números cortos (6-7 dígitos)
    // Asumir que son teléfonos fijos de Córdoba sin código de área
    if (digits.length >= 6 && digits.length <= 7) {
      console.log(`📞 Número corto detectado: ${phoneStr} → Agregando código 351`)
      digits = '351' + digits
    }
    
    // Validar longitud (8-15 dígitos según estándar internacional)
    if (digits.length < 8 || digits.length > 15) {
      console.warn(`⚠️ Teléfono inválido (longitud ${digits.length}):`, phoneStr)
      return null
    }
    
    // Si ya tiene código de país (54), remover
    const withoutCountryCode = digits.startsWith('54')
      ? digits.substring(2)
      : digits
    
    // Agregar 9 si no lo tiene (celulares argentinos)
    const withNine = withoutCountryCode.startsWith('9')
      ? withoutCountryCode
      : `9${withoutCountryCode}`
    
    // Formato final: +549XXXXXXXXXX (sin espacios para WhatsApp)
    return `+54${withNine}`
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile)
        setResults(null)
        setStats(null)
        toast.success('Archivo cargado correctamente')
      } else {
        toast.error('Por favor selecciona un archivo Excel (.xlsx o .xls)')
      }
    }
  }

  const limpiarCache = () => {
    localStorage.removeItem('verificar-planes-results')
    localStorage.removeItem('verificar-planes-stats')
    localStorage.removeItem('verificar-planes-enviados')
    setResults(null)
    setStats(null)
    setEnviados(new Set())
    setFile(null)
    toast.success('Datos limpiados correctamente')
  }

  const processFile = async () => {
    if (!file || !userId) return

    setProcessing(true)
    
    // 🔄 PRESERVAR datos anteriores antes de limpiar
    const previousResults = results || []
    const previousEnviados = new Set(enviados)
    
    // Crear un mapa de modificaciones previas del usuario
    const userModifications = new Map<number, {
      telefono?: string | null,
      enviado?: boolean
    }>()
    
    previousResults.forEach((r: PaymentPlanResult) => {
      userModifications.set(r.uf, {
        telefono: r.telefono,
        enviado: previousEnviados.has(r.uf)
      })
    })
    
    setResults(null)
    setStats(null)

    try {
      // Leer el Excel
      const fileBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const data: any[] = XLSX.utils.sheet_to_json(firstSheet)

      // Extraer UFs (buscar columna que contenga "uf", "cuenta", o similar)
      const ufs: number[] = []
      data.forEach((row) => {
        const uf = row['unidad'] || row['Unidad'] || row['UNIDAD'] ||
                   row['uf'] || row['UF'] || row['Uf'] || 
                   row['cuenta'] || row['CUENTA'] || row['Cuenta'] ||
                   row['Cuenta_Nro'] || row['cuenta_nro'] || row['CUENTA_NRO'] ||
                   row['CuentaNro'] || row['cuentanro'] || row['CUENTANRO'] ||
                   row['Account'] || row['account']
        if (uf && !isNaN(Number(uf))) {
          ufs.push(Number(uf))
        }
      })

      if (ufs.length === 0) {
        toast.error('No se encontraron UFs válidas en el archivo. Asegúrate de que tenga una columna llamada "unidad", "Cuenta_Nro", "UF" o "Cuenta".')
        setProcessing(false)
        return
      }

      toast.info(`Verificando ${ufs.length} cuentas...`)

      // 1. Llamar al backend para verificar planes de pago
      const token = localStorage.getItem('accessToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const response = await fetch(`${apiUrl}/api/process/verify-payment-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ufs }),
      })

      if (!response.ok) {
        throw new Error('Error al verificar planes de pago')
      }

      const data_response = await response.json()
      
      // 2. Enriquecer con datos del Excel (nombre y teléfono)
      const enrichedResults = data_response.results.map((r: PaymentPlanResult) => {
        const excelRow = data.find((row: any) => {
          const excelUf = row['unidad'] || row['Unidad'] || row['UNIDAD'] ||
                         row['uf'] || row['UF'] || row['Uf'] || 
                         row['cuenta'] || row['CUENTA'] || row['Cuenta'] ||
                         row['Cuenta_Nro'] || row['cuenta_nro'] || row['CUENTA_NRO'] ||
                         row['CuentaNro'] || row['cuentanro'] || row['CUENTANRO'] ||
                         row['Account'] || row['account']
          return Number(excelUf) === Number(r.uf)
        })
        
        const nombre = excelRow?.['titular'] || excelRow?.['Titular'] || excelRow?.['TITULAR'] || 
                      excelRow?.['nombre'] || excelRow?.['Nombre'] || excelRow?.['NOMBRE'] || 
                      excelRow?.['cliente'] || excelRow?.['Cliente'] || excelRow?.['CLIENTE'] ||
                      excelRow?.['Cliente_01'] || // Formato senddebts
                      'Cliente'
        
        // Intentar obtener teléfono del Excel (columnas senddebts)
        // ⚠️ IMPORTANTE: tel_uni es MÁS CONFIABLE que tel_clien
        // tel_clien a veces contiene datos basura como "1 2 3" o "4 ultima"
        const candidatos = [
          excelRow?.['tel_uni'],   // Primera prioridad - MÁS CONFIABLE
          excelRow?.['telefono'],
          excelRow?.['Telefono'], 
          excelRow?.['TELEFONO'],
          excelRow?.['phone'],
          excelRow?.['Phone'],
          excelRow?.['tel_clien'], // Última prioridad - puede tener basura
        ]
        
        // Buscar el primer candidato que sea un teléfono válido
        let telefonoExcel = null
        for (const candidato of candidatos) {
          if (!candidato) continue
          const str = String(candidato).trim()
          // Ignorar valores inválidos:
          // - Muy cortos (menos de 5 caracteres)
          // - Marcadores como "S/T", "sin", "n/a"
          // - Patrones con espacios entre dígitos como "3 4 5 6" (NO son teléfonos)
          // - Placeholders comunes como "400000"
          // - Números con menos de 6 dígitos (reducido de 7 para permitir fijos sin código)
          if (str.length < 5 || 
              str.match(/^(s\/t|sin|n\/a|na)$/i) || 
              str.match(/^\d\s+\d/) || // "4 5 6" o "3 4" - estos NO son teléfonos
              str === '400000' ||      // Placeholder común
              str.replace(/\D/g, '').length < 6) { // Menos de 6 dígitos
            continue
          }
          telefonoExcel = candidato
          break
        }
        
        return {
          ...r,
          nombre,
          telefonoExcel, // Guardar para usarlo después
        }
      })

      // 3. Obtener teléfonos de la BD
      toast.info('Consultando teléfonos en base de datos...')
      const dbPhones = await getPhonesByUFs(ufs)
      console.log('📞 Teléfonos de BD obtenidos:', Object.keys(dbPhones).length)
      
      // 4. Mapear todo y generar mensajes/links (priorizar modificaciones del usuario > BD > Excel)
      const finalResults = enrichedResults.map((r: PaymentPlanResult) => {
        const userMod = userModifications.get(r.uf)
        
        // 🔄 Prioridad: Modificación del usuario > BD > Excel
        const telefonoBD = dbPhones[r.uf] || null
        const telefonoExcel = r.telefonoExcel || null
        const telefonoOriginal = userMod?.telefono !== undefined 
          ? userMod.telefono 
          : (telefonoBD || telefonoExcel)
        const telefonoNormalizado = telefonoOriginal ? normalizePhone(telefonoOriginal) : null
        
        // Logging detallado para debugging
        if (!telefonoNormalizado && (telefonoBD || telefonoExcel)) {
          console.warn(`⚠️ UF ${r.uf}: Teléfono original presente pero normalización falló`)
          console.warn(`   - BD: ${telefonoBD}`)
          console.warn(`   - Excel: ${telefonoExcel}`)
          console.warn(`   - Original seleccionado: ${telefonoOriginal}`)
        } else if (telefonoBD && telefonoExcel && telefonoBD !== telefonoExcel) {
          console.log(`✅ UF ${r.uf}: Usando BD (${telefonoBD}) en lugar de Excel (${telefonoExcel})`)
        } else if (!telefonoBD && !telefonoExcel) {
          console.log(`ℹ️ UF ${r.uf}: Sin teléfono en BD ni Excel`)
        }
        
        // Determinar estado simple
        let estadoSimple = 'Sin plan'
        let puedeGenerarComprobante = false
        
        if (r.paymentPlanStatus?.includes('IMPAGAS')) {
          estadoSimple = 'Tiene deuda'
          puedeGenerarComprobante = true
        } else if (r.paymentPlanStatus?.includes('activo')) {
          estadoSimple = 'Al día'
          puedeGenerarComprobante = true
        }
        
        // Link de Espacio Cliente SIEMPRE (tenga deuda o no)
        const linkComprobante = `https://www.aguascordobesas.com.ar/espacioClientes/seccion/gestionDeuda/consulta/${r.uf}`
        
        // 🛡️ Generar mensaje VARIABLE usando el sistema anti-ban
        const { text: mensaje, variantId } = MessageVariantSelector.getNextVariant(r.nombre || 'Cliente')
        
        // Generar link de WhatsApp SIEMPRE que haya teléfono
        const waLink = telefonoNormalizado 
          ? `https://wa.me/${telefonoNormalizado.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}` 
          : null
        
        return {
          ...r,
          telefono: telefonoNormalizado || null, // ✅ Guardar teléfono normalizado con formato +54...
          mensaje,
          waLink,
          linkComprobante,
          estadoSimple,
          puedeGenerarComprobante,
          enviado: false,
          variantId, // 🛡️ Guardar ID de variante usada
        }
      })
      
      // 🔄 RESTAURAR checkboxes de enviados
      const newEnviadosSet = new Set<number>()
      finalResults.forEach((r: PaymentPlanResult) => {
        const userMod = userModifications.get(r.uf)
        if (userMod?.enviado) {
          newEnviadosSet.add(r.uf)
        }
      })
      
      setEnviados(newEnviadosSet)
      // ⚠️ NO actualizar sentCount aquí - solo cuenta envíos nuevos en esta sesión
      
      setResults(finalResults)

      // Calcular estadísticas
      const withPlan = finalResults.filter((r: PaymentPlanResult) => r.hasPaymentPlan).length
      const withoutPlan = finalResults.filter((r: PaymentPlanResult) => !r.hasPaymentPlan && !r.error).length
      const errors = finalResults.filter((r: PaymentPlanResult) => r.error).length
      const conTelefono = finalResults.filter((r: PaymentPlanResult) => r.telefono).length
      const sinTelefono = finalResults.filter((r: PaymentPlanResult) => !r.telefono && !r.error).length

      setStats({
        total: finalResults.length,
        withPlan,
        withoutPlan,
        errors,
        conTelefono,
        enviados: newEnviadosSet.size, // 🔄 Usar el conteo correcto de enviados restaurados
      })

      // 🆕 Mostrar advertencia si hay registros sin teléfono
      if (sinTelefono > 0) {
        toast.warning(`⚠️ ${sinTelefono} cliente(s) sin teléfono válido. Puedes corregirlos manualmente en la base de datos.`, {
          duration: 8000
        })
      }

      // 🔄 Mostrar mensaje si se restauraron modificaciones previas
      if (newEnviadosSet.size > 0 || userModifications.size > 0) {
        const modificacionesRestauradas = []
        if (newEnviadosSet.size > 0) {
          modificacionesRestauradas.push(`${newEnviadosSet.size} enviado(s)`)
        }
        const telefonosEditados = Array.from(userModifications.values()).filter(m => m.telefono !== undefined).length
        if (telefonosEditados > 0) {
          modificacionesRestauradas.push(`${telefonosEditados} teléfono(s) editado(s)`)
        }
        if (modificacionesRestauradas.length > 0) {
          toast.info(`✅ Restauradas tus modificaciones: ${modificacionesRestauradas.join(', ')}`, {
            duration: 5000
          })
        }
      }

      toast.success('Verificación completada')
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al procesar el archivo')
    } finally {
      setProcessing(false)
    }
  }

  const downloadResults = () => {
    if (!results) return

    // Excel SIMPLIFICADO con solo datos útiles
    const dataToExport = results.map((r: any) => ({
      'UF': r.uf,
      'Nombre': r.nombre || '',
      'Teléfono': r.telefono || '⚠️ SIN TELÉFONO - CORREGIR',
      'Estado': r.estadoSimple || 'Sin plan',
      'Puede generar comprobante': r.puedeGenerarComprobante ? 'SÍ' : 'NO',
      'Link Espacio Cliente': r.linkComprobante || '',
      'Enviado': enviados.has(r.uf) ? 'SÍ' : 'NO',
      'Link WhatsApp': r.waLink || '⚠️ Sin teléfono',
      'Mensaje pre-armado': r.mensaje || '',
      'OBSERVACIONES': '', // Columna para notas del usuario
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    
    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 10 },  // UF
      { wch: 25 },  // Nombre
      { wch: 25 },  // Teléfono (más ancho para advertencia)
      { wch: 15 },  // Estado
      { wch: 22 },  // Puede generar comprobante
      { wch: 60 },  // Link Espacio Cliente
      { wch: 10 },  // Enviado
      { wch: 40 },  // Link WhatsApp
      { wch: 60 },  // Mensaje
      { wch: 50 },  // OBSERVACIONES
    ]
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados')

    // Descargar
    const fileName = `planes_pago_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    const sinTelefono = results.filter((r: any) => !r.telefono).length
    if (sinTelefono > 0) {
      toast.success(`Excel descargado. ⚠️ ${sinTelefono} cliente(s) marcados como "SIN TELÉFONO" requieren corrección manual.`, {
        duration: 8000
      })
    } else {
      toast.success('Excel descargado con links de WhatsApp y mensajes listos para usar')
    }
  }

  const copiarMensaje = (mensaje: string, nombre: string) => {
    navigator.clipboard.writeText(mensaje)
    toast.success(`Mensaje de ${nombre} copiado al portapapeles`)
  }

  const descargarPDF = async (uf: number) => {
    try {
      toast.info('Generando PDF...')
      
      const token = localStorage.getItem('accessToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const comprobanteUrl = process.env.NEXT_PUBLIC_COMPROBANTE_WORKER_URL || 'http://localhost:3002'
      
      const response = await fetch(`${comprobanteUrl}/comprobante/test/generar-pdf?uf=${uf}&userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al generar PDF')
      }

      // Descargar el PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `comprobante_${uf}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('PDF descargado correctamente')
    } catch (error: any) {
      console.error('Error descargando PDF:', error)
      toast.error(error.message || 'Error al descargar el PDF')
    }
  }

  const toggleEnviado = (uf: number) => {
    // 🛡️ Actualizar contador de envíos y variante actual
    const result = results?.find(r => r.uf === uf)
    
    setEnviados(prev => {
      const newSet = new Set(prev)
      const wasChecked = newSet.has(uf)
      
      if (wasChecked) {
        newSet.delete(uf)
        // Si se desmarca, decrementar contador
        setSentCount(c => Math.max(0, c - 1))
      } else {
        newSet.add(uf)
        // Si se marca como enviado, incrementar contador y actualizar variante
        setSentCount(c => c + 1)
        if (result?.variantId) {
          setCurrentVariantId(result.variantId)
        }
      }
      
      // Actualizar stats
      if (stats) {
        setStats({
          ...stats,
          enviados: newSet.size
        })
      }
      
      return newSet
    })
  }

  const updatePhoneForClient = (uf: number, newPhone: string) => {
    // Actualizar el teléfono en los resultados
    if (!results) return
    
    const normalized = normalizePhone(newPhone)
    if (!normalized) {
      toast.error('Teléfono inválido. Formato: 351XXXXXXX o 3513XXXXXX')
      return
    }
    
    const updatedResults = results.map(r => {
      if (r.uf === uf) {
        // Generar mensaje usando la info existente (mantener el formato original)
        const mensaje = r.mensaje || `Hola ${r.nombre}, te envio tu comprobante actualizado de la CUOTA PLAN DE PAGOS.
Por favor, realiza el pago antes del vencimiento.
Se puede pagar por Mercado Pago, Rapipago y Pago facil

🌐 Cclip 🔹 Al servicio de Aguas Cordobesas.`
        
        // Generar link de WhatsApp con el formato correcto (sin el +, solo dígitos)
        const waLink = `https://wa.me/${normalized.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`
        
        // ✅ MANTENER TODAS las propiedades originales
        return {
          ...r,
          telefono: normalized,
          waLink,
          mensaje,
          // Estas propiedades ya están en ...r pero las mencionamos explícitamente para claridad
          // estadoSimple, puedeGenerarComprobante, linkComprobante, etc. se mantienen
        }
      }
      return r
    })
    
    setResults(updatedResults)
    
    // Actualizar stats
    if (stats) {
      const withPhone = updatedResults.filter(r => r.telefono).length
      setStats({
        ...stats,
        conTelefono: withPhone
      })
    }
    
    // Limpiar el estado de edición
    setEditingPhone(prev => {
      const newState = { ...prev }
      delete newState[uf]
      return newState
    })
    
    toast.success('Teléfono actualizado correctamente')
  }

  const deletePhoneForClient = (uf: number) => {
    if (!results) return
    
    const updatedResults = results.map(r => {
      if (r.uf === uf) {
        return {
          ...r,
          telefono: undefined,
          waLink: undefined,
        }
      }
      return r
    })
    
    setResults(updatedResults)
    
    // Actualizar stats
    if (stats) {
      const withPhone = updatedResults.filter(r => r.telefono).length
      setStats({
        ...stats,
        conTelefono: withPhone
      })
    }
    
    toast.success('Teléfono eliminado correctamente')
  }

  const generarMensaje = (nombre: string, deuda: string) => {
    return `Hola ${nombre}, te envío tu comprobante actualizado de la CUOTA PLAN DE PAGOS.\nPor favor, realiza el pago antes del vencimiento.\nSe puede pagar por Mercado Pago, Rapipago y Pago facil\n\n🌐 Cclip  •  Al servicio de Aguas Cordobesas.`
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-blue-500" />
              Verificar Planes de Pago
            </h1>
            <p className="text-muted-foreground">
              Carga un archivo Excel con UFs y verifica automáticamente qué cuentas tienen planes de pago vigentes
            </p>
          </div>
          {(results || stats) && (
            <Button
              variant="outline"
              size="sm"
              onClick={limpiarCache}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpiar y Empezar de Nuevo
            </Button>
          )}
        </div>
      </div>

      {/* Instrucciones */}
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Formato del Excel:</strong> Tu archivo debe tener una columna con el nombre 
          "unidad", "Cuenta_Nro", "UF", o similar. El sistema detectará automáticamente las cuentas.
        </AlertDescription>
      </Alert>

      {/* Card principal */}
      <Card>
        <CardHeader>
          <CardTitle>1. Cargar Archivo Excel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild disabled={processing}>
                <span className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Seleccionar Archivo
                </span>
              </Button>
            </label>
            {file && (
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {file.name}
              </span>
            )}
          </div>

          {file && !processing && !results && (
            <Button onClick={processFile} className="w-full" size="lg">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Verificar Planes de Pago
            </Button>
          )}

          {(processing) && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Consultando planes de pago y teléfonos...
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {stats && results && (
        <>
          {/* Panel Anti-Ban */}
          <div className="mt-6">
            <AntiBanPanel 
              sentCount={sentCount}
              totalClients={results.filter(r => r.telefono).length}
              currentVariantId={currentVariantId}
              onTimerComplete={() => {
                toast.info('✅ Listo para el próximo envío', { duration: 3000 })
              }}
            />
          </div>

          {/* Estadísticas */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>2. Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.withPlan}</div>
                  <div className="text-sm text-muted-foreground">Con Plan</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.conTelefono || 0}</div>
                  <div className="text-sm text-muted-foreground">Con Teléfono</div>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-950 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-600">{stats.enviados || 0}</div>
                  <div className="text-sm text-muted-foreground">Enviados</div>
                </div>
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                  <div className="text-sm text-muted-foreground">Errores</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descargar */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>3. Descargar Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadResults} size="lg" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Descargar Excel con Resultados
              </Button>
            </CardContent>
          </Card>

          {/* Vista Optimizada para Envío Rápido */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Vista de Envío Rápido
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Haz clic en el botón de WhatsApp para abrir el chat con el mensaje pre-cargado, o copia el mensaje manualmente.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Filtros rápidos */}
              <div className="flex gap-2 flex-wrap mb-4">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  <Phone className="w-3 h-3 mr-1" />
                  Con Teléfono: {results!.filter(r => r.telefono).length}
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Con deuda: {results!.filter(r => r.estadoSimple === 'Tiene deuda').length}
                </Badge>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  Pendientes: {results!.filter(r => !enviados.has(r.uf)).length}
                </Badge>
              </div>

              {/* Cards de clientes */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {results!
                  .sort((a, b) => {
                    // Priorizar: con teléfono y deuda primero
                    if (a.telefono && !b.telefono) return -1
                    if (!a.telefono && b.telefono) return 1
                    if (a.estadoSimple === 'Tiene deuda' && b.estadoSimple !== 'Tiene deuda') return -1
                    if (a.estadoSimple !== 'Tiene deuda' && b.estadoSimple === 'Tiene deuda') return 1
                    return 0
                  })
                  .map((r, i) => (
                  <Card key={i} className={`${enviados.has(r.uf) ? 'opacity-50 bg-green-50 dark:bg-green-950/20' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Checkbox de enviado */}
                        <div className="pt-1">
                          <Checkbox
                            checked={enviados.has(r.uf)}
                            onCheckedChange={() => toggleEnviado(r.uf)}
                            className="h-5 w-5"
                          />
                        </div>

                        {/* Info del cliente */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{r.nombre}</h3>
                              <p className="text-sm text-muted-foreground">
                                UF: {r.uf} 
                                {r.variantId && (
                                  <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">
                                    • Variante #{r.variantId}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {r.telefono && (
                                <Badge variant="default" className="bg-green-600">
                                  <Phone className="w-3 h-3 mr-1" />
                                  Teléfono
                                </Badge>
                              )}
                              {r.estadoSimple === 'Tiene deuda' && (
                                <Badge variant="destructive">
                                  Tiene deuda
                                </Badge>
                              )}
                              {r.estadoSimple === 'Al día' && (
                                <Badge variant="default" className="bg-blue-600">
                                  Al día
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Teléfono - Editable si no existe */}
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4" />
                            {r.telefono && !editingPhone[r.uf] ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{r.telefono}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => setEditingPhone(prev => ({ ...prev, [r.uf]: r.telefono!.replace('+54', '') }))}
                                  title="Editar teléfono"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => deletePhoneForClient(r.uf)}
                                  title="Eliminar teléfono"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Ingresar teléfono (ej: 3514123456)"
                                  className="px-3 py-2 border-2 border-amber-400 bg-amber-50 dark:bg-amber-950 dark:border-amber-600 rounded-lg text-sm flex-1 min-w-[220px] focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all placeholder:text-amber-600/50 dark:placeholder:text-amber-400/50"
                                  value={editingPhone[r.uf] || ''}
                                  onChange={(e) => setEditingPhone(prev => ({ ...prev, [r.uf]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && editingPhone[r.uf]) {
                                      updatePhoneForClient(r.uf, editingPhone[r.uf])
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingPhone(prev => {
                                        const newState = { ...prev }
                                        delete newState[r.uf]
                                        return newState
                                      })
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  className="bg-amber-500 hover:bg-amber-600 text-white"
                                  disabled={!editingPhone[r.uf]}
                                  onClick={() => updatePhoneForClient(r.uf, editingPhone[r.uf])}
                                >
                                  Guardar
                                </Button>
                                {r.telefono && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingPhone(prev => {
                                        const newState = { ...prev }
                                        delete newState[r.uf]
                                        return newState
                                      })
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Mensaje pre-formateado */}
                          {r.mensaje && (
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm">
                              <p className="whitespace-pre-wrap text-muted-foreground">{r.mensaje}</p>
                            </div>
                          )}

                          {/* Acciones */}
                          <div className="flex gap-2 flex-wrap">
                            {r.puedeGenerarComprobante && (
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={() => descargarPDF(r.uf)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Descargar PDF
                              </Button>
                            )}
                            {r.linkComprobante && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                onClick={() => window.open(r.linkComprobante!, '_blank')}
                              >
                                Ver en Espacio Cliente
                              </Button>
                            )}
                            {r.waLink && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  window.open(r.waLink!, '_blank')
                                  toggleEnviado(r.uf)
                                }}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Enviar por WhatsApp
                              </Button>
                            )}
                            {r.mensaje && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copiarMensaje(r.mensaje!, r.nombre!)}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar mensaje
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
