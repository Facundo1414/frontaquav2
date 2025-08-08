'use client'

import { useState } from 'react'
import { useSendDebtsContext } from '@/app/providers/context/SendDebtsContext'
import { ExcelDataTable } from './ExcelDataTable'

export function DynamicExcelTable() {
  const { activeStep, rawData, filteredData } = useSendDebtsContext()

  // Derivar datos según step
  const dataToShow = activeStep === 0
  ? rawData
  : filteredData

  const title = activeStep === 0
  ? 'Datos cargados por el usuario'
  : activeStep === 1
  ? 'Datos filtrados listos para enviar'
  : activeStep === 2
  ? 'Resultado'
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
                  page === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200'
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
