'use client'

import { ReactNode, useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/navbar/navbar'
import Footer from '@/components/footer/Footer'
import { cn } from '@/lib/utils'

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayedChildren, setDisplayedChildren] = useState(children)
  const previousPathname = useRef(pathname)

  const noLayoutPaths = ['/login', '/register']
  const hideLayout = noLayoutPaths.some(path => pathname.startsWith(path))

  // Páginas que necesitan ancho completo sin padding
  const fullWidthNoPaddingPaths = ['/conversaciones']
  const isFullWidthNoPadding = fullWidthNoPaddingPaths.some(path => pathname.startsWith(path))

  // Páginas que necesitan ancho completo para tablas
  const fullWidthPaths = ['/clientes-database', '/senddebts', '/proximos-vencer']
  const isFullWidth = fullWidthPaths.some(path => pathname.startsWith(path))

  // Transición suave entre páginas
  useEffect(() => {
    // Solo animar si cambió la ruta
    if (previousPathname.current !== pathname) {
      setIsTransitioning(true)
      
      // Pequeño delay para el fade out
      const fadeOutTimeout = setTimeout(() => {
        setDisplayedChildren(children)
        // Otro pequeño delay para el fade in
        requestAnimationFrame(() => {
          setIsTransitioning(false)
        })
      }, 120)
      
      previousPathname.current = pathname
      return () => clearTimeout(fadeOutTimeout)
    } else {
      // Si no cambió la ruta, actualizar children sin transición
      setDisplayedChildren(children)
    }
  }, [pathname, children])

  return (
    <>
      {!hideLayout && <Navbar />}
      
      {isFullWidthNoPadding ? (
        <main 
          className={cn(
            "flex-grow transition-all duration-150 ease-out",
            isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
          )}
        >
          {displayedChildren}
        </main>
      ) : (
        <main 
          className={cn(
            hideLayout ? '' : 'flex-grow px-4 sm:px-6 md:px-10 py-4',
            "transition-all duration-150 ease-out",
            isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
          )}
        >
          <div className={hideLayout ? '' : isFullWidth ? 'max-w-full mx-auto' : 'max-w-7xl mx-auto'}>
            {displayedChildren}
          </div>
        </main>
      )}

      {!hideLayout && !isFullWidthNoPadding && <Footer />}
    </>
  )
}
