"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Bot,
  MessageSquare,
  Key,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import {
  whatsappChatApi,
  BotTemplate,
  KeywordTrigger,
} from "@/lib/api/whatsappChatApi";

interface BotResponsesModalProps {
  trigger?: React.ReactNode;
}

export function BotResponsesModal({ trigger }: BotResponsesModalProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<BotTemplate[]>([]);
  const [triggers, setTriggers] = useState<KeywordTrigger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [templatesData, triggersData] = await Promise.all([
        whatsappChatApi.getBotTemplates(),
        whatsappChatApi.getKeywordTriggers(),
      ]);
      setTemplates(templatesData.filter((t) => t.enabled));
      setTriggers(triggersData.filter((t) => t.enabled));
    } catch (error) {
      console.error("Error fetching bot data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTriggersForTemplate = (templateKey: string) => {
    return triggers.filter((t) => t.template_key === templateKey);
  };

  // Renderizar contenido del template como preview de WhatsApp
  const renderTemplatePreview = (template: BotTemplate) => {
    const content = template.content;
    // Soportar ambos formatos: body/bodyText, button_text/buttonText
    const bodyText = content.bodyText || content.body || '';
    const buttonText = content.buttonText || content.button_text || 'Ver opciones';

    if (template.type === "text") {
      return (
        <div className="bg-[#dcf8c6] p-3 rounded-lg rounded-tr-none max-w-xs shadow-sm">
          <p className="text-sm whitespace-pre-wrap">{bodyText}</p>
          <span className="text-[10px] text-gray-500 float-right mt-1">
            Bot 🤖
          </span>
        </div>
      );
    }

    if (template.type === "buttons") {
      return (
        <div className="space-y-1 max-w-xs">
          <div className="bg-[#dcf8c6] p-3 rounded-lg rounded-tr-none shadow-sm">
            {content.header && (
              <p className="font-semibold text-sm mb-1">{content.header}</p>
            )}
            <p className="text-sm whitespace-pre-wrap">{bodyText}</p>
            {content.footer && (
              <p className="text-xs text-gray-500 mt-1">{content.footer}</p>
            )}
            <span className="text-[10px] text-gray-500 float-right mt-1">
              Bot 🤖
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {content.buttons?.map((btn: any, idx: number) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 p-2 rounded text-center text-sm text-blue-600 cursor-pointer hover:bg-gray-50"
              >
                {btn.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (template.type === "list") {
      return (
        <div className="space-y-1 max-w-xs">
          <div className="bg-[#dcf8c6] p-3 rounded-lg rounded-tr-none shadow-sm">
            {content.header && (
              <p className="font-semibold text-sm mb-1">{content.header}</p>
            )}
            <p className="text-sm whitespace-pre-wrap">{bodyText}</p>
            {content.footer && (
              <p className="text-xs text-gray-500 mt-1">{content.footer}</p>
            )}
            <span className="text-[10px] text-gray-500 float-right mt-1">
              Bot 🤖
            </span>
          </div>
          <div className="bg-white border border-gray-200 p-2 rounded text-center text-sm text-blue-600">
            {buttonText} ▼
          </div>
        </div>
      );
    }

    if (template.type === "location") {
      return (
        <div className="bg-[#dcf8c6] rounded-lg rounded-tr-none max-w-xs shadow-sm overflow-hidden">
          <div className="bg-gray-300 h-24 flex items-center justify-center">
            📍 Ubicación
          </div>
          <div className="p-3">
            <p className="font-semibold text-sm">{content.name}</p>
            <p className="text-xs text-gray-600">{content.address}</p>
            <span className="text-[10px] text-gray-500 float-right mt-1">
              Bot 🤖
            </span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Ver respuestas del bot</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            Respuestas Automáticas del Bot
          </DialogTitle>
          <DialogDescription>
            Estas son las respuestas que el bot envía automáticamente cuando
            detecta ciertas palabras clave en los mensajes de los clientes.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh] pr-4">
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Cuando un cliente envía un mensaje que contiene alguna de las
                palabras clave configuradas, el bot responde automáticamente con
                el mensaje correspondiente. Solo funciona cuando el bot está
                activado en la conversación.
              </p>
            </div>

            {/* Templates List */}
            <Accordion type="single" collapsible className="space-y-2">
              {templates.map((template) => {
                const templateTriggers = getTriggersForTemplate(template.key);
                const allKeywords = templateTriggers.flatMap((t) => t.keywords);

                return (
                  <AccordionItem
                    key={template.id}
                    value={template.key}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{template.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {allKeywords.slice(0, 3).map((kw, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {kw}
                              </Badge>
                            ))}
                            {allKeywords.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{allKeywords.length - 3} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Separator className="my-3" />

                      {/* Palabras clave */}
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                          <Key className="h-3 w-3" />
                          Palabras clave que activan esta respuesta:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {allKeywords.map((kw, idx) => (
                            <Badge key={idx} className="bg-blue-100 text-blue-700">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Preview del mensaje */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          📱 Vista previa del mensaje:
                        </p>
                        <div className="bg-[#e5ddd5] p-4 rounded-lg">
                          <div className="flex justify-end">
                            {renderTemplatePreview(template)}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {templates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay respuestas automáticas configuradas</p>
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
