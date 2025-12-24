"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot,
  MessageSquare,
  Settings,
  Edit,
  Save,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Key,
  ListOrdered,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  whatsappChatApi,
  BotTemplate,
  KeywordTrigger,
} from "@/lib/api/whatsappChatApi";

export default function BotTemplatesPage() {
  const [templates, setTemplates] = useState<BotTemplate[]>([]);
  const [triggers, setTriggers] = useState<KeywordTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BotTemplate | null>(
    null
  );
  const [previewTemplate, setPreviewTemplate] = useState<BotTemplate | null>(
    null
  );

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [templatesData, triggersData] = await Promise.all([
        whatsappChatApi.getBotTemplates(),
        whatsappChatApi.getKeywordTriggers(),
      ]);
      setTemplates(templatesData);
      setTriggers(triggersData);
    } catch (error) {
      console.error("Error fetching bot data:", error);
      toast.error("Error al cargar los datos del bot");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle habilitado/deshabilitado
  const handleToggleEnabled = async (template: BotTemplate) => {
    try {
      await whatsappChatApi.updateBotTemplate(template.key, {
        enabled: !template.enabled,
      });
      setTemplates((prev) =>
        prev.map((t) =>
          t.key === template.key ? { ...t, enabled: !t.enabled } : t
        )
      );
      toast.success(
        `Template "${template.key}" ${!template.enabled ? "habilitado" : "deshabilitado"}`
      );
    } catch (error) {
      console.error("Error toggling template:", error);
      toast.error("Error al actualizar el template");
    }
  };

  // Guardar edición
  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    setSaving(true);
    try {
      await whatsappChatApi.updateBotTemplate(editingTemplate.key, {
        content: editingTemplate.content,
        description: editingTemplate.description,
        enabled: editingTemplate.enabled,
      });
      setTemplates((prev) =>
        prev.map((t) => (t.key === editingTemplate.key ? editingTemplate : t))
      );
      setEditingTemplate(null);
      toast.success("Template actualizado correctamente");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Error al guardar el template");
    } finally {
      setSaving(false);
    }
  };

  // Renderizar contenido del template según tipo
  const renderTemplateContent = (template: BotTemplate) => {
    const content = template.content;
    // Soportar ambos formatos: body/bodyText, button_text/buttonText
    const bodyText = content.bodyText || content.body || '';
    const buttonText = content.buttonText || content.button_text || 'Ver opciones';

    if (template.type === "text") {
      return (
        <div className="bg-green-50 p-3 rounded-lg max-w-md">
          <p className="text-sm whitespace-pre-wrap">{bodyText}</p>
        </div>
      );
    }

    if (template.type === "buttons") {
      return (
        <div className="bg-green-50 p-3 rounded-lg max-w-md space-y-2">
          {content.header && (
            <p className="font-semibold text-sm">{content.header}</p>
          )}
          <p className="text-sm whitespace-pre-wrap">{bodyText}</p>
          {content.footer && (
            <p className="text-xs text-gray-500">{content.footer}</p>
          )}
          <div className="flex flex-col gap-1 mt-2">
            {content.buttons?.map((btn: any, idx: number) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-300"
              >
                {btn.title}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    if (template.type === "list") {
      return (
        <div className="bg-green-50 p-3 rounded-lg max-w-md space-y-2">
          {content.header && (
            <p className="font-semibold text-sm">{content.header}</p>
          )}
          <p className="text-sm whitespace-pre-wrap">{bodyText}</p>
          {content.footer && (
            <p className="text-xs text-gray-500">{content.footer}</p>
          )}
          <Button variant="outline" size="sm" className="w-full mt-2">
            {buttonText}
          </Button>
          <div className="text-xs text-gray-400 mt-1">
            {content.sections?.length || 0} secciones disponibles
          </div>
        </div>
      );
    }

    if (template.type === "location") {
      return (
        <div className="bg-green-50 p-3 rounded-lg max-w-md">
          <div className="bg-gray-200 h-32 rounded flex items-center justify-center mb-2">
            📍 Mapa de ubicación
          </div>
          <p className="font-semibold text-sm">{content.name}</p>
          <p className="text-xs text-gray-600">{content.address}</p>
        </div>
      );
    }

    return <pre className="text-xs">{JSON.stringify(content, null, 2)}</pre>;
  };

  // Obtener triggers para un template
  const getTriggersForTemplate = (templateKey: string) => {
    return triggers.filter((t) => t.template_key === templateKey);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-500" />
            Configuración del Bot WhatsApp
          </h1>
          <p className="text-gray-500 mt-1">
            Administra las respuestas automáticas del bot de WhatsApp
          </p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Habilitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {templates.filter((t) => t.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Deshabilitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {templates.filter((t) => !t.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Keywords Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {triggers.filter((t) => t.enabled).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">
            <MessageSquare className="h-4 w-4 mr-2" />
            Templates de Respuesta
          </TabsTrigger>
          <TabsTrigger value="triggers">
            <Key className="h-4 w-4 mr-2" />
            Palabras Clave
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Respuesta Automática</CardTitle>
              <CardDescription>
                Configura los mensajes que el bot enviará automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Keywords</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => {
                    const templateTriggers = getTriggersForTemplate(
                      template.key
                    );
                    return (
                      <TableRow key={template.id}>
                        <TableCell className="font-mono text-sm">
                          {template.key}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {template.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {templateTriggers.slice(0, 2).map((trigger, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {trigger.keywords[0]}
                                {trigger.keywords.length > 1 &&
                                  ` +${trigger.keywords.length - 1}`}
                              </Badge>
                            ))}
                            {templateTriggers.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{templateTriggers.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={template.enabled}
                            onCheckedChange={() =>
                              handleToggleEnabled(template)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewTemplate(template)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingTemplate(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Triggers Tab */}
        <TabsContent value="triggers">
          <Card>
            <CardHeader>
              <CardTitle>Palabras Clave (Keywords)</CardTitle>
              <CardDescription>
                Las palabras clave que activan cada template de respuesta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Palabras Clave</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Case Sensitive</TableHead>
                    <TableHead>Match Exacto</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {triggers
                    .sort((a, b) => a.priority - b.priority)
                    .map((trigger) => (
                      <TableRow key={trigger.id}>
                        <TableCell className="font-mono text-sm">
                          {trigger.template_key}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {trigger.keywords.map((kw, idx) => (
                              <Badge key={idx} variant="secondary">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{trigger.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          {trigger.case_sensitive ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300" />
                          )}
                        </TableCell>
                        <TableCell>
                          {trigger.exact_match ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300" />
                          )}
                        </TableCell>
                        <TableCell>
                          {trigger.enabled ? (
                            <Badge className="bg-green-100 text-green-800">
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Preview */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={() => setPreviewTemplate(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista Previa: {previewTemplate?.key}
            </DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-sm text-gray-500 mb-2 block">
              Así se verá el mensaje:
            </Label>
            {previewTemplate && renderTemplateContent(previewTemplate)}
          </div>
          <div className="mt-4">
            <Label className="text-sm text-gray-500 mb-2 block">
              Palabras clave que activan este template:
            </Label>
            <div className="flex flex-wrap gap-2">
              {previewTemplate &&
                getTriggersForTemplate(previewTemplate.key).map((trigger) =>
                  trigger.keywords.map((kw, idx) => (
                    <Badge key={idx} variant="secondary">
                      {kw}
                    </Badge>
                  ))
                )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edición */}
      <Dialog
        open={!!editingTemplate}
        onOpenChange={() => setEditingTemplate(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Template: {editingTemplate?.key}
            </DialogTitle>
            <DialogDescription>
              Modifica el contenido del template de respuesta
            </DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Descripción</Label>
                <Input
                  value={editingTemplate.description}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingTemplate.enabled}
                  onCheckedChange={(checked: boolean) =>
                    setEditingTemplate({ ...editingTemplate, enabled: checked })
                  }
                />
                <Label>Habilitado</Label>
              </div>

              <div>
                <Label>Contenido (JSON)</Label>
                <Textarea
                  className="font-mono text-sm h-64"
                  value={JSON.stringify(editingTemplate.content, null, 2)}
                  onChange={(e) => {
                    try {
                      const content = JSON.parse(e.target.value);
                      setEditingTemplate({ ...editingTemplate, content });
                    } catch {
                      // JSON inválido, no actualizar
                    }
                  }}
                />
              </div>

              <div>
                <Label className="text-sm text-gray-500 mb-2 block">
                  Vista previa:
                </Label>
                {renderTemplateContent(editingTemplate)}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTemplate} disabled={saving}>
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
