'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/navbar/navbar'
import Footer from '@/components/footer/Footer'

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const noLayoutPaths = ['/login', '/register']
  const hideLayout = noLayoutPaths.some(path => pathname.startsWith(path))

  // Páginas que necesitan ancho completo para tablas
  const fullWidthPaths = ['/clientes-database', '/senddebts', '/proximos-vencer']
  const isFullWidth = fullWidthPaths.some(path => pathname.startsWith(path))

  return (
    <>
      {!hideLayout && <Navbar />}
      
      <main className={hideLayout ? '' : 'flex-grow px-4 sm:px-6 md:px-10 py-2'}>
        <div className={hideLayout ? '' : isFullWidth ? 'max-w-full mx-auto' : 'max-w-7xl mx-auto'}>
          {children}
        </div>
      </main>

      {!hideLayout && <Footer />}
    </>
  )
}
