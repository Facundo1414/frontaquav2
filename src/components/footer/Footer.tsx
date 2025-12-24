'use client'

import { Phone, Mail, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          {/* Brand Section */}
          <div className="flex items-center gap-3">
            <img src="/logoWater.png" alt="Logo" className="h-8 opacity-80" />
            <div>
              <p className="font-semibold text-white">AQUA</p>
              <p className="text-xs text-slate-400">Sistema de gestión de clientes</p>
            </div>
          </div>

          {/* Support Section */}
          <div className="flex items-center gap-4">
            <Link
              href="https://wa.me/3513479404?text=Hola%2C%20me%20contacto%20con%20soporte%20de%20AQUA%20para%20resolver%20un%20problema."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-200 text-sm border border-slate-700"
              aria-label="Contactar soporte por WhatsApp"
            >
              <Phone className="w-4 h-4" />
              <span>Soporte</span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </Link>
          </div>

          {/* Links Section */}
          <div className="flex items-center gap-4 text-sm">
            <Link href="/terminos-condiciones" className="hover:text-white transition-colors duration-200">
              Términos
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/politica-privacidad" className="hover:text-white transition-colors duration-200">
              Privacidad
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mt-6 pt-6">
          <p className="text-center text-xs text-slate-500">
            © 2025 AQUA — Desarrollado por Facundo Allende
          </p>
        </div>
      </div>
    </footer>
  )
}
