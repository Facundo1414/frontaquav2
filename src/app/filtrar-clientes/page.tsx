'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Map, Search, Download, CheckCircle2, Info, ChevronDown, ChevronUp } from "lucide-react"
import { StepUploadUniverso } from './components/StepUploadUniverso'
import { StepSeleccionarBarrios, FiltrosBarrios } from './components/StepSeleccionarBarrios'
import { StepVerificarDeuda } from './components/StepVerificarDeuda'
import { StepDescargarResultados } from './components/StepDescargarResultados'
import { getUniverseInfo, getNeighborhoodsWithCount } from '@/lib/api'

export interface DebtCheckResult {
  uf: number
  comprobantesVencidos: number
  totalDeuda?: number
  hasPaymentPlan?: boolean
  reason?: string
  error?: string
  barrio?: string // 🔥 Nuevo
}

interface NeighborhoodWithCount {
  neighborhood: string
  accountCount: number
}

export interface ProcessResults {
  results: DebtCheckResult[]
  totalProcessed: number
  errors: number
  withDebt: number
  withPaymentPlan: number
}

export default function FiltrarClientesPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [universoInfo, setUniversoInfo] = useState<{
    neighborhoods: string[]
    totalAccounts: number
    fileName: string
  } | null>(null)
  const [neighborhoodsWithCount, setNeighborhoodsWithCount] = useState<NeighborhoodWithCount[]>([]) // 🔥 Nuevo
  const [barriosSeleccionados, setBarriosSeleccionados] = useState<string[]>([])
  const [filtrosActivos, setFiltrosActivos] = useState<FiltrosBarrios | null>(null)
  const [resultados, setResultados] = useState<ProcessResults | null>(null)
  const [showExplanation, setShowExplanation] = useState(false) // 🔥 Nuevo: Para mostrar/ocultar explicación

  // 🔥 Recuperar universoInfo al montar el componente
  // Prioridad: 1. Base de datos, 2. localStorage (fallback)
  useEffect(() => {
    const loadUniverseInfo = async () => {
      try {
        // 1. Intentar recuperar desde la base de datos
        const universeData = await getUniverseInfo()
        
        if (universeData) {
          console.log('✅ Universo recuperado desde la base de datos:', universeData)
          setUniversoInfo(universeData)
          
          // 🔥 Cargar barrios con conteo
          const neighborhoodsData = await getNeighborhoodsWithCount()
          if (neighborhoodsData) {
            console.log('✅ Barrios con conteo:', neighborhoodsData)
            setNeighborhoodsWithCount(neighborhoodsData.neighborhoods)
          }
          
          setCurrentStep(2)
          return
        }

        // 2. Fallback a localStorage si no hay en BD
        const savedUniverso = localStorage.getItem('universoInfo')
        if (savedUniverso) {
          try {
            const parsed = JSON.parse(savedUniverso)
            console.log('✅ Universo recuperado desde localStorage:', parsed)
            setUniversoInfo(parsed)
            
            // 🔥 También intentar cargar barrios con conteo desde BD
            try {
              const neighborhoodsData = await getNeighborhoodsWithCount()
              if (neighborhoodsData) {
                console.log('✅ Barrios con conteo desde BD:', neighborhoodsData)
                setNeighborhoodsWithCount(neighborhoodsData.neighborhoods)
              }
            } catch (err) {
              console.log('⚠️ No se pudieron cargar conteos desde BD, usando solo nombres')
            }
            
            setCurrentStep(2)
          } catch (error) {
            console.error('Error al parsear universoInfo de localStorage:', error)
            localStorage.removeItem('universoInfo')
          }
        }
      } catch (error) {
        console.error('Error al cargar universo:', error)
        // Si falla la BD, intentar localStorage como último recurso
        const savedUniverso = localStorage.getItem('universoInfo')
        if (savedUniverso) {
          try {
            const parsed = JSON.parse(savedUniverso)
            setUniversoInfo(parsed)
            setCurrentStep(2)
          } catch (e) {
            localStorage.removeItem('universoInfo')
          }
        }
      }
    }

    loadUniverseInfo()
  }, [])

  // 🔥 Guardar universoInfo en localStorage cuando cambie
  useEffect(() => {
    if (universoInfo) {
      localStorage.setItem('universoInfo', JSON.stringify(universoInfo))
    }
  }, [universoInfo])

  const steps = [
    {
      step: 1,
      title: "Subir Universo",
      description: "📂 Carga tu archivo UNA SOLA VEZ - se guardará para usar después",
      icon: Upload,
      component: StepUploadUniverso
    },
    {
      step: 2,
      title: "Seleccionar Barrios",
      description: "🏘️ Elige barrios para HOY (~300 cuentas recomendado)",
      icon: Map,
      component: StepSeleccionarBarrios
    },
    {
      step: 3,
      title: "Verificar Deuda",
      description: "🔍 Consulta automática a Aguas Cordobesas",
      icon: Search,
      component: StepVerificarDeuda
    },
    {
      step: 4,
      title: "Descargar Resultados",
      description: "📊 Descarga 2 Excel: APTOS (3+ consumos) y NO APTOS",
      icon: Download,
      component: StepDescargarResultados
    }
  ]

  const currentStepData = steps.find(s => s.step === currentStep)

  const handleUniversoSubido = (info: { neighborhoods: string[], totalAccounts: number, fileName: string }) => {
    setUniversoInfo(info)
    // ✅ Se guarda automáticamente en localStorage por el useEffect
    setCurrentStep(2)
  }

  const handleBarriosSeleccionados = (filtros: FiltrosBarrios) => {
    setBarriosSeleccionados(filtros.barrios)
    setFiltrosActivos(filtros)
    setCurrentStep(3)
  }

  const handleVerificacionCompleta = (results: ProcessResults) => {
    setResultados(results)
    setCurrentStep(4)
  }

  const resetProcess = () => {
    setCurrentStep(1)
    setUniversoInfo(null)
    setBarriosSeleccionados([])
    setFiltrosActivos(null)
    setResultados(null)
    // 🔥 Limpiar localStorage
    localStorage.removeItem('universoInfo')
  }

  const procesarMasBarrios = () => {
    // Solo resetea la selección de barrios y resultados, mantiene el universo
    setBarriosSeleccionados([])
    setFiltrosActivos(null)
    setResultados(null)
    setCurrentStep(2) // Volver al paso 2 (selección de barrios)
  }

  const limpiarUniverso = () => {
    setUniversoInfo(null)
    setCurrentStep(1)
    setBarriosSeleccionados([])
    setFiltrosActivos(null)
    setResultados(null)
    // 🔥 Limpiar localStorage
    localStorage.removeItem('universoInfo')
  }

  const irAPasoAnterior = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Filtrar Clientes para PYSE
            </h1>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
              ✨ NUEVO FLUJO MEJORADO
            </span>
          </div>
        </div>
        <p className="text-gray-600 text-lg">
          Sistema de Verificación de Deuda por Barrios - Procese cuentas de forma controlada
        </p>
      </div>

      {/* Explicación del Nuevo Flujo - COLAPSABLE */}
      <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Info className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-blue-900">
                💡 ¿Cómo funciona este nuevo sistema?
              </h3>
            </div>
            <div className="text-blue-600">
              {showExplanation ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </button>

          {showExplanation && (
            <div className="mt-4 pl-13">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📂</span>
                    <span className="font-bold text-blue-900">1. Sube el archivo UNA SOLA VEZ</span>
                  </div>
                  <p className="text-gray-700">
                    Ya no necesitas subir el Excel cada vez. El sistema lo guarda y lo reutiliza.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🏘️</span>
                    <span className="font-bold text-blue-900">2. Elige barrios por día</span>
                  </div>
                  <p className="text-gray-700">
                    Selecciona qué barrios procesar (~300 cuentas/día recomendado para no saturar el sistema).
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🔍</span>
                    <span className="font-bold text-blue-900">3. Verifica en tiempo real</span>
                  </div>
                  <p className="text-gray-700">
                    El sistema consulta Aguas Cordobesas de forma controlada (máx. 2000 req/hora).
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📊</span>
                    <span className="font-bold text-blue-900">4. Descarga resultados</span>
                  </div>
                  <p className="text-gray-700">
                    Obtén 2 archivos Excel: APTOS (3+ consumos vencidos) y NO APTOS.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  <strong>💡 Ventaja:</strong> Procesa el universo completo en varios días sin volver a subir el archivo.
                  Cada día seleccionas nuevos barrios hasta completar todos.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 overflow-x-auto pb-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.step
            const isCompleted = currentStep > step.step
            
            return (
              <div key={step.step} className="flex items-center min-w-fit">
                <div className="text-center">
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 mx-auto mb-2
                    ${isActive ? 'border-blue-500 bg-blue-500 text-white' : 
                      isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                      'border-gray-300 bg-white text-gray-400'}
                  `}>
                    {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                  </div>
                  
                  <div className="hidden sm:block">
                    <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className={`
                    w-8 sm:w-16 h-0.5 mx-4 
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Info Cards */}
      {universoInfo && (
        <div className="space-y-4 mb-6">
          {/* Tarjeta de Universo Cargado */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      ✅ Universo Cargado: {universoInfo.fileName}
                    </p>
                    <p className="text-xs text-green-700">
                      {universoInfo.neighborhoods.length} barrios • {universoInfo.totalAccounts.toLocaleString()} cuentas
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={limpiarUniverso}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  🗑️ Subir otro archivo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Barrios Cargados</p>
                    <p className="text-2xl font-bold text-blue-600">{universoInfo.neighborhoods.length}</p>
                  </div>
                  <Map className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Cuentas</p>
                    <p className="text-2xl font-bold text-green-600">{universoInfo.totalAccounts.toLocaleString()}</p>
                  </div>
                  <Upload className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Barrios Seleccionados</p>
                    <p className="text-2xl font-bold text-purple-600">{barriosSeleccionados.length}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {currentStepData && <currentStepData.icon className="h-6 w-6" />}
            <span>{currentStepData?.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <StepUploadUniverso onSuccess={handleUniversoSubido} />
          )}
          
          {currentStep === 2 && universoInfo && (
            <StepSeleccionarBarrios 
              neighborhoods={universoInfo.neighborhoods}
              neighborhoodsWithCount={neighborhoodsWithCount} // 🔥 Pasar barrios con conteo
              onSelect={handleBarriosSeleccionados}
            />
          )}
          
          {currentStep === 3 && filtrosActivos && (
            <StepVerificarDeuda 
              filtros={filtrosActivos}
              onComplete={handleVerificacionCompleta}
            />
          )}
          
          {currentStep === 4 && resultados && (
            <StepDescargarResultados 
              results={resultados}
              onReset={resetProcess}
              onProcessMore={procesarMasBarrios}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={irAPasoAnterior}
          disabled={currentStep === 1}
        >
          ← Paso Anterior
        </Button>

        {currentStep < 4 && (
          <Button
            variant="outline"
            onClick={resetProcess}
          >
            Reiniciar Proceso
          </Button>
        )}
      </div>
    </div>
  )
}
