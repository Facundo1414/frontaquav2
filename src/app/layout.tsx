import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { GlobalProvider } from '@/app/providers/context/GlobalContext'
import PrivateLayout from './PrivateLayout'
import LayoutWrapper from './LayoutWrapper' // <- Importa el nuevo wrapper

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
        <GlobalProvider>
          <PrivateLayout>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <Toaster position="top-right" />
          </PrivateLayout>
        </GlobalProvider>
      </body>
    </html>
  )
}
