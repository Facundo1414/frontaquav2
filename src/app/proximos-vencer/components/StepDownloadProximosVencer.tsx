'use client'
import { useProximosVencerContext } from '@/app/providers/context/ProximosVencerContext'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { getFileByName, listResultBackups } from '@/lib/api'
import { Loader2, Home, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function StepDownloadProximosVencer() {
  const router = useRouter()
  const {
    processedFile,
    notWhatsappData,
    setRawData,
    setProcessedData,
    setFilteredData,
    setActiveStep,
    setFileNameFiltered,
    setProcessedFile,
    setNotWhatsappData,
  } = useProximosVencerContext()  

  const [loadingResults, setLoadingResults] = useState(false)
  const [loadingNotWhats, setLoadingNotWhats] = useState(false)
  const [backupFiles, setBackupFiles] = useState<string[]>([])
  const [loadingBackups, setLoadingBackups] = useState(false)

  useEffect(() => {
    const fetchBackups = async () => {
      if (processedFile) return
      setLoadingBackups(true)
      try {
        const files = await listResultBackups()
        // Filtrar solo archivos de próximos a vencer de los últimos 5 minutos
        const now = Date.now()
        const recentFiles = files.filter(name => {
          const isProximosVencer = name.includes('proximos-vencer') || name.includes('recordatorios')
          if (!isProximosVencer) return false
          
          const match = name.match(/_resultado_(\d+)\.xlsx$/) || name.match(/-(\d+)\.xlsx$/)
          if (match) {
            const timestamp = parseInt(match[1])
            return (now - timestamp) < 300000 // 5 minutos
          }
          return false
        })
        setBackupFiles(recentFiles)
      } catch (e) {
        // no-op
      } finally {
        setLoadingBackups(false)
      }
    }
    fetchBackups()
  }, [processedFile])

  const handleDownloadResults = () => {
    if (!processedFile) {
      console.warn('No hay archivo procesado para descargar')
      return
    }
    
    setLoadingResults(true)
    
    try {
      console.log('Iniciando descarga de resultados próximos a vencer')
      console.log('Tipo de archivo:', processedFile.type)
      console.log('Tamaño del archivo:', processedFile.size, 'bytes')
      
      // Verificar que el archivo no esté vacío
      if (processedFile.size === 0) {
        console.error('El archivo está vacío')
        alert('Error: El archivo de resultados está vacío')
        setLoadingResults(false)
        return
      }

      const url = window.URL.createObjectURL(processedFile)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resultado-proximos-vencer.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      
      console.log('Descarga completada exitosamente')
    } catch (error) {
      console.error('Error durante la descarga:', error)
      alert('Error al descargar el archivo de resultados')
    } finally {
      setLoadingResults(false)
    }
  }

  const handleDownloadNotWhatsApp = async () => {
    if (!notWhatsappData) {
      return
    }
    setLoadingNotWhats(true)

    try {
      const blob = await getFileByName(notWhatsappData)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'sin-whatsapp.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingNotWhats(false)
    }
  }

    const handleResetAndGoHome = () => {
    setRawData([])
    setProcessedData([])
    setFilteredData([])
    setFileNameFiltered("")
    setProcessedFile(null)
    setNotWhatsappData("")
    router.push('/home')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Bloque Resultados */}
        <div className="border rounded-lg p-4 space-y-3">
          <div>
            <h3 className="text-base font-semibold">Resultados del proceso</h3>
            <p className="text-sm text-muted-foreground">
              Descarga el archivo con los resultados. La columna <strong>motivo</strong> indica los que fallaron.
            </p>
          </div>
        {processedFile ? (
          <Button
              onClick={handleDownloadResults}
              disabled={loadingResults}
              className="w-full"
          >
              {loadingResults ? (
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Descargando...
              </>
              ) : (
              'Descargar resultados'
              )}
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">No hay archivo procesado. Intentando recuperar respaldos...</p>
            {loadingBackups ? (
              <p className="text-xs text-muted-foreground">Buscando respaldos...</p>
            ) : backupFiles.length > 0 ? (
              <div className="flex flex-col gap-2">
                {backupFiles.map((name) => (
                  <Button
                    key={name}
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const blob = await getFileByName(name)
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = name
                        document.body.appendChild(a)
                        a.click()
                        a.remove()
                        window.URL.revokeObjectURL(url)
                      } catch (e) {}
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {name}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No hay respaldos disponibles.</p>
            )}
          </div>
        )}
        </div>


        {/* Bloque Sin WhatsApp */}
        <div className="border rounded-lg p-4 space-y-3">
          <div>
            <h3 className="text-base font-semibold">Clientes sin WhatsApp</h3>
            <p className="text-sm text-muted-foreground">
              Descarga los clientes filtrados sin WhatsApp del primer paso.
            </p>
          </div>
          <Button
              onClick={handleDownloadNotWhatsApp}
              disabled={!notWhatsappData || loadingNotWhats}
              className="w-full"
          >
              {loadingNotWhats ? (
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Descargando...
              </>
              ) : (
              'Descargar sin WhatsApp'
              )}
          </Button>
        </div>
      </div>
      
      {/* Botón Volver a Home */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={handleResetAndGoHome}>
          <Home className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    </motion.div>
  )
}
