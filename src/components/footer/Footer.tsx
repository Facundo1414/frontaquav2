'use client'

import { Phone } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white p-6 mt-8 w-full">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-center sm:text-left">&copy; 2025 AQUA. Desarrollado Por Facundo Allende</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="https://wa.me/3513479404"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-teal-600 p-2 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            aria-label="Contactar soporte por WhatsApp"
          >
            <Phone className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-300">
            Para resolver problemas, contáctese con soporte
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-300 text-center sm:text-right">
            <Link href="/terminos-condiciones" className="hover:text-white underline">
              Términos y condiciones
            </Link>
            {' | '}
            <Link href="/politica-privacidad" className="hover:text-white underline">
              Política de privacidad
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
