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
  const arrayBuffer = await blob.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  // Leer con header: 1 para obtener array de arrays (filas)
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

  // Mapear cada fila según el índice a las claves esperadas
  const mapped = rows.map(row => ({
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

  return mapped
}
