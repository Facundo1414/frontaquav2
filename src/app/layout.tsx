import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { GlobalProvider } from '@/app/providers/context/GlobalContext'
import { WhatsAppUnifiedProvider } from '@/app/providers/context/WhatsAppUnifiedContext'
import { SubscriptionProvider } from '@/context/SubscriptionContext'
import { WebSocketProvider } from '@/components/WebSocketProvider'
import { AdminBroadcastListener } from '@/components/AdminBroadcastListener'
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
            <WhatsAppUnifiedProvider>
              <SubscriptionProvider>
                <WebSocketProvider>
                  {/* Listener global de notificaciones del admin */}
                  <AdminBroadcastListener />
                  {/* PrivateLayout decidirá si aplica wrappers (providers) según la ruta */}
                  <PrivateLayout>
                    {children}
                  </PrivateLayout>
                </WebSocketProvider>
              </SubscriptionProvider>
            </WhatsAppUnifiedProvider>
            {/* El Toaster queda global para que también funcione en /login */}
            <Toaster position="top-right" />
          </GlobalProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
