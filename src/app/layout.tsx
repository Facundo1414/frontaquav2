import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { GlobalProvider } from '@/app/providers/context/GlobalContext'
import { WebSocketProvider } from '@/components/WebSocketProvider'
import { QueryProvider } from '@/lib/react-query'
import PrivateLayout from './PrivateLayout'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Aqua',
  description: 'Gestión de clientes con WhatsApp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <QueryProvider>
          <GlobalProvider>
            <WebSocketProvider>
              {/* PrivateLayout decidirá si aplica wrappers (providers) según la ruta */}
              <PrivateLayout>
                {children}
              </PrivateLayout>
            </WebSocketProvider>
            {/* El Toaster queda global para que también funcione en /login */}
            <Toaster position="top-right" />
          </GlobalProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
