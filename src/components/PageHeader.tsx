'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  breadcrumbs?: BreadcrumbItem[]
  showBackButton?: boolean
  backHref?: string
  action?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  breadcrumbs,
  showBackButton = true,
  backHref = '/home',
  action,
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    router.push(backHref)
  }

  const handleBreadcrumbClick = (href?: string) => {
    if (href) {
      router.push(href)
    }
  }

  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <button
            onClick={() => router.push('/home')}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </button>
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              {item.href ? (
                <button
                  onClick={() => handleBreadcrumbClick(item.href)}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Header Content */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Back Button */}
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="shrink-0 -ml-2 text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-xl h-10 w-10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}

          {/* Icon */}
          {Icon && (
            <div className="shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/50">
              <Icon className="w-5 h-5 text-slate-600" />
            </div>
          )}

          {/* Title & Description */}
          <div>
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente simplificado para páginas que solo necesitan título y volver
export function SimplePageHeader({
  title,
  backHref = '/home',
}: {
  title: string
  backHref?: string
}) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-3 mb-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push(backHref)}
        className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-xl h-9 w-9"
      >
        <ArrowLeft className="w-4 h-4" />
      </Button>
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
    </div>
  )
}
