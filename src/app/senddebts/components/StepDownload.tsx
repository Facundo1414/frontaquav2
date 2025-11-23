'use client'
import { useSendDebtsContext } from '@/app/providers/context/SendDebtsContext'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getFileByName, listResultBackups } from '@/lib/api'
import { Loader2, Home, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function StepDownload() {
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
    overQuotaCount,
  } = useSendDebtsContext()  

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
        // Filtrar solo archivos de los últimos 5 minutos
        const now = Date.now()
        const recentFiles = files.filter(name => {
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
      return
    }
    setLoadingResults(true)

    const url = window.URL.createObjectURL(processedFile)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resultado-procesamiento.xlsx'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)

    setLoadingResults(false)
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
      className="w-full h-full flex justify-center items-center"
    >
      <div className="max-w-5xl w-full px-4 space-y-6">
        
        {/* 💰 Alerta de sobrecargo si excedió cuota */}
        {overQuotaCount > 0 && (
          <Alert variant="destructive" className="border-amber-500 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 font-semibold">
              Sobrecargo detectado
            </AlertTitle>
            <AlertDescription className="text-amber-700">
              Enviaste <strong>{overQuotaCount} mensajes</strong> por encima de tu cuota diaria (300).
              Se aplicará un cargo adicional de <strong>${overQuotaCount * 30}</strong> en tu próxima factura.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Bloque Resultados */}
          <div className="flex flex-col justify-between h-full rounded-lg">
        <div className="space-y-3">
            <h3 className="text-lg font-semibold">Resultados del proceso</h3>
            <p className="text-sm text-muted-foreground">
            Acá podés descargar el archivo con todos los clientes a los que se les envió el mensaje.
            En la columna <strong>motivo</strong> se listan aquellos que no pudieron recibirlo y la razón correspondiente.
            </p>
        </div>
        {processedFile ? (
          <Button
              onClick={handleDownloadResults}
              disabled={!processedFile || loadingResults}
              className="w-auto h-10 mt-4"
          >
              {loadingResults ? (
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Descargando...
              </>
              ) : (
              'Descargar Excel con resultados'
              )}
          </Button>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-amber-700">No se recibió el archivo de resultados. Podés descargar un respaldo:</p>
            {loadingBackups ? (
              <p className="text-xs text-muted-foreground">Buscando respaldos...</p>
            ) : backupFiles.length > 0 ? (
              <ul className="list-disc list-inside text-sm">
                {backupFiles.map((name) => (
                  <li key={name}>
                    <button
                      className="underline"
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
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No hay respaldos disponibles para este usuario.</p>
            )}
          </div>
        )}
        </div>


        {/* Bloque Sin WhatsApp */}
        <div className="flex flex-col justify-between h-full  rounded-lg">
        <div className="space-y-3">
            <h3 className="text-lg font-semibold">Clientes sin WhatsApp</h3>
            <p className="text-sm text-muted-foreground">
            Acá podés descargar todos los clientes que no tienen WhatsApp y que fueron filtrados en el primer paso.
            </p>
        </div>
        <Button
            onClick={handleDownloadNotWhatsApp}
            disabled={!notWhatsappData || loadingNotWhats}
            className="w-auto h-10 mt-4"
        >
            {loadingNotWhats ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Descargando...
            </>
            ) : (
            'Descargar Excel sin WhatsApp'
            )}
        </Button>
        </div>
      </div>

      {/* 🔹 Botón Volver a Home */}
      <div className="flex justify-center mt-6">
        <Button variant="outline" onClick={handleResetAndGoHome} className='bg-green-400'>
          <Home className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    </div>
    </motion.div>
  )
}
