'use client'

import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface ValidationError {
  row: number
  uf: string | number
  cliente: string
  errors: string[]
}

interface ValidationSummary {
  total: number
  valid: number
  invalid: number
  withPhone: number
  withoutPhone: number
  duplicateUfs: number
}

interface ValidationPreviewProps {
  summary: ValidationSummary
  errors: ValidationError[]
  onContinue: () => void
  onCancel: () => void
  canContinue: boolean
}

export function ValidationPreviewProximosVencer({
  summary,
  errors,
  onContinue,
  onCancel,
  canContinue,
}: ValidationPreviewProps) {
  const hasErrors = errors.length > 0
  const hasWarnings = summary.withoutPhone > 0 || summary.duplicateUfs > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Resumen de Validación */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          {hasErrors ? (
            <XCircle className="h-5 w-5 text-red-500" />
          ) : hasWarnings ? (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          Validación de Archivo
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total de clientes</p>
            <p className="text-2xl font-bold">{summary.total}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Válidos</p>
            <p className="text-2xl font-bold text-green-600">{summary.valid}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Con errores</p>
            <p className="text-2xl font-bold text-red-600">{summary.invalid}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Con WhatsApp</p>
            <p className="text-2xl font-bold text-blue-600">{summary.withPhone}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Sin WhatsApp</p>
            <p className="text-2xl font-bold text-amber-600">
              {summary.withoutPhone}
            </p>
          </div>

          {summary.duplicateUfs > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">UFs duplicadas</p>
              <p className="text-2xl font-bold text-red-600">
                {summary.duplicateUfs}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de Errores */}
      {errors.length > 0 && (
        <div className="border rounded-lg bg-white overflow-hidden">
          <div className="bg-red-50 border-b px-4 py-3">
            <h4 className="font-semibold text-red-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Errores Detectados ({errors.length})
            </h4>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Fila
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    UF
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Cliente
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Errores
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {errors.slice(0, 50).map((error, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2 text-gray-900">{error.row}</td>
                    <td className="px-4 py-2 font-mono text-gray-900">
                      {error.uf}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {error.cliente}
                    </td>
                    <td className="px-4 py-2">
                      <ul className="list-disc list-inside text-red-600 space-y-1">
                        {error.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {errors.length > 50 && (
              <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600 text-center">
                Mostrando primeros 50 errores de {errors.length} total
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensaje Informativo */}
      {canContinue && hasWarnings && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-medium mb-1">Advertencia</p>
            <p>
              Hay {summary.withoutPhone} cliente(s) sin número de WhatsApp válido.
              Solo se procesarán los {summary.withPhone} clientes con WhatsApp.
            </p>
          </div>
        </div>
      )}

      {!canContinue && hasErrors && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-900">
            <p className="font-medium mb-1">No se puede continuar</p>
            <p>
              Corregí los errores en el archivo Excel y volvé a cargarlo. Los
              errores más comunes son:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>UFs con formato incorrecto (deben ser 6-8 dígitos)</li>
              <li>Teléfonos con letras o formatos inválidos</li>
              <li>Nombres de cliente vacíos o muy cortos</li>
              <li>UFs duplicadas en el mismo archivo</li>
            </ul>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={onContinue}
          disabled={!canContinue}
          className={
            canContinue
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-300 cursor-not-allowed'
          }
        >
          {canContinue
            ? `Continuar con ${summary.withPhone} cliente(s) →`
            : 'Corregir errores primero'}
        </Button>
      </div>
    </motion.div>
  )
}
