"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/providers/context/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, ExternalLink, Copy, Eye, EyeOff, AlertCircle, Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/axiosInstance";

interface ValidationResult {
  valid: boolean;
  phone_number?: string;
  display_name?: string;
  quality_rating?: string;
  error?: string;
}

interface ModeInfo {
  mode: 'baileys' | 'cloud-api';
  description: string;
  is_admin: boolean;
}

// Admin UID desde variables de entorno
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || '';

export default function WhatsappConfigPage() {
  const router = useRouter();
  const { userId } = useGlobalContext();
  
  const [formData, setFormData] = useState({
    phone_number_id: "",
    access_token: "",
    business_account_id: "",
  });

  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [modeInfo, setModeInfo] = useState<ModeInfo | null>(null);
  const [isLoadingMode, setIsLoadingMode] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!userId) {
      toast.error("Debe iniciar sesión para acceder");
      router.push("/login");
      return;
    }

    // Si es admin o usuario regular autenticado, permitir acceso
    const isAdmin = userId === ADMIN_UID;
    console.log('🔐 WhatsApp Config - Auth Check:', {
      userId,
      isAdmin,
      ADMIN_UID,
    });

    setIsCheckingAuth(false);
  }, [userId, router]);

  // Obtener modo de operación al cargar
  useEffect(() => {
    if (isCheckingAuth) return;

    const fetchMode = async () => {
      try {
        const response = await api.get<ModeInfo>("/whatsapp/mode");
        setModeInfo(response.data);
      } catch (error) {
        console.error("Error obteniendo modo WhatsApp:", error);
        toast.error("Error al obtener configuración del sistema");
      } finally {
        setIsLoadingMode(false);
      }
    };
    fetchMode();
  }, [isCheckingAuth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationResult(null); // Reset validation on change
  };

  const handleValidate = async () => {
    if (!formData.phone_number_id || !formData.access_token || !formData.business_account_id) {
      toast.error("Completa todos los campos");
      return;
    }

    setIsValidating(true);
    try {
      const response = await api.post<ValidationResult>("/whatsapp/validate", formData);
      setValidationResult(response.data);
      
      if (response.data.valid) {
        toast.success("✅ Credenciales válidas");
      } else {
        toast.error(`❌ ${response.data.error}`);
      }
    } catch (error: any) {
      toast.error("Error al validar credenciales");
      setValidationResult({
        valid: false,
        error: error.response?.data?.message || "Error desconocido",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!validationResult?.valid) {
      toast.error("Valida las credenciales primero");
      return;
    }

    setIsSaving(true);
    try {
      await api.post("/whatsapp/config", formData);
      toast.success("✅ Configuración guardada");
      router.push("/admin/whatsapp/usage");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al guardar configuración");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  // Mostrar loading mientras verifica autenticación
  if (isCheckingAuth || isLoadingMode) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Panel
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración de WhatsApp Cloud API</h1>
          <p className="text-muted-foreground mt-2">
            Conecta tu cuenta de WhatsApp Business para enviar mensajes oficiales
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Acceso verificado</span>
        </div>
      </div>

      {/* Admin Mode Banner (Baileys) */}
      {!isLoadingMode && modeInfo?.is_admin && (
        <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="ml-2">
            <div className="space-y-2">
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                👤 Cuenta Admin - Modo Desarrollo con Baileys
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Tu cuenta usa <strong>Baileys</strong> para enviar mensajes sin costos ni tracking. 
                No necesitas configurar WhatsApp Cloud API.
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Los demás usuarios del sistema usarán WhatsApp Cloud API oficial con sus propias credenciales.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Regular User Mode Banner (Cloud API) */}
      {!isLoadingMode && !modeInfo?.is_admin && (
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="ml-2">
            <p className="font-semibold text-blue-900 dark:text-blue-100">
              ✅ WhatsApp Cloud API Oficial
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Los mensajes se enviarán usando la API oficial de Meta con tracking de costos. 
              Configura tus credenciales a continuación.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Tutorial Collapsible - Only show for regular users */}
      {!isLoadingMode && !modeInfo?.is_admin && showTutorial && (
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <AlertDescription>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                📚 Cómo obtener tus credenciales
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTutorial(false)}
                className="h-6 px-2"
              >
                Ocultar
              </Button>
            </div>
            <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200 list-decimal list-inside">
              <li>
                Accede a{" "}
                <a
                  href="https://business.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium inline-flex items-center gap-1"
                >
                  Meta Business Suite
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Ve a <strong>Configuración</strong> → <strong>WhatsApp Business Platform</strong></li>
              <li>
                En <strong>Números de teléfono</strong>, copia el <strong>Phone Number ID</strong>
              </li>
              <li>
                En <strong>API Setup</strong>, genera un <strong>Access Token</strong> (permanente)
              </li>
              <li>
                En <strong>Business Info</strong>, copia tu <strong>Business Account ID</strong>
              </li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      {/* Form Card - Only show for regular users (not admin) */}
      {!isLoadingMode && !modeInfo?.is_admin && (
      <Card>
        <CardHeader>
          <CardTitle>Credenciales de API</CardTitle>
          <CardDescription>
            Ingresa las credenciales obtenidas desde Meta Business Suite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Phone Number ID */}
          <div className="space-y-2">
            <Label htmlFor="phone_number_id">Phone Number ID</Label>
            <div className="flex gap-2">
              <Input
                id="phone_number_id"
                name="phone_number_id"
                placeholder="123456789012345"
                value={formData.phone_number_id}
                onChange={handleInputChange}
                disabled={isValidating || isSaving}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(formData.phone_number_id)}
                disabled={!formData.phone_number_id}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ID numérico de 15 dígitos asignado a tu número de WhatsApp Business
            </p>
          </div>

          {/* Access Token */}
          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token (Permanente)</Label>
            <div className="flex gap-2">
              <Input
                id="access_token"
                name="access_token"
                type={showToken ? "text" : "password"}
                placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={formData.access_token}
                onChange={handleInputChange}
                disabled={isValidating || isSaving}
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(formData.access_token)}
                disabled={!formData.access_token}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Token de acceso permanente generado desde la configuración de API
            </p>
          </div>

          {/* Business Account ID */}
          <div className="space-y-2">
            <Label htmlFor="business_account_id">Business Account ID</Label>
            <div className="flex gap-2">
              <Input
                id="business_account_id"
                name="business_account_id"
                placeholder="987654321098765"
                value={formData.business_account_id}
                onChange={handleInputChange}
                disabled={isValidating || isSaving}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(formData.business_account_id)}
                disabled={!formData.business_account_id}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ID de tu cuenta de negocio en Meta Business Manager
            </p>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <Alert
              className={
                validationResult.valid
                  ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
              }
            >
              <AlertDescription>
                <div className="flex items-start gap-3">
                  {validationResult.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    {validationResult.valid ? (
                      <>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          ✅ Credenciales válidas
                        </p>
                        <div className="text-sm text-green-800 dark:text-green-200 mt-2 space-y-1">
                          <p>
                            <strong>Número:</strong> {validationResult.phone_number}
                          </p>
                          <p>
                            <strong>Negocio:</strong> {validationResult.display_name}
                          </p>
                          <p>
                            <strong>Calidad:</strong>{" "}
                            <span
                              className={
                                validationResult.quality_rating === "GREEN"
                                  ? "text-green-600 font-semibold"
                                  : validationResult.quality_rating === "YELLOW"
                                  ? "text-yellow-600 font-semibold"
                                  : "text-red-600 font-semibold"
                              }
                            >
                              {validationResult.quality_rating}
                            </span>
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-red-900 dark:text-red-100">
                          ❌ Error de validación
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                          {validationResult.error}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleValidate}
              disabled={isValidating || isSaving}
              variant="outline"
              className="flex-1"
            >
              {isValidating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isValidating ? "Validando..." : "Validar Credenciales"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!validationResult?.valid || isSaving}
              className="flex-1"
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSaving ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Info Card - Show in both modes */}
      <Card className="bg-muted">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">💡 Información importante</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Tu access token se almacena <strong>encriptado</strong> en la base de datos</li>
            <li>• Las primeras <strong>1,000 conversaciones/mes</strong> son gratuitas</li>
            <li>• Después: <strong>~$0.095 USD por conversación</strong> en Argentina</li>
            <li>• Una conversación = 24 horas con el mismo contacto</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
