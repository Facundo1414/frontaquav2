import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

type ExcelRow = {
  unidad: string
  tel_uni: string
  tel_clien: string
  tipo_plan: string
  plan_num: string
  cod_mot_gen: string
  Criterios: string
  contrato: string
  entrega: string
  situ_actual: string
  situ_uni: string
  cant_venci: string
  cant_cuot: string
  Cliente_01: string
  EjecutivoCta: string
}


export function ExcelDataTable({ data }: { data: ExcelRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Unidad</TableHead>
          <TableHead>Tel Uni</TableHead>
          <TableHead>Tel Cliente</TableHead>
          <TableHead>Tipo Plan</TableHead>
          <TableHead>Plan Num</TableHead>
          <TableHead>Cod Mot Gen</TableHead>
          <TableHead>Criterios</TableHead>
          <TableHead>Contrato</TableHead>
          <TableHead>Entrega</TableHead>
          <TableHead>Situ Actual</TableHead>
          <TableHead>Situ Uni</TableHead>
          <TableHead>Cant Venci</TableHead>
          <TableHead>Cant Cuot</TableHead>
          <TableHead>Cliente 01</TableHead>
          <TableHead>Ejecutivo Cta</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.unidad}</TableCell>
              <TableCell>{row.tel_uni}</TableCell>
              <TableCell>{row.tel_clien}</TableCell>
              <TableCell>{row.tipo_plan}</TableCell>
              <TableCell>{row.plan_num}</TableCell>
              <TableCell>{row.cod_mot_gen}</TableCell>
              <TableCell>{row.Criterios}</TableCell>
              <TableCell>{row.contrato}</TableCell>
              <TableCell>{row.entrega}</TableCell>
              <TableCell>{row.situ_actual}</TableCell>
              <TableCell>{row.situ_uni}</TableCell>
              <TableCell>{row.cant_venci}</TableCell>
              <TableCell>{row.cant_cuot}</TableCell>
              <TableCell>{row.Cliente_01}</TableCell>
              <TableCell>{row.EjecutivoCta}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={15} className="text-center">
              No hay datos.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

