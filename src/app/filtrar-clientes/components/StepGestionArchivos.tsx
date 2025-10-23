'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, RefreshCw, Trash2 } from "lucide-react"
import { getAccessToken } from "@/utils/authToken"

interface UserFile {
  name: string
  size: number
  createdAt: string
}

export function StepGestionArchivos() {
  const [files, setFiles] = useState<UserFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadFiles = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = getAccessToken()
      const response = await fetch('/api/comprobante-filtro/files', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al cargar archivos')
      }

      const data = await response.json()
      setFiles(data)
    } catch (err: any) {
      setError(err.message)
      console.error('Error loading files:', err)
    } finally {
      setLoading(false)
    }
  }

  const downloadFile = async (fileName: string) => {
    try {
      const token = getAccessToken()
      const response = await fetch(`/api/comprobante-filtro/files/${fileName}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al descargar archivo')
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error('Error downloading file:', err)
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Mis Archivos
          </CardTitle>
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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {loading && files.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">Cargando archivos...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">No hay archivos disponibles</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{formatDate(file.createdAt)}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(file.name)}
                  className="ml-4"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Descargar
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
