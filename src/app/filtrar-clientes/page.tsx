'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Map, Search, Download, CheckCircle2, Info, ChevronDown, ChevronUp, Users, Loader2 } from "lucide-react"
import { getUniverseInfo, getNeighborhoodsWithCount } from '@/lib/api'
import { PyseUsageBar } from '@/components/PyseUsageBar'
import type { FiltrosBarrios } from './components/StepSeleccionarBarrios'

// 🚀 Lazy load de componentes pesados
const StepUploadUniverso = dynamic(() => import('./components/StepUploadUniverso').then(mod => ({ default: mod.StepUploadUniverso })), {
  loading: () => <LoadingStep />,
})

const StepSeleccionarClientesBD = dynamic(() => import('./components/StepSeleccionarClientesBD').then(mod => ({ default: mod.StepSeleccionarClientesBD })), {
  loading: () => <LoadingStep />,
})

const StepSeleccionarBarrios = dynamic(() => import('./components/StepSeleccionarBarrios').then(mod => ({ default: mod.StepSeleccionarBarrios })), {
  loading: () => <LoadingStep />,
})

const StepVerificarDeuda = dynamic(() => import('./components/StepVerificarDeuda').then(mod => ({ default: mod.StepVerificarDeuda })), {
  loading: () => <LoadingStep />,
})

const StepDescargarResultados = dynamic(() => import('./components/StepDescargarResultados').then(mod => ({ default: mod.StepDescargarResultados })), {
  loading: () => <LoadingStep />,
})

// 🎨 Loading component
function LoadingStep() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}

export interface DebtCheckResult {
  uf: number
  comprobantesVencidos: number
  totalDeuda?: number
  hasPaymentPlan?: boolean
  reason?: string
  error?: string
  barrio?: string // Nuevo
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
  const [selectedClients, setSelectedClients] = useState<any[]>([]) // Nuevo: clientes seleccionados desde BD
  const [universoInfo, setUniversoInfo] = useState<{
    neighborhoods: string[]
    totalAccounts: number
    fileName: string
  } | null>(null)
  const [neighborhoodsWithCount, setNeighborhoodsWithCount] = useState<NeighborhoodWithCount[]>([]) // Nuevo
  const [barriosSeleccionados, setBarriosSeleccionados] = useState<string[]>([])
  const [filtrosActivos, setFiltrosActivos] = useState<FiltrosBarrios | null>(null)
  const [resultados, setResultados] = useState<ProcessResults | null>(null)
  const [showExplanation, setShowExplanation] = useState(false) // Nuevo: Para mostrar/ocultar explicación

  // Ya no necesitamos cargar universo automáticamente
  // El flujo comienza directamente en selección desde BD

  const steps = [
    {
      step: 1,
      title: "Seleccionar Clientes",
      description: "🔍 Filtra clientes desde tu base de datos",
      icon: Users,
      component: StepSeleccionarClientesBD
    },
    {
      step: 2,
      title: "Verificar Deuda",
      description: "🔍 Consulta automática a Aguas Cordobesas",
      icon: Search,
      component: StepVerificarDeuda
    },
    {
      step: 3,
      title: "Descargar Resultados",
      description: "📊 Descarga 2 Excel: APTOS (3+ consumos) y NO APTOS",
      icon: Download,
      component: StepDescargarResultados
    }
  ]

  const currentStepData = steps.find(s => s.step === currentStep)

  // Nuevo handler: clientes seleccionados desde BD
  const handleClientesSeleccionados = (clients: any[]) => {
    setSelectedClients(clients)
    setCurrentStep(2)
  }

  const handleVerificacionCompleta = (results: ProcessResults) => {
    setResultados(results)
    setCurrentStep(3)
  }

  const resetProcess = () => {
    setCurrentStep(1)
    setSelectedClients([])
    setResultados(null)
  }

  const procesarNuevamente = () => {
    // Volver al paso 1 para seleccionar otros clientes
    setSelectedClients([])
    setResultados(null)
    setCurrentStep(1)
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
          Procesa clientes directamente desde tu base de datos
        </p>
      </div>

      {/* PYSE Usage Bar */}
      <div className="mb-6">
        <PyseUsageBar />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">�</span>
                    <span className="font-bold text-blue-900">1. Selecciona clientes</span>
                  </div>
                  <p className="text-gray-700">
                    Usa filtros (barrio, deuda, estado) para seleccionar qué clientes procesar. No necesitas subir archivos.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⚡</span>
                    <span className="font-bold text-blue-900">2. Verifica deuda</span>
                  </div>
                  <p className="text-gray-700">
                    El sistema consulta Aguas Cordobesas automáticamente y filtra por cantidad de comprobantes vencidos.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📊</span>
                    <span className="font-bold text-blue-900">3. Descarga resultados</span>
                  </div>
                  <p className="text-gray-700">
                    Obtén 2 archivos Excel: APTOS (3+ comprobantes) y NO APTOS. Los clientes se marcan automáticamente en tu BD.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  <strong>💡 Ventaja:</strong> Procesa solo los clientes que necesitas, sin archivos Excel redundantes. 
                  Después de procesar, los clientes quedan marcados para seguimiento de notificaciones.
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
            <StepSeleccionarClientesBD onNext={handleClientesSeleccionados} />
          )}
          
          {currentStep === 2 && selectedClients.length > 0 && (
            <StepVerificarDeuda 
              selectedClients={selectedClients}
              onComplete={handleVerificacionCompleta}
            />
          )}
          
          {currentStep === 3 && resultados && (
            <StepDescargarResultados 
              results={resultados}
              selectedClients={selectedClients}
              onReset={resetProcess}
              onProcessMore={procesarNuevamente}
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

        {currentStep < 3 && (
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
