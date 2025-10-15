'use client'

import { useState } from 'react'
import { useProximosVencerContext } from '@/app/providers/context/ProximosVencerContext'
import { ExcelDataTable } from '../../senddebts/components/ExcelDataTable'

export function DynamicExcelTableProximosVencer() {
  const { activeStep, rawData, filteredData, processedData } = useProximosVencerContext()

  // Derivar datos según step
  const dataToShow = activeStep === 0
    ? rawData
    : activeStep === 1
    ? filteredData
    : activeStep === 2
    ? processedData
    : []

  const title = activeStep === 0
    ? 'Datos cargados por el usuario'
    : activeStep === 1
    ? 'Usuarios con WhatsApp próximos a vencer'
    : activeStep === 2
    ? 'Resultado del envío'
    : 'Sin datos para mostrar'

  // ** PAGINACIÓN **
  const rowsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(dataToShow.length / rowsPerPage)

  // Índices para slice
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage

  // Datos paginados
  const paginatedData = dataToShow.slice(startIndex, endIndex)

  // Funciones para cambiar página
  const goToPrevPage = () => setCurrentPage(p => Math.max(p - 1, 1))
  const goToNextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages))
  const goToPage = (page: number) => setCurrentPage(Math.min(Math.max(page, 1), totalPages))

  return (
    <div className="">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      <ExcelDataTable data={paginatedData} />

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-3">
          <button
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            onClick={goToPrevPage}
            disabled={currentPage === 1}
          >
            Anterior
          </button>

          {/* Mostrar botones de página */}
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1
            return (
              <button
                key={page}
                className={`px-3 py-1 rounded ${
                  page === currentPage ? 'bg-orange-600 text-white' : 'bg-gray-200'
                }`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            )
          })}

          <button
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}