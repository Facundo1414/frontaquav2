'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Settings, MessageCircle, BarChart, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AdminTutorialPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Tutorial de Administración</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Guía completa para administrar y monitorear todos los servicios de la plataforma AQUA
        </p>
      </div>

      {/* Alert de bienvenida */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>💡 Panel exclusivo para administradores:</strong> Aquí encontrarás toda la documentación necesaria para gestionar servicios, WhatsApp API, monitoreo PYSE y más.
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <Tabs defaultValue="panel" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 gap-2">
          <TabsTrigger value="panel" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Panel de Servicios
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp API
          </TabsTrigger>
          <TabsTrigger value="pyse" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Monitoreo PYSE
          </TabsTrigger>
          <TabsTrigger value="uso" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Uso General
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Panel de Servicios */}
        <TabsContent value="panel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-blue-600" />
                Guía Rápida: Panel de Servicios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Acceso rápido */}
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Acceso Rápido
                </h3>
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900">
                    <strong>URL:</strong> <code className="bg-green-100 px-2 py-1 rounded">/admin/services</code> 
                    <br />O desde el dashboard admin → Card "Gestión de Servicios"
                  </AlertDescription>
                </Alert>
              </div>

              {/* Vista general */}
              <div>
                <h3 className="text-xl font-semibold mb-3">1. Vista General de Servicios</h3>
                <p className="text-gray-700 mb-3">
                  Al entrar, verás 4 cards con información de cada servicio (Backend API, Baileys Worker, Comprobante Worker, Frontend).
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="font-semibold mb-2">Información mostrada:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span><strong>Status:</strong> Running (verde), Stopped (rojo), Unknown (gris)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span><strong>Uptime:</strong> Tiempo desde último restart</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span><strong>CPU:</strong> Porcentaje de uso de CPU</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-purple-600" />
                      <span><strong>Memory:</strong> Uso de memoria en MB</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span><strong>Restarts:</strong> Contador de reinicios</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Ver logs */}
              <div>
                <h3 className="text-xl font-semibold mb-3">2. Ver Logs en Tiempo Real</h3>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>Paso 1:</strong> Click en cualquier card de servicio
                  </p>
                  <p className="text-gray-700">
                    <strong>Paso 2:</strong> Se abrirá el terminal de logs en la parte inferior
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs">
                    <div className="flex items-center justify-between mb-2 border-b border-gray-700 pb-2">
                      <span>📋 Logs: Backend API</span>
                      <span className="text-gray-400">[Todos ▼]</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-blue-400">14:30:25 [INFO]  Processing request</div>
                      <div className="text-blue-400">14:30:26 [INFO]  Database query executed</div>
                      <div className="text-yellow-400">14:30:27 [WARN]  Cache miss</div>
                      <div className="text-red-400">14:30:28 [ERROR] Failed to connect to external service</div>
                      <div className="text-blue-400">14:30:29 [INFO]  User authenticated</div>
                    </div>
                  </div>
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-900 text-sm">
                      <strong>Características:</strong>
                      <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>🔄 Auto-actualización cada 2 segundos</li>
                        <li>📜 Auto-scroll a los logs más recientes</li>
                        <li>🎨 Colores por nivel: INFO (azul), WARN (amarillo), ERROR (rojo), DEBUG (gris)</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Filtrar y exportar */}
              <div>
                <h3 className="text-xl font-semibold mb-3">3. Filtrar y Exportar Logs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="font-semibold mb-2">🔍 Filtros disponibles:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• <strong>Todos:</strong> Ver todos los logs</li>
                      <li>• <strong>Errors:</strong> Solo errores (rojo)</li>
                      <li>• <strong>Warnings:</strong> Solo advertencias (amarillo)</li>
                      <li>• <strong>Info:</strong> Solo información (azul)</li>
                      <li>• <strong>Debug:</strong> Solo debug (gris)</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="font-semibold mb-2">💾 Exportar logs:</p>
                    <p className="text-sm mb-2">Click en botón "Export" para descargar un archivo .txt con todos los logs.</p>
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded block">
                      backend-logs-2025-01-15.txt
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: WhatsApp API */}
        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-green-600" />
                Configuración de WhatsApp Business Cloud API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Requisitos */}
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Requisitos Previos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm"><strong>1.</strong> Cuenta de Facebook personal o de negocio</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm"><strong>2.</strong> Número de teléfono no asociado a WhatsApp Business</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm"><strong>3.</strong> Acceso a computadora (no móvil)</p>
                  </div>
                </div>
              </div>

              {/* Paso 1 */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Paso 1: Crear Cuenta de Negocio en Meta</h3>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>1.1 Acceder a Meta Business Suite:</strong>
                  </p>
                  <ol className="list-decimal ml-5 space-y-2 text-gray-700">
                    <li>Ve a <a href="https://business.facebook.com/" target="_blank" className="text-blue-600 hover:underline">https://business.facebook.com/</a></li>
                    <li>Haz clic en "Crear una cuenta" (si no tienes una)</li>
                    <li>Completa: Nombre del negocio, Tu nombre, Email de contacto</li>
                  </ol>
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-900 text-sm">
                      <strong>⏱️ Tiempo de verificación:</strong> Meta puede solicitar verificación de negocio (1-3 días hábiles)
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Paso 2 */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Paso 2: Configurar WhatsApp Business Platform</h3>
                <ol className="list-decimal ml-5 space-y-2 text-gray-700">
                  <li>En Meta Business Suite → menú lateral izquierdo</li>
                  <li>Busca "WhatsApp Business Platform" o "Cuentas de WhatsApp"</li>
                  <li>Haz clic en "Empezar"</li>
                  <li>Meta pedirá crear o vincular una <strong>App de Desarrollador</strong></li>
                  <li>Crea nueva app → Tipo: "Negocio"</li>
                  <li>Nombre: "Aqua WhatsApp Integration" (o tu preferencia)</li>
                </ol>
              </div>

              {/* Paso 3 */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Paso 3: Obtener Credenciales</h3>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="font-semibold mb-2">🔑 Phone Number ID</p>
                    <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
                      <li>WhatsApp Business Platform → "Números de teléfono"</li>
                      <li>Copia el <strong>Phone Number ID</strong> (15 dígitos)</li>
                    </ol>
                    <code className="text-xs bg-purple-100 px-2 py-1 rounded block mt-2">
                      Ejemplo: 123456789012345
                    </code>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="font-semibold mb-2 text-red-900">🔐 Access Token (Permanente)</p>
                    <Alert className="mb-3 bg-red-100 border-red-300">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-900 text-sm">
                        <strong>IMPORTANTE:</strong> Necesitas un token <strong>permanente</strong>, no temporal.
                      </AlertDescription>
                    </Alert>
                    <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
                      <li>API Setup → "Permanent tokens" → "Generate token"</li>
                      <li>Selecciona permisos:
                        <ul className="list-disc ml-5 mt-1">
                          <li>✅ whatsapp_business_messaging</li>
                          <li>✅ whatsapp_business_management</li>
                        </ul>
                      </li>
                      <li>Copia el token (comienza con <code className="bg-gray-200 px-1 rounded">EAA...</code>)</li>
                      <li><strong>⚠️ GUÁRDALO SEGURO</strong> - No podrás volver a verlo</li>
                    </ol>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="font-semibold mb-2">🏢 Business Account ID</p>
                    <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
                      <li>En configuración de WhatsApp Platform</li>
                      <li>Busca "WhatsApp Business Account ID"</li>
                      <li>Copia el ID (15-20 dígitos)</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Paso 4 */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Paso 4: Configurar en AQUA</h3>
                <ol className="list-decimal ml-5 space-y-2 text-gray-700">
                  <li>Ve a <code className="bg-gray-200 px-2 py-1 rounded">/whatsapp/config</code></li>
                  <li>Ingresa las 3 credenciales obtenidas</li>
                  <li>Click en "Validar Credenciales"</li>
                  <li>Si todo está correcto, aparecerá ✅ "Credenciales válidas"</li>
                  <li>Click en "Guardar Configuración"</li>
                </ol>
                <Alert className="mt-3 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900 text-sm">
                    <strong>✅ Configuración única:</strong> Las credenciales se guardan permanentemente en Supabase (con encriptación). No necesitas volver a configurar.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Monitoreo */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Paso 5: Monitorear Uso</h3>
                <p className="text-gray-700 mb-3">
                  Revisa tu uso de WhatsApp API en <code className="bg-gray-200 px-2 py-1 rounded">/whatsapp/usage</code>
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="font-semibold mb-2">💡 Límites gratuitos de Meta:</p>
                  <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
                    <li><strong>1000 conversaciones gratis/mes</strong> (nuevas conversaciones iniciadas en 24hs)</li>
                    <li>Después: Costo variable según país y tipo de mensaje</li>
                    <li>Badge en navbar muestra cuántas conversaciones gratis quedan</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Monitoreo PYSE */}
        <TabsContent value="pyse" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-6 w-6 text-purple-600" />
                Panel de Monitoreo PYSE
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Descripción */}
              <Alert className="bg-purple-50 border-purple-200">
                <AlertDescription className="text-purple-900">
                  <strong>🚨 Propósito:</strong> Sistema de monitoreo para detectar abuso de cuotas y credenciales compartidas en el servicio PYSE.
                </AlertDescription>
              </Alert>

              {/* Objetivos */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Objetivos del Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <p className="text-sm"><strong>1. Prevenir abuso:</strong> Identificar usuarios que exceden el uso esperado</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <p className="text-sm"><strong>2. Detectar compartir credenciales:</strong> Cuentas desde múltiples IPs/dispositivos</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm"><strong>3. Visibilidad completa:</strong> Métricas en tiempo real</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm"><strong>4. Alertas automáticas:</strong> Score de sospecha (0-100)</p>
                  </div>
                </div>
              </div>

              {/* Base de datos */}
              <div>
                <h3 className="text-xl font-semibold mb-3">🔧 Arquitectura Técnica</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs">
                  <div className="text-green-400 mb-2">-- Tabla de sesiones PYSE</div>
                  <div className="text-blue-300">CREATE TABLE pyse_usage_sessions (</div>
                  <div className="ml-4 space-y-1">
                    <div>id UUID PRIMARY KEY,</div>
                    <div>user_id UUID REFERENCES auth.users(id),</div>
                    <div>query_timestamp TIMESTAMPTZ NOT NULL,</div>
                    <div className="text-yellow-300">ip_address VARCHAR(45) NOT NULL,</div>
                    <div className="text-yellow-300">user_agent TEXT NOT NULL,</div>
                    <div>accounts_verified INTEGER DEFAULT 1,</div>
                    <div>created_at TIMESTAMPTZ DEFAULT NOW()</div>
                  </div>
                  <div className="text-blue-300">);</div>
                </div>
                <p className="text-gray-700 mt-3 text-sm">
                  <strong>Propósito:</strong> Registra cada consulta individual con IP y User-Agent para análisis de patrones sospechosos.
                </p>
              </div>

              {/* Endpoints */}
              <div>
                <h3 className="text-xl font-semibold mb-3">🌐 Endpoints Disponibles</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <code className="text-sm font-semibold">GET /api/admin/pyse-usage/all-users</code>
                    <p className="text-xs text-gray-600 mt-1">Obtener uso de todos los usuarios con filtros (fecha, plan, uso mínimo)</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <code className="text-sm font-semibold">GET /api/admin/pyse-usage/stats</code>
                    <p className="text-xs text-gray-600 mt-1">Estadísticas agregadas del sistema (usuarios activos, consultas totales, alertas)</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <code className="text-sm font-semibold">GET /api/admin/pyse-usage/suspicious</code>
                    <p className="text-xs text-gray-600 mt-1">Lista de usuarios con actividad sospechosa (score 0-100)</p>
                  </div>
                </div>
              </div>

              {/* Interpretación */}
              <div>
                <h3 className="text-xl font-semibold mb-3">🕵️ Interpretación de Resultados</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="font-semibold mb-3">Indicadores de actividad sospechosa:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span><strong>unique_ips {'>'} 2:</strong> Cuenta accedida desde 3+ ubicaciones (posible compartir credenciales)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                      <span><strong>unique_user_agents {'>'} 1:</strong> Múltiples navegadores/dispositivos (posible compartir)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <span><strong>usage_percent {'>'} 90%:</strong> Usuario constantemente alcanza límite (potencial abuso)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-purple-600 mt-0.5" />
                      <span><strong>Actividad nocturna:</strong> Consultas entre 22:00-06:00 (patrón inusual)</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Acciones recomendadas */}
              <div>
                <h3 className="text-xl font-semibold mb-3">⚠️ Acciones Recomendadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="font-semibold text-sm mb-1">Score 30-50 (Bajo)</p>
                    <p className="text-xs text-gray-700">Monitorear. Puede ser uso legítimo desde múltiples ubicaciones.</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <p className="font-semibold text-sm mb-1">Score 50-70 (Medio)</p>
                    <p className="text-xs text-gray-700">Enviar advertencia al usuario. Solicitar confirmación de actividad.</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <p className="font-semibold text-sm mb-1">Score 70-100 (Alto)</p>
                    <p className="text-xs text-gray-700">Suspensión temporal. Investigar actividad detalladamente.</p>
                  </div>
                </div>
              </div>

              {/* Estado implementación */}
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-900 text-sm">
                  <strong>📊 Estado de implementación:</strong>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>✅ Backend: 3 endpoints implementados y probados</li>
                    <li>✅ Base de datos: Tabla y función SQL creadas</li>
                    <li>⏳ Frontend: Panel administrativo pendiente (2 días de desarrollo)</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Uso General */}
        <TabsContent value="uso" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-indigo-600" />
                Guía de Uso General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-gray-50 border-gray-200">
                <AlertDescription className="text-gray-900">
                  Esta sección está actualmente vacía. Se completará con la documentación de uso general del sistema.
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="text-xl font-semibold mb-3">Temas a incluir:</h3>
                <ul className="list-disc ml-5 space-y-2 text-gray-700">
                  <li>Gestión de usuarios y planes de suscripción</li>
                  <li>Configuración de límites y cuotas</li>
                  <li>Integración con sistemas externos</li>
                  <li>Backup y recuperación de datos</li>
                  <li>Resolución de problemas comunes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
