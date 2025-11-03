// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que no requieren autenticación.
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api",
  "/favicon.ico",
  "/_next",
  "/images",
  "/fonts",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Permitir rutas públicas
  const isPublic = PUBLIC_PATHS.some((publicPath) =>
    pathname.startsWith(publicPath)
  );
  if (isPublic) {
    return response;
  }

  // 🔒 Security: Validate authentication token from cookie
  const token = request.cookies.get("auth-token")?.value;

  // Si no hay token en cookie, redirigir a login
  // Nota: El token principal está en localStorage (solo accesible en cliente)
  // Esta validación es adicional para proteger rutas server-side
  if (!token && !pathname.startsWith("/login")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 🔒 Security: Add additional security headers to response
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|register|api|images|fonts).*)",
  ],
};
