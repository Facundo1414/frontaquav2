// src/middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que no requieren autenticación.
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/api',
  '/favicon.ico',
  '/_next',
  '/images',
  '/fonts',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir rutas públicas
  const isPublic = PUBLIC_PATHS.some((publicPath) =>
    pathname.startsWith(publicPath)
  )
  if (isPublic) {
    return NextResponse.next()
  }

  // NO redirigir aquí, porque token está en localStorage, no accesible en middleware
  // Solo dejar pasar y que el cliente valide sesión y redirija si no está autenticado

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|register|api|images|fonts).*)',
  ],
}
