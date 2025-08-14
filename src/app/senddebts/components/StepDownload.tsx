'use client'
import { useSendDebtsContext } from '@/app/providers/context/SendDebtsContext'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { getFileByName } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Home } from 'lucide-react'

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
  } = useSendDebtsContext()  

  const [loadingResults, setLoadingResults] = useState(false)
  const [loadingNotWhats, setLoadingNotWhats] = useState(false)

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-3xl w-full px-4">
        
        {/* Bloque Resultados */}
        <div className="flex flex-col justify-between h-fullrounded-lg">
        <div className="space-y-3">
            <h3 className="text-lg font-semibold">Resultados del proceso</h3>
            <p className="text-sm text-muted-foreground">
            Acá podés descargar el archivo con todos los clientes a los que se les envió el mensaje.
            En la columna <strong>motivo</strong> se listan aquellos que no pudieron recibirlo y la razón correspondiente.
            </p>
        </div>
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
      <div className="flex flex-col justify-top h-full  rounded-lg">
        <Button variant="outline" onClick={handleResetAndGoHome} className='bg-green-400'>
          <Home className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  )
}
