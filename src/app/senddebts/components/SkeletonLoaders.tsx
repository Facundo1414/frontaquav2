// 🎨 Skeleton Loaders personalizados para cada paso de /senddebts

import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Componente Skeleton simple
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
)

export function SkeletonUploadFile() {
  return (
    <div className="w-full h-full flex flex-col space-y-6">
      {/* Zona de drop */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl bg-blue-50 border-blue-200">
          <Skeleton className="h-10 w-10 rounded-full mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Botones */}
      <div className="mt-auto flex items-center gap-4 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

export function SkeletonVerifyWhatsApp() {
  return (
    <div className="w-full h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 border">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-10 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Botones */}
      <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t">
        <Skeleton className="h-10 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonSend() {
  return (
    <div className="w-full h-full flex flex-col space-y-6">
      {/* Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div>
                <Skeleton className="h-6 w-48 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg p-3 border">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contenido */}
      <div className="flex-1 space-y-4">
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-32 w-full rounded" />
        </div>
      </div>

      {/* Botones */}
      <div className="mt-auto flex items-center gap-4 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

export function SkeletonDownload() {
  return (
    <div className="w-full h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* Cards de descarga */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botones */}
      <div className="mt-auto flex items-center gap-4 pt-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  )
}
