"use client";

import { useState } from "react";
import api from "@/lib/api/axiosInstance";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  Search,
  Loader2,
  User,
  MapPin,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RequiresPlan } from "@/components/subscription/RequiresPlan";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";

interface Cliente {
  id: string;
  uf: string;
  titular: string;
  calle_inm: string;
  numero_inm: string;
  barrio_inm: string;
  deuda_total: string;
  phone: string;
  verificado: boolean;
}

export default function GenerarReportesPage() {
  const [searchUF, setSearchUF] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSearch = async () => {
    if (!searchUF.trim()) {
      toast.error("Ingresa una UF para buscar");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setClienteSeleccionado(null);

    try {
      const response = await api.get("/client-database/clients", {
        params: {
          search: searchUF,
        },
      });

      const clientes = response.data.data || response.data;

      if (!clientes || clientes.length === 0) {
        toast.error("No se encontraron clientes con esa UF");
        setSearchResults([]);
        return;
      }

      setSearchResults(clientes);
      toast.success(`${clientes.length} cliente(s) encontrado(s)`);
    } catch (error: any) {
      console.error("Error buscando cliente:", error);
      toast.error(
        error.response?.data?.message || "Error al buscar cliente"
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    toast.success(`Cliente ${cliente.titular} seleccionado`);
  };

  const handleGenerateReport = async (
    reportType: "INTIMACION" | "INSTRUCCIONES_PAGO"
  ) => {
    if (!clienteSeleccionado) {
      toast.error("Selecciona un cliente primero");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.post(
        "/reports/generate-pdf",
        {
          uf: clienteSeleccionado.uf,
          reportType,
        },
        {
          responseType: "blob",
        }
      );

      // Descargar el PDF
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}_${clienteSeleccionado.uf}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("PDF generado y descargado exitosamente");
    } catch (error: any) {
      console.error("Error generando reporte:", error);
      toast.error(
        error.response?.data?.message || "Error al generar reporte"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <RequiresPlan plan="PRO">
      <div className="container max-w-6xl mx-auto py-6 px-4 space-y-6">
        {/* Header */}
        <PageHeader
          title="Generar Reportes de Deuda"
          description="Busca un cliente por UF y genera reportes individuales en PDF"
          icon={FileText}
          breadcrumbs={[{ label: 'Reportes' }]}
        />

        {/* Buscador */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Cliente</CardTitle>
            <CardDescription>
              Ingresa la UF del cliente para buscar en la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="uf">UF (Unidad de Facturación)</Label>
                <Input
                  id="uf"
                  placeholder="Ej: 123456789"
                  value={searchUF}
                  onChange={(e) => setSearchUF(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  disabled={isSearching}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchUF.trim()}
                  className="gap-2"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Buscar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Resultados */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados de Búsqueda</CardTitle>
              <CardDescription>
                {searchResults.length} cliente(s) encontrado(s). Selecciona uno para generar reportes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>UF</TableHead>
                      <TableHead>Titular</TableHead>
                      <TableHead>Domicilio</TableHead>
                      <TableHead>Deuda</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((cliente) => (
                      <TableRow
                        key={cliente.id}
                        className={
                          clienteSeleccionado?.id === cliente.id
                            ? "bg-muted"
                            : ""
                        }
                      >
                        <TableCell className="font-mono text-sm">
                          {cliente.uf || "N/A"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {cliente.titular || "Sin nombre"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {cliente.calle_inm && cliente.numero_inm
                            ? `${cliente.calle_inm} ${cliente.numero_inm}`
                            : "Sin domicilio"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              parseFloat(cliente.deuda_total || "0") > 0
                                ? "text-red-600 font-semibold"
                                : "text-green-600"
                            }
                          >
                            ${parseFloat(cliente.deuda_total || "0").toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={
                              clienteSeleccionado?.id === cliente.id
                                ? "default"
                                : "outline"
                            }
                            onClick={() => handleSelectCliente(cliente)}
                            className="gap-2"
                          >
                            {clienteSeleccionado?.id === cliente.id ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Seleccionado
                              </>
                            ) : (
                              "Seleccionar"
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cliente Seleccionado */}
        {clienteSeleccionado && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Cliente Seleccionado</span>
                <Badge variant={clienteSeleccionado.verificado ? "default" : "secondary"}>
                  {clienteSeleccionado.verificado ? "✓ Verificado" : "Sin verificar"}
                </Badge>
              </CardTitle>
              <CardDescription>Información del cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Titular</p>
                    <p className="font-semibold">{clienteSeleccionado.titular}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">UF</p>
                    <p className="font-semibold font-mono">{clienteSeleccionado.uf}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Domicilio</p>
                    <p className="font-semibold">
                      {clienteSeleccionado.calle_inm && clienteSeleccionado.numero_inm
                        ? `${clienteSeleccionado.calle_inm} ${clienteSeleccionado.numero_inm}`
                        : "No especificado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Deuda Total</p>
                    <p className="font-semibold text-red-600">
                      ${parseFloat(clienteSeleccionado.deuda_total || "0").toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de Generación de Reportes */}
        {clienteSeleccionado && (
          <Card>
            <CardHeader>
              <CardTitle>Generar Reportes</CardTitle>
              <CardDescription>
                Selecciona el tipo de reporte que deseas generar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Intimación */}
                <Card className="border-2 hover:border-red-300 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">📄 Intimación de Pago</CardTitle>
                    <CardDescription className="text-sm">
                      Documento formal de intimación con detalle de deuda y plazo de pago
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleGenerateReport("INTIMACION")}
                      disabled={isGenerating}
                      variant="destructive"
                      className="w-full gap-2"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Generar Intimación PDF
                    </Button>
                  </CardContent>
                </Card>

                {/* Instrucciones de Pago */}
                <Card className="border-2 hover:border-blue-300 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">💳 Instrucciones de Pago</CardTitle>
                    <CardDescription className="text-sm">
                      Opciones de pago: Rapipago, transferencia, tarjeta, link de pago
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleGenerateReport("INSTRUCCIONES_PAGO")}
                      disabled={isGenerating}
                      className="w-full gap-2"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Generar Instrucciones PDF
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Alert>
          <AlertDescription>
            <strong>💡 Tip:</strong> Los reportes se generan con los datos actuales de la
            base de datos. Para obtener información de deuda actualizada, verifica al
            cliente en PYSE primero.
          </AlertDescription>
        </Alert>
      </div>
    </RequiresPlan>
  );
}
