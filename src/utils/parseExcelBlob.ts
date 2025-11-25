// parseExcel.ts
import * as XLSX from 'xlsx'

export const parseExcelBlob = async (blob: Blob): Promise<any[]> => {
  const arrayBuffer = await blob.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet)
}

/**
 * Lee el Excel como arrays y mapea cada fila a un objeto con claves definidas
 */
export const parseExcelBlobWithIndexMapping = async (blob: Blob): Promise<any[]> => {
  console.log('🔍 Blob recibido en parser:', {
    size: blob.size,
    type: blob.type,
  })
  
  const arrayBuffer = await blob.arrayBuffer()
  console.log('📦 ArrayBuffer creado:', arrayBuffer.byteLength, 'bytes')
  
  // Debug: ver los primeros bytes del archivo para verificar que es un Excel válido
  const firstBytes = new Uint8Array(arrayBuffer.slice(0, 4))
  const hex = Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join(' ')
  console.log('🔬 Primeros 4 bytes (hex):', hex, '(Excel debe empezar con 50 4b 03 04)')
  
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  console.log('📚 Workbook leído:', {
    sheetNames: workbook.SheetNames,
    totalSheets: workbook.SheetNames.length,
  })
  
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  console.log('📄 Sheet seleccionado:', workbook.SheetNames[0])
  console.log('📊 Sheet ref:', sheet['!ref'])
  
  // Leer con header: 1 para obtener array de arrays (filas)
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

  console.log('📋 Total de filas en Excel (con header):', rows.length)
  console.log('🔍 Primera fila (header):', rows[0])
  console.log('🔍 Segunda fila (datos):', rows[1])

  // Saltar la primera fila (header) y filtrar filas vacías
  const dataRows = rows.slice(1).filter(row => {
    // Filtrar filas completamente vacías o con solo el primer valor
    return row && row.length > 1 && row[0] !== undefined && row[0] !== ''
  })

  console.log('📊 Filas de datos después de filtrar:', dataRows.length)

  // Mapear cada fila según el índice a las claves esperadas
  const mapped = dataRows.map(row => ({
    unidad: row[0] ?? '',
    tel_uni: row[1] ?? '',
    tel_clien: row[2] ?? '',
    tipo_plan: row[3] ?? '',
    plan_num: row[4] ?? '',
    cod_mot_gen: row[5] ?? '',
    Criterios: row[6] ?? '',
    contrato: row[7] ?? '',
    entrega: row[8] ?? '',
    situ_actual: row[9] ?? '',
    situ_uni: row[10] ?? '',
    cant_venci: row[11] ?? '',
    cant_cuot: row[12] ?? '',
    Cliente_01: row[13] ?? '',
    EjecutivoCta: row[14] ?? '',
  }))

  console.log('✅ Datos mapeados:', mapped.length)
  console.log('🔍 Primer registro mapeado:', mapped[0])

  return mapped
}
