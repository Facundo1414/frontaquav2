'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, BookOpen, Zap, Users, BarChart3, AlertTriangle, Settings } from 'lucide-react'

export function AdminTutorial() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border-2 border-blue-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-blue-900">
            📚 Guía Rápida del Panel de Admin
          </h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-6 w-6 text-blue-600" />
        ) : (
          <ChevronDown className="h-6 w-6 text-blue-600" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Descripción General */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              ¿Qué es este panel?
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Este panel te permite gestionar el sistema <strong className="text-green-400">Baileys Worker</strong>, 
              que es la nueva implementación de WhatsApp usando la librería Baileys. Reemplaza al sistema legacy 
              basado en <strong className="text-orange-400">Puppeteer</strong>. Desde aquí podés activar/desactivar 
              Baileys, agregar usuarios beta, monitorear métricas y hacer rollback de emergencia.
            </p>
          </div>

          {/* Sección 1: Control de Baileys */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              1️⃣ Panel de Control de Baileys
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong className="text-gray-900">Activar/Desactivar Baileys:</strong> Toggle principal para habilitar 
                  o deshabilitar completamente el sistema Baileys. Cuando está desactivado, todos los usuarios usan Puppeteer.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">%</span>
                <div>
                  <strong className="text-gray-900">Rollout Percentage:</strong> Slider de 0-100% que controla cuántos 
                  usuarios <em>nuevos</em> (no beta) usan Baileys. Ejemplo: 25% = 1 de cada 4 usuarios usa Baileys.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">🚨</span>
                <div>
                  <strong className="text-gray-900">Emergency Rollback:</strong> Botón de pánico. Desactiva Baileys 
                  instantáneamente y manda a todos los usuarios a Puppeteer. Útil si hay errores críticos.
                </div>
              </li>
            </ul>
          </div>

          {/* Sección 2: Beta Users */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              2️⃣ Gestión de Beta Users
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">👥</span>
                <div>
                  <strong className="text-gray-900">Agregar Beta User:</strong> Ingresá el UID del usuario y notas opcionales. 
                  Los beta users <em>siempre</em> usan Baileys independientemente del rollout percentage.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">🎯</span>
                <div>
                  <strong className="text-gray-900">Uso:</strong> Ideal para testing controlado. Agregá usuarios de 
                  confianza que puedan reportar errores antes de abrir Baileys a todos.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">🗑️</span>
                <div>
                  <strong className="text-gray-900">Eliminar:</strong> Clic en "Eliminar" para sacar a un usuario de la 
                  lista beta. Volverá a estar sujeto al rollout percentage.
                </div>
              </li>
            </ul>
          </div>

          {/* Sección 3: Métricas */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-600" />
              3️⃣ Métricas de Performance
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">🐕</span>
                <div>
                  <strong className="text-gray-900">Puppeteer (Legacy):</strong> Muestra success rate, duración promedio 
                  y cantidad de requests del sistema antiguo.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">⚡</span>
                <div>
                  <strong className="text-gray-900">Baileys (Nuevo):</strong> Mismas métricas pero para el nuevo sistema. 
                  Comparalo con Puppeteer para ver si hay mejoras.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">🚀</span>
                <div>
                  <strong className="text-gray-900">Mejora:</strong> Calcula automáticamente la diferencia entre ambos. 
                  Verde = Baileys es mejor. Rojo = Puppeteer es mejor.
                </div>
              </li>
            </ul>
          </div>

          {/* Sección 4: Flujo Recomendado */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-300 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              🎯 Flujo Recomendado para Activar Baileys
            </h3>
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>
                <strong className="text-gray-900">Activar Baileys</strong> con el toggle principal (arriba a la izquierda)
              </li>
              <li>
                <strong className="text-gray-900">Agregar 2-3 Beta Users</strong> de confianza (tu UID, clientes conocidos)
              </li>
              <li>
                <strong className="text-gray-900">Testing inicial:</strong> Pediles que prueben enviar mensajes y reportar errores
              </li>
              <li>
                <strong className="text-gray-900">Monitorear métricas:</strong> Revisá que Baileys tenga buen success rate (↑ 90%)
              </li>
              <li>
                <strong className="text-gray-900">Rollout gradual:</strong> Aumentá el porcentaje de 0% → 10% → 25% → 50% → 100%
              </li>
              <li>
                <strong className="text-gray-900">Si hay problemas:</strong> Usá "Emergency Rollback" para volver a Puppeteer
              </li>
            </ol>
          </div>

          {/* Sección 5: Consejos */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Consejos</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <div>Las métricas se actualizan automáticamente cada 30 segundos</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <div>Los beta users no se ven afectados por el rollout percentage (siempre usan Baileys)</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <div>El rollout percentage solo aplica a usuarios que NO están en la lista beta</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">⚠️</span>
                <div>Si Baileys está desactivado, NADIE usa Baileys (ni beta users)</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">⚠️</span>
                <div>Emergency Rollback desactiva Baileys y setea el rollout a 0%</div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
