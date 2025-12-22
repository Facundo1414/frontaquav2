'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { BookOpen, Settings, MessageCircle, BarChart, AlertTriangle, CheckCircle, Clock, Zap, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AdminTutorialPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Panel
        </Button>
        
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
      <Tabs defaultValue="whatsapp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 gap-2">
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

        {/* Tab 1: WhatsApp API */}
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

        {/* Tab 2: Monitoreo PYSE */}
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
                Guía de Uso General del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Arquitectura del sistema */}
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Arquitectura del Sistema
                </h3>
                <p className="text-gray-700 mb-3">
                  AQUA V2 está compuesto por 4 servicios independientes que se comunican entre sí:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="font-semibold mb-2">🔧 Backend API (Puerto 3000)</p>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Autenticación de usuarios (Supabase Auth)</li>
                      <li>• Gestión de clientes y deudas</li>
                      <li>• Endpoints REST para frontend</li>
                      <li>• Integración con PYSE (Aguas Cordobesas)</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="font-semibold mb-2">🌐 Frontend (Puerto 3001)</p>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Interfaz de usuario (Next.js + React)</li>
                      <li>• Dashboard de admin y usuarios</li>
                      <li>• Visualización de métricas en tiempo real</li>
                      <li>• Gestión de configuración</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="font-semibold mb-2">📄 Comprobante Worker (Puerto 3010)</p>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Generación de PDFs de comprobantes</li>
                      <li>• Consultas al sistema PYSE</li>
                      <li>• Procesamiento paralelo de deudas</li>
                      <li>• Detección de planes de pago vencidos</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="font-semibold mb-2">💬 WhatsApp Worker (Puerto 3020)</p>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Gestión de sesiones Baileys (Admin)</li>
                      <li>• Envío de mensajes masivos</li>
                      <li>• Verificación de números válidos</li>
                      <li>• Tracking de envíos</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Gestión de usuarios */}
              <div>
                <h3 className="text-xl font-semibold mb-3">👥 Gestión de Usuarios y Planes</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2">📊 Planes disponibles:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="font-semibold text-sm mb-2">🆓 Plan BASE ($35 USD/mes)</p>
                        <ul className="text-xs space-y-1 text-gray-700">
                          <li>• 1000 consultas PYSE/día</li>
                          <li>• 600 consultas PYSE/hora</li>
                          <li>• Acceso a todas las funcionalidades</li>
                          <li>• Sin WhatsApp Cloud API</li>
                        </ul>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <p className="font-semibold text-sm mb-2">⭐ Plan PRO ($60 USD/mes)</p>
                        <ul className="text-xs space-y-1 text-gray-700">
                          <li>• Todo de Plan BASE</li>
                          <li>• WhatsApp Cloud API oficial</li>
                          <li>• 400 mensajes/mes incluidos</li>
                          <li>• Mensajes adicionales: $0.05 c/u</li>
                          <li>• Bot de respuestas automáticas</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-900 text-sm">
                      <strong>⚠️ Límites PYSE:</strong> Ambos planes (BASE y PRO) tienen los mismos límites de consultas PYSE: 1000/día y 600/hora. La diferencia principal del plan PRO es el acceso a WhatsApp Cloud API oficial.
                      <br />
                      <strong>Admin:</strong> Como administrador, tu cuenta no tiene límites de consultas PYSE y usas el sistema Baileys (no Cloud API) para envíos de WhatsApp sin costo.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <p className="font-semibold mb-2">🔧 Cómo cambiar el plan de un usuario:</p>
                    <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
                      <li>Accede a la base de datos en Supabase</li>
                      <li>Tabla <code className="bg-gray-200 px-1 rounded">auth.users</code></li>
                      <li>Busca el usuario por email</li>
                      <li>En <code className="bg-gray-200 px-1 rounded">raw_user_meta_data</code>, cambia <code className="bg-gray-200 px-1 rounded">planType</code> a "BASE" o "PRO"</li>
                      <li>El cambio es inmediato (no requiere reiniciar servicios)</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Flujos de trabajo */}
              <div>
                <h3 className="text-xl font-semibold mb-3">🔄 Flujos de Trabajo Principales</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="font-semibold mb-2">1️⃣ Filtrar Clientes PYSE</p>
                    <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
                      <li>Usuario sube archivo Excel con cuentas</li>
                      <li>Sistema verifica deudas en PYSE (Aguas Cordobesas)</li>
                      <li>Genera 2 archivos:
                        <ul className="list-disc ml-5 mt-1">
                          <li>✅ Aptos: Clientes CON deuda</li>
                          <li>❌ Descartados: Clientes SIN deuda</li>
                        </ul>
                      </li>
                      <li>Usuario descarga los archivos filtrados</li>
                    </ol>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="font-semibold mb-2">2️⃣ Envío de Deudas (Send Debts)</p>
                    <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
                      <li>Usuario sube archivo Excel con clientes</li>
                      <li>Selecciona opciones (INTIMACIÓN, Tipo comprobante, etc.)</li>
                      <li>Sistema verifica números de WhatsApp válidos</li>
                      <li>Genera PDF de comprobante (1-3 páginas según deuda)</li>
                      <li>Envía mensaje + PDF por WhatsApp</li>
                      <li>Usuario ve progreso en tiempo real y descarga reporte</li>
                    </ol>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="font-semibold mb-2">3️⃣ Próximos a Vencer</p>
                    <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
                      <li>Usuario sube archivo Excel con clientes</li>
                      <li>Sistema detecta planes de pago próximos a vencer</li>
                      <li>Genera comprobante con cuota + consumo (si aplica)</li>
                      <li>Envía recordatorio preventivo por WhatsApp</li>
                      <li>Usuario descarga reporte con resultados</li>
                    </ol>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="font-semibold mb-2">4️⃣ Gestión de Base de Datos de Clientes</p>
                    <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
                      <li>Importar clientes desde Excel (22 columnas)</li>
                      <li>Buscar clientes por cuenta, nombre, teléfono</li>
                      <li>Filtrar por tipo de conexión (B/M/SOT/SC)</li>
                      <li>Exportar clientes seleccionados a Excel</li>
                      <li>Editar/eliminar clientes individualmente</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Resolución de problemas */}
              <div>
                <h3 className="text-xl font-semibold mb-3">🔧 Resolución de Problemas Comunes</h3>
                <div className="space-y-3">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="font-semibold mb-2 text-red-900">❌ WhatsApp Cloud API no envía mensajes</p>
                    <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
                      <li>Verifica las credenciales en <code className="bg-red-100 px-1 rounded">/whatsapp/config</code></li>
                      <li>Asegúrate de tener conversaciones disponibles en tu cuota</li>
                      <li>Revisa el estado en el navbar (badge de WhatsApp)</li>
                      <li>Verifica el log de conversaciones en <code className="bg-red-100 px-1 rounded">/admin/conversaciones</code></li>
                    </ol>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="font-semibold mb-2 text-orange-900">⚠️ PYSE no responde / Errores 500</p>
                    <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
                      <li>Verifica horario: PYSE funciona de 8:00 a 16:00 hs (L-V)</li>
                      <li>Si estás fuera de horario, espera a que abra</li>
                      <li>Revisa límites de cuota en el widget PYSE</li>
                      <li>Si superaste el límite diario, espera al día siguiente</li>
                      <li>Verifica en <code className="bg-orange-100 px-1 rounded">/admin/pyse-usage</code> si hay abuso</li>
                    </ol>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="font-semibold mb-2 text-yellow-900">⚠️ PDFs no se generan</p>
                    <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
                      <li>Verifica que el servicio de comprobantes esté activo</li>
                      <li>Si ves "comprobante debe ser seleccionado", el sistema reintenta automáticamente (hasta 3 veces)</li>
                      <li>Si persiste, puede ser problema de PYSE (ver punto anterior)</li>
                    </ol>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="font-semibold mb-2 text-blue-900">🔄 Backend lento o alto uso de recursos</p>
                    <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
                      <li>Revisa las métricas en <code className="bg-blue-100 px-1 rounded">/admin/supabase</code></li>
                      <li>Verifica el uso de storage y database</li>
                      <li>Considera reducir concurrencia si hay muchos procesos paralelos</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Backup y recuperación */}
              <div>
                <h3 className="text-xl font-semibold mb-3">💾 Backup y Recuperación</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="font-semibold mb-3">📁 Archivos importantes:</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      <strong>Sesiones WhatsApp Cloud API:</strong>
                      <br />
                      <code className="text-xs bg-gray-200 px-2 py-1 rounded">Supabase → wa_sessions</code>
                      <br />
                      <span className="text-xs text-gray-600">Gestión automática de sesiones en base de datos.</span>
                    </li>
                    <li>
                      <strong>PDFs temporales:</strong>
                      <br />
                      <code className="text-xs bg-gray-200 px-2 py-1 rounded">API COMPROBANTES/comprobante-worker/pdfTemporales/</code>
                      <br />
                      <span className="text-xs text-gray-600">Se limpian automáticamente después de enviar. No requiere backup.</span>
                    </li>
                    <li>
                      <strong>Base de datos (Supabase):</strong>
                      <br />
                      <span className="text-xs text-gray-600">Backup automático diario de Supabase. Descarga manual desde Dashboard → Database → Backups.</span>
                    </li>
                  </ul>
                </div>

                <Alert className="mt-3 bg-blue-50 border-blue-200">
                  <AlertDescription className="text-blue-900 text-sm">
                    <strong>💡 Tip:</strong> Las conversaciones de WhatsApp se guardan automáticamente en Supabase (tabla wa_conversations).
                  </AlertDescription>
                </Alert>
              </div>

              {/* Buenas prácticas */}
              <div>
                <h3 className="text-xl font-semibold mb-3">✅ Buenas Prácticas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="font-semibold text-sm mb-2">✅ Hacer</p>
                    <ul className="text-xs space-y-1 text-gray-700">
                      <li>• Monitorear uso PYSE en <code className="bg-green-100 px-1 rounded">/admin/pyse-usage</code></li>
                      <li>• Revisar conversaciones en <code className="bg-green-100 px-1 rounded">/admin/conversaciones</code></li>
                      <li>• Validar Excel antes de procesar (usar plantilla)</li>
                      <li>• Enviar mensajes en lotes pequeños (100-200)</li>
                      <li>• Verificar cuota de WhatsApp Cloud API disponible</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <p className="font-semibold text-sm mb-2">❌ Evitar</p>
                    <ul className="text-xs space-y-1 text-gray-700">
                      <li>• Procesar archivos fuera de horario PYSE</li>
                      <li>• Enviar más de 500 WhatsApp simultáneos</li>
                      <li>• Compartir credenciales WhatsApp Cloud API</li>
                      <li>• Exceder límites de cuota PYSE</li>
                      <li>• Enviar mensajes sin verificar estado de ventana 24h</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Enlaces rápidos */}
              <div>
                <h3 className="text-xl font-semibold mb-3">🔗 Enlaces Rápidos del Panel Admin</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="font-semibold text-sm mb-2">🔧 Administración</p>
                    <ul className="text-xs space-y-1">
                      <li>• <code className="bg-blue-100 px-1 rounded">/admin/tutorial</code> - Esta guía</li>
                      <li>• <code className="bg-blue-100 px-1 rounded">/admin/subscriptions</code> - Gestión suscripciones</li>
                      <li>• <code className="bg-blue-100 px-1 rounded">/admin/supabase</code> - Métricas Supabase</li>
                      <li>• <code className="bg-blue-100 px-1 rounded">/admin/conversaciones</code> - Chats WhatsApp</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="font-semibold text-sm mb-2">💼 Operaciones</p>
                    <ul className="text-xs space-y-1">
                      <li>• <code className="bg-green-100 px-1 rounded">/filtro</code> - Filtrar clientes PYSE</li>
                      <li>• <code className="bg-green-100 px-1 rounded">/senddebts</code> - Envío de deudas</li>
                      <li>• <code className="bg-green-100 px-1 rounded">/proximos-vencer</code> - Envío preventivo</li>
                      <li>• <code className="bg-green-100 px-1 rounded">/clientes-database</code> - Base de datos</li>
                      <li>• <code className="bg-green-100 px-1 rounded">/whatsapp/config</code> - Config WhatsApp</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
