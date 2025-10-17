'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, Download, FileText, Users, AlertTriangle } from "lucide-react"
import { StepUploadFiltro } from './components/StepUploadFiltro'
import { StepProcessFiltro } from './components/StepProcessFiltro'
import { StepDownloadFiltro } from './components/StepDownloadFiltro'

export default function FiltrarClientesPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [jobId, setJobId] = useState<string | null>(null)
  const [resultados, setResultados] = useState<{
    clientesAptos: number
    clientesDescartados: number
    totalProcesados: number
    errores: string[]
  } | null>(null)

  const steps = [
    {
      step: 1,
      title: "Subir archivo Excel",
      description: "Cargar archivo con datos de clientes",
      icon: Upload,
      component: StepUploadFiltro
    },
    {
      step: 2,
      title: "Procesar filtro",
      description: "Verificar deudas en Aguas Cordobesas",
      icon: Users,
      component: StepProcessFiltro
    },
    {
      step: 3,
      title: "Descargar resultados",
      description: "Obtener Excel con clientes filtrados",
      icon: Download,
      component: StepDownloadFiltro
    }
  ]

  const currentStepData = steps.find(s => s.step === currentStep)

  const resetProcess = () => {
    setCurrentStep(1)
    setJobId(null)
    setResultados(null)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Filtrar Clientes para PYSE
        </h1>
        <p className="text-gray-600">
          Procese su archivo Excel para identificar clientes con deuda mayor a 3 comprobantes
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.step
            const isCompleted = currentStep > step.step
            
            return (
              <div key={step.step} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2 
                  ${isActive ? 'border-blue-500 bg-blue-500 text-white' : 
                    isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                    'border-gray-300 bg-white text-gray-400'}
                `}>
                  <Icon size={20} />
                </div>
                
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    Paso {step.step}
                  </p>
                  <p className={`text-xs ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
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
        
        <Progress 
          value={(currentStep - 1) * 50} 
          className="w-full h-2" 
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentStepData && <currentStepData.icon className="h-5 w-5" />}
                {currentStepData?.title}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData?.description}
              </p>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <StepUploadFiltro 
                  onSuccess={(newJobId) => {
                    setJobId(newJobId)
                    setCurrentStep(2)
                  }}
                />
              )}
              
              {currentStep === 2 && jobId && (
                <StepProcessFiltro 
                  jobId={jobId}
                  onComplete={(results) => {
                    setResultados(results)
                    setCurrentStep(3)
                  }}
                />
              )}
              
              {currentStep === 3 && jobId && resultados && (
                <StepDownloadFiltro 
                  jobId={jobId}
                  resultados={resultados}
                  onReset={resetProcess}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">Archivo requerido:</h4>
                <p className="text-xs text-gray-600">Excel (.xlsx) con columna "unidad" (UF)</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm">Criterio de filtro:</h4>
                <p className="text-xs text-gray-600">Clientes con ≥ 3 comprobantes vencidos</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm">Archivos de salida:</h4>
                <ul className="text-xs text-gray-600 space-y-1 mt-1">
                  <li>• clientes_aptos_*.xlsx (para PYSE)</li>
                  <li>• clientes_descartados_*.xlsx (referencia)</li>
                </ul>
              </div>

              <div className="pt-2 border-t">
                <h4 className="font-medium text-sm text-blue-800">Autenticación:</h4>
                <p className="text-xs text-blue-600">Requiere login en sistema AQUA (no WhatsApp)</p>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5" />
                Estado actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Paso actual:</span>
                  <span className="font-medium">{currentStep}/3</span>
                </div>
                
                {jobId && (
                  <div className="flex justify-between text-sm">
                    <span>Job ID:</span>
                    <span className="font-mono text-xs">{jobId.slice(-8)}</span>
                  </div>
                )}

                {resultados && (
                  <>
                    <hr className="my-2" />
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total procesados:</span>
                        <span className="font-medium">{resultados.totalProcesados}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Aptos para PYSE:</span>
                        <span className="font-medium">{resultados.clientesAptos}</span>
                      </div>
                      <div className="flex justify-between text-orange-600">
                        <span>Descartados:</span>
                        <span className="font-medium">{resultados.clientesDescartados}</span>
                      </div>
                      {resultados.errores.length > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Errores:</span>
                          <span className="font-medium">{resultados.errores.length}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              onClick={resetProcess}
              className="w-full"
            >
              Nuevo proceso
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}