'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, FileText, RefreshCw, AlertCircle, Search, Filter } from "lucide-react"
import { getUserFiles, downloadUserFile } from "@/lib/api/comprobanteApi"

interface UserFile {
  name: string
  size: number
  createdAt: string
}

export function RecuperarArchivos() {
  const [files, setFiles] = useState<UserFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filtrar y buscar archivos
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      // Filtro por búsqueda
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Filtro por tipo
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
      const matchesType = fileTypeFilter === 'all' || fileExtension === fileTypeFilter
      
      return matchesSearch && matchesType
    })
  }, [files, searchTerm, fileTypeFilter])

  // Paginación
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedFiles = filteredFiles.slice(startIndex, endIndex)

  // Obtener tipos de archivo únicos
  const fileTypes = useMemo(() => {
    const types = new Set(files.map(file => file.name.split('.').pop()?.toLowerCase() || ''))
    return Array.from(types).sort()
  }, [files])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, fileTypeFilter])

  const loadFiles = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getUserFiles()
      setFiles(data)
    } catch (err: any) {
      setError(err.message || 'Error al cargar archivos')
      console.error('Error al cargar archivos:', err)
    } finally {
      setLoading(false)
    }
  }

  const downloadFile = async (fileName: string) => {
    try {
      const blob = await downloadUserFile(fileName)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error('Error al descargar archivo:', err)
      alert('Error al descargar archivo: ' + err.message)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  useEffect(() => {
    loadFiles()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6" />
                Recuperar Archivos de Respaldo
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Archivos guardados durante la ejecución de Send Debts o procesos anteriores
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadFiles}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">¿Qué archivos encontraré aquí?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Respaldos de universos cargados durante Send Debts</li>
                  <li>Archivos guardados cuando un proceso se interrumpe</li>
                  <li>Backups automáticos de datos importantes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Filtros y Búsqueda */}
          {files.length > 0 && (
            <div className="mb-6 space-y-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre de archivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro por tipo */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 font-medium">Tipo:</span>
                <Button
                  variant={fileTypeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileTypeFilter('all')}
                >
                  Todos ({files.length})
                </Button>
                {fileTypes.map(type => {
                  const count = files.filter(f => f.name.endsWith(`.${type}`)).length
                  return (
                    <Button
                      key={type}
                      variant={fileTypeFilter === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFileTypeFilter(type)}
                    >
                      .{type} ({count})
                    </Button>
                  )
                })}
              </div>

              {/* Resultados */}
              <div className="text-sm text-gray-600">
                Mostrando {paginatedFiles.length} de {filteredFiles.length} archivo{filteredFiles.length !== 1 ? 's' : ''}
                {searchTerm && ` (filtrado por "${searchTerm}")`}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {loading && files.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 text-lg">Cargando archivos...</p>
            </div>
          ) : filteredFiles.length === 0 && files.length > 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 text-lg font-medium mb-1">No se encontraron archivos</p>
              <p className="text-gray-500 text-sm">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 text-lg font-medium mb-1">No hay archivos disponibles</p>
              <p className="text-gray-500 text-sm">
                Los archivos de respaldo aparecerán aquí cuando se ejecute Send Debts
              </p>
            </div>
          ) : (
            <>
              {/* Lista de archivos */}
              <div className="space-y-3">
                {paginatedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => downloadFile(file.name)}
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      // Mostrar solo algunas páginas alrededor de la actual
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="text-gray-400">...</span>
                      }
                      return null
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
