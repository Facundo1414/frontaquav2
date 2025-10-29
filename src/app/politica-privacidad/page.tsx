'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PoliticaPrivacidadPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/home')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>

        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Política de Privacidad</h1>
            <p className="text-muted-foreground">
              Última actualización: 28 de Octubre, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-8 space-y-6">
          {/* Introducción */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              En cumplimiento de la Ley 25.326 de Protección de Datos Personales de Argentina y el Reglamento 
              General de Protección de Datos (GDPR) de la Unión Europea, esta política describe cómo recopilamos, 
              utilizamos y protegemos su información personal.
            </p>
          </section>

          {/* Sección 1 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-green-900">
              1. Datos que Recopilamos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Para proporcionar nuestros servicios, recopilamos los siguientes tipos de datos:
            </p>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Datos del Usuario del Sistema</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>Nombre completo</li>
                  <li>Correo electrónico</li>
                  <li>Contraseña (encriptada)</li>
                  <li>Rol/permisos en el sistema</li>
                  <li>Fecha de registro y último acceso</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Datos de Clientes (para gestión de deudas)</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>Número de unidad funcional (UF)</li>
                  <li>Nombre del titular</li>
                  <li>Domicilio y barrio</li>
                  <li>Número de teléfono (WhatsApp)</li>
                  <li>Información de deuda y comprobantes</li>
                  <li>Estado de verificación y notificación</li>
                </ul>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-2">Datos de Uso del Sistema</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>Registros de actividad (logs)</li>
                  <li>Archivos subidos y procesados</li>
                  <li>Mensajes enviados por WhatsApp</li>
                  <li>Documentos PDF generados</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 2 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-green-900">
              2. Cómo Utilizamos los Datos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Utilizamos los datos recopilados exclusivamente para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Proporcionar y mantener los servicios de gestión de deudas</li>
              <li>Enviar notificaciones automáticas a clientes con deudas pendientes</li>
              <li>Generar reportes y documentos relacionados con cobranzas</li>
              <li>Mejorar y optimizar la funcionalidad del sistema</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
              <li>Prevenir fraudes y garantizar la seguridad del servicio</li>
            </ul>
          </section>

          {/* Sección 3 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-green-900">
              3. Almacenamiento y Seguridad
            </h2>
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Los datos se almacenan de forma segura utilizando:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">🔒 Medidas de Seguridad</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li><strong>Supabase Cloud:</strong> Base de datos PostgreSQL con cifrado en reposo</li>
                  <li><strong>HTTPS/TLS:</strong> Todas las comunicaciones están cifradas</li>
                  <li><strong>Autenticación JWT:</strong> Tokens seguros para acceso al sistema</li>
                  <li><strong>Backups automáticos:</strong> Copias de seguridad diarias</li>
                  <li><strong>Control de acceso:</strong> Permisos basados en roles</li>
                </ul>
              </div>

              <p className="text-gray-700 leading-relaxed">
                <strong>Ubicación de servidores:</strong> Los datos se almacenan en servidores ubicados en la nube 
                (Railway y Supabase), con infraestructura distribuida globalmente pero cumpliendo con normativas 
                de protección de datos.
              </p>
            </div>
          </section>

          {/* Sección 4 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-green-900">
              4. Compartir Datos con Terceros
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>No vendemos ni compartimos sus datos personales con terceros</strong> con fines comerciales. 
              Los datos pueden ser compartidos únicamente en los siguientes casos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Proveedores de servicios:</strong> Supabase (base de datos), Railway (hosting), Meta (WhatsApp Business API)</li>
              <li><strong>Obligaciones legales:</strong> Cuando lo requiera la ley o autoridades competentes</li>
              <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos legales o la seguridad de los usuarios</li>
            </ul>
          </section>

          {/* Sección 5 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-green-900">
              5. Sus Derechos (GDPR y Ley 25.326)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Usted tiene derecho a:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="font-semibold text-green-900">✓ Acceso</p>
                <p className="text-sm text-gray-600">Solicitar una copia de sus datos personales</p>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="font-semibold text-green-900">✓ Rectificación</p>
                <p className="text-sm text-gray-600">Corregir datos inexactos o incompletos</p>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="font-semibold text-green-900">✓ Eliminación</p>
                <p className="text-sm text-gray-600">Solicitar la eliminación de sus datos</p>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="font-semibold text-green-900">✓ Portabilidad</p>
                <p className="text-sm text-gray-600">Recibir sus datos en formato estructurado</p>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="font-semibold text-green-900">✓ Oposición</p>
                <p className="text-sm text-gray-600">Oponerse al procesamiento de sus datos</p>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="font-semibold text-green-900">✓ Limitación</p>
                <p className="text-sm text-gray-600">Restringir el uso de sus datos</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Para ejercer estos derechos, contacte a nuestro Delegado de Protección de Datos (DPO) 
              en: <strong>facu.allende14@gmail.com</strong>
            </p>
          </section>

          {/* Sección 6 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-green-900">
              6. Cookies y Tecnologías de Seguimiento
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Utilizamos las siguientes tecnologías:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Cookies esenciales:</strong> Para mantener su sesión activa (JWT tokens en localStorage)</li>
              <li><strong>LocalStorage/SessionStorage:</strong> Para almacenar preferencias temporales</li>
              <li><strong>No utilizamos:</strong> Cookies de terceros con fines publicitarios o de tracking</li>
            </ul>
          </section>

          {/* Sección 7 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-green-900">
              7. Retención de Datos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Conservamos los datos personales durante el tiempo necesario para cumplir con los fines descritos 
              en esta política o según lo requiera la ley. Los datos de clientes se mantienen durante el período 
              de gestión de deuda más 5 años adicionales por obligaciones legales contables y fiscales.
            </p>
          </section>

          {/* Sección 8 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-green-900">
              8. Transferencias Internacionales
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Algunos de nuestros proveedores de servicios pueden estar ubicados fuera de Argentina. 
              En estos casos, garantizamos que se aplican medidas de seguridad equivalentes a las requeridas 
              por la legislación argentina y europea (cláusulas contractuales estándar).
            </p>
          </section>

          {/* Sección 9 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-green-900">
              9. Menores de Edad
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Este servicio está dirigido exclusivamente a usuarios mayores de 18 años. No recopilamos 
              intencionalmente datos de menores de edad.
            </p>
          </section>

          {/* Sección 10 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-green-900">
              10. Cambios en esta Política
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta política periódicamente. Los cambios significativos serán notificados 
              mediante correo electrónico o un aviso destacado en el sistema. Le recomendamos revisar esta 
              página regularmente.
            </p>
          </section>

          {/* Sección 11 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-green-900">
              11. Contacto y Reclamos
            </h2>
            <div className="bg-green-50 p-5 rounded-lg border border-green-200">
              <p className="text-gray-700 mb-3">
                Para consultas sobre privacidad o para ejercer sus derechos:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Email del DPO:</strong> facu.allende14@gmail.com
                </p>
                <p className="text-gray-700">
                  <strong>Teléfono:</strong> +54 351 3479404
                </p>
                <p className="text-gray-700">
                  <strong>Dirección:</strong> Córdoba Capital, Argentina
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                También puede presentar un reclamo ante la <strong>Agencia de Acceso a la Información Pública (AAIP)</strong> 
                de Argentina si considera que se han vulnerado sus derechos de protección de datos.
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-6 border-t mt-8">
            <p className="text-sm text-gray-500 text-center">
              © 2025 Aqua - Todos los derechos reservados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
