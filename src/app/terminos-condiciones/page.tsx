'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TerminosCondicionesPage() {
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
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Términos y Condiciones</h1>
            <p className="text-muted-foreground">
              Última actualización: 28 de Octubre, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-8 space-y-6">
          {/* Sección 1 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-blue-900">
              1. Aceptación de los Términos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Al acceder y utilizar esta plataforma, usted acepta estar sujeto a estos términos y condiciones de uso. 
              Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro sistema.
            </p>
          </section>

          {/* Sección 2 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-blue-900">
              2. Descripción del Servicio
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Esta plataforma proporciona herramientas para la gestión y notificación de deudas de servicios públicos, incluyendo:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Envío automatizado de notificaciones de deuda por WhatsApp</li>
              <li>Filtrado y clasificación de clientes para procesos PYSE</li>
              <li>Generación de documentos PDF personalizados</li>
              <li>Gestión de base de datos de clientes</li>
              <li>Seguimiento de cuotas próximas a vencer</li>
            </ul>
          </section>

          {/* Sección 3 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-blue-900">
              3. Uso Autorizado
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              El usuario se compromete a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Utilizar el sistema únicamente para fines legítimos de gestión de cobranzas</li>
              <li>No compartir sus credenciales de acceso con terceros</li>
              <li>Mantener la confidencialidad de la información de los clientes</li>
              <li>Cumplir con las leyes de protección de datos personales vigentes</li>
              <li>No utilizar el sistema para enviar spam o mensajes no relacionados con el servicio</li>
            </ul>
          </section>

          {/* Sección 4 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-blue-900">
              4. Responsabilidades del Usuario
            </h2>
            <p className="text-gray-700 leading-relaxed">
              El usuario es responsable de la exactitud de los datos ingresados en el sistema y de las comunicaciones 
              enviadas a los clientes. La empresa proveedora del servicio no se hace responsable por errores en los 
              datos proporcionados por el usuario ni por el uso indebido del sistema.
            </p>
          </section>

          {/* Sección 5 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-blue-900">
              5. Privacidad y Protección de Datos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              El tratamiento de datos personales se rige por nuestra{' '}
              <button
                onClick={() => router.push('/politica-privacidad')}
                className="text-blue-600 hover:underline font-medium"
              >
                Política de Privacidad
              </button>
              . Los datos de los clientes se almacenan de forma segura y se utilizan exclusivamente para los 
              fines del servicio.
            </p>
          </section>

          {/* Sección 6 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-blue-900">
              6. Limitaciones de Responsabilidad
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              La plataforma se proporciona &quot;tal cual&quot; y &quot;según disponibilidad&quot;. No garantizamos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Disponibilidad ininterrumpida del servicio</li>
              <li>Ausencia de errores o bugs en el sistema</li>
              <li>Resultados específicos en los procesos de cobranza</li>
              <li>Compatibilidad con todos los dispositivos o navegadores</li>
            </ul>
          </section>

          {/* Sección 7 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-blue-900">
              7. Modificaciones del Servicio
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del servicio en 
              cualquier momento, sin previo aviso. También podemos actualizar estos términos periódicamente. 
              El uso continuado del servicio después de cualquier cambio constituye la aceptación de los nuevos términos.
            </p>
          </section>

          {/* Sección 8 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-blue-900">
              8. Propiedad Intelectual
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Todo el contenido, diseño, código fuente y funcionalidades del sistema son propiedad exclusiva de 
              la empresa proveedora. Queda prohibida la reproducción, distribución o modificación sin autorización expresa.
            </p>
          </section>

          {/* Sección 9 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-blue-900">
              9. Terminación del Servicio
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos suspender o terminar su acceso al servicio si detectamos violaciones a estos términos o 
              uso fraudulento del sistema. El usuario puede cancelar su cuenta en cualquier momento contactando 
              con soporte.
            </p>
          </section>

          {/* Sección 10 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-blue-900">
              10. Legislación Aplicable
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa será resuelta 
              en los tribunales competentes de la Ciudad de Córdoba, Argentina.
            </p>
          </section>

          {/* Sección 11 */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-blue-900">
              11. Contacto
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Para preguntas sobre estos términos y condiciones, puede contactarnos a través de:
            </p>
            <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-700">
                <strong>Email:</strong> facu.allende14@gmail.com
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Teléfono:</strong> +54 351 3479404
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
