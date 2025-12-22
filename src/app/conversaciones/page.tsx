"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Clock, CheckCheck, Check, Send, Archive, Search, AlertCircle, Home, Filter, Wifi, WifiOff, User, Calendar, DollarSign } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { whatsappChatApi, Conversation, Message, WhatsAppTemplate } from "@/lib/api/whatsappChatApi";
import { toast } from "sonner";
import { getAccessToken } from "@/utils/authToken";
import { useGlobalContext } from "@/app/providers/context/GlobalContext";
import { useRouter } from "next/navigation";

export default function ConversacionesPage() {
  const router = useRouter();
  const { userId, socket, connected } = useGlobalContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "unread" | "active" | "expired">("all");
  const [showClientPanel, setShowClientPanel] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar templates cuando se abre el modal
  useEffect(() => {
    if (showTemplateModal && templates.length === 0) {
      loadTemplates();
    }
  }, [showTemplateModal]);

  // Suscribirse a eventos de WhatsApp cuando el socket esté conectado
  useEffect(() => {
    if (!socket || !connected || !userId) return;

    console.log("✅ [Conversaciones] Socket ya conectado en GlobalContext");
    console.log("🆔 Socket ID:", socket.id);

    // Debug: Escuchar CUALQUIER evento
    const handleAnyEvent = (eventName: string, ...args: any[]) => {
      console.log(`🔔 Evento recibido: ${eventName}`, args);
    };
    socket.onAny(handleAnyEvent);

    const handleNewMessage = (message: Message) => {
      console.log("📨 Nuevo mensaje recibido:", message);
      
      // Actualizar lista de conversaciones
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === message.conversation_id) {
            return {
              ...conv,
              last_message_preview: message.content.substring(0, 50),
              last_message_at: message.timestamp,
              last_message_direction: message.direction,
              unread_count: message.direction === "incoming" ? conv.unread_count + 1 : conv.unread_count,
            };
          }
          return conv;
        })
      );

      // Si el mensaje es de la conversación actual, agregarlo
      if (selectedConversation && message.conversation_id === selectedConversation.id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
        
        // Marcar como leído si es entrante
        if (message.direction === "incoming") {
          markAsRead(message.conversation_id);
        }
      } else if (message.direction === "incoming") {
        // Notificar sobre nuevo mensaje en otra conversación
        toast.info(`Nuevo mensaje de ${conversations.find(c => c.id === message.conversation_id)?.client_name || 'un cliente'}`);
      }
    };

    const handleMessageStatus = (status: any) => {
      console.log("📊 Estado de mensaje actualizado:", status);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.message_id === status.messageId
            ? { ...msg, status: status.status }
            : msg
        )
      );
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_status", handleMessageStatus);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_status", handleMessageStatus);
      socket.offAny(handleAnyEvent);
    };
  }, [socket, connected, userId, selectedConversation]);

  // Cargar conversaciones iniciales
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Shortcuts de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedConversation) {
        setSelectedConversation(null);
        setMessages([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await whatsappChatApi.getConversations("active");
      setConversations(data);
    } catch (error) {
      console.error("Error cargando conversaciones:", error);
      toast.error("Error al cargar conversaciones");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversation: Conversation) => {
    try {
      setSelectedConversation(conversation);
      const data = await whatsappChatApi.getMessages(conversation.id);
      setMessages(data);
      
      // Marcar como leído
      if (conversation.unread_count > 0) {
        markAsRead(conversation.id);
      }
    } catch (error) {
      console.error("Error cargando mensajes:", error);
      toast.error("Error al cargar mensajes");
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      // Actualizar en el backend
      await whatsappChatApi.markAsRead(conversationId);
      
      // Actualizar estado local
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (error) {
      console.error("Error marcando como leído:", error);
    }
  };

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const templatesData = await whatsappChatApi.getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error("Error cargando templates:", error);
      toast.error("Error al cargar templates");
    } finally {
      setLoadingTemplates(false);
    }
  };

  const sendTemplate = async () => {
    if (!selectedConversation || !selectedTemplate) {
      toast.error("Por favor, selecciona una plantilla");
      return;
    }

    try {
      await whatsappChatApi.sendTemplate(selectedConversation.id, {
        templateName: selectedTemplate.name,
        params: [], // TODO: Agregar extracción de parámetros si el template los requiere
      });
      
      toast.success("Plantilla enviada correctamente");
      setSelectedTemplate(null);
      setShowTemplateModal(false);
      
      // Recargar mensajes
      const msgs = await whatsappChatApi.getMessages(selectedConversation.id, 1, 50);
      setMessages(msgs);
    } catch (error) {
      console.error("Error enviando plantilla:", error);
      toast.error("Error al enviar plantilla");
    }
  };

  const sendReply = async () => {
    if (!selectedConversation || !replyText.trim()) return;

    const isWithinWindow = selectedConversation.conversation_window_expires_at
      ? new Date(selectedConversation.conversation_window_expires_at) > new Date()
      : false;

    if (!isWithinWindow) {
      toast.error("La ventana de 24hs expiró. Solo puedes usar templates aprobados.");
      return;
    }

    try {
      await whatsappChatApi.sendReply(selectedConversation.id, {
        content: replyText,
      });
      setReplyText("");
      toast.success("Mensaje enviado");
    } catch (error: any) {
      console.error("Error enviando mensaje:", error);
      toast.error(error.response?.data?.message || "Error al enviar mensaje");
    }
  };

  const archiveConversation = async (conversationId: string) => {
    try {
      await whatsappChatApi.archiveConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      toast.success("Conversación archivada");
    } catch (error) {
      console.error("Error archivando conversación:", error);
      toast.error("Error al archivar conversación");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-4 w-4" />;
      case "delivered":
        return <CheckCheck className="h-4 w-4" />;
      case "read":
        return <CheckCheck className="h-4 w-4 text-blue-400" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 opacity-50" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredConversations = conversations.filter((conv) => {
    // Filtro de búsqueda
    const matchesSearch =
      conv.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.client_phone?.includes(searchTerm);

    if (!matchesSearch) return false;

    // Filtros por tipo
    const isWithinWindow = conv.conversation_window_expires_at
      ? new Date(conv.conversation_window_expires_at) > new Date()
      : false;

    switch (filterType) {
      case "unread":
        return conv.unread_count > 0;
      case "active":
        return isWithinWindow;
      case "expired":
        return !isWithinWindow;
      default:
        return true;
    }
  });

  const isWithinWindow = selectedConversation?.conversation_window_expires_at
    ? new Date(selectedConversation.conversation_window_expires_at) > new Date()
    : false;

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-[#111B21]">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 animate-pulse text-[#00A884]" />
          <p className="text-gray-300">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex bg-[#111B21] overflow-hidden">
      {/* Lista de Conversaciones */}
      <div className="w-[380px] bg-[#111B21] border-r border-[#2A3942] flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="h-[60px] px-4 bg-[#202C33] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/home')}
              className="text-[#AEBAC1] hover:text-white hover:bg-[#2A3942] rounded-full"
              title="Volver al home"
            >
              <Home className="h-5 w-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-[#00A884] flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-medium text-[#E9EDEF]">
              Chats
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {connected ? (
              <div className="flex items-center gap-1 text-green-400" title="Conectado">
                <Wifi className="h-4 w-4" />
                <span className="text-xs">En línea</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-400" title="Desconectado">
                <WifiOff className="h-4 w-4" />
                <span className="text-xs">Sin conexión</span>
              </div>
            )}
          </div>
        </div>

        {/* Búsqueda */}
        <div className="px-3 py-2 bg-[#111B21]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8696A0]" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar o iniciar un chat"
              className="pl-12 bg-[#202C33] border-none text-[#E9EDEF] placeholder:text-[#8696A0] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg h-9"
            />
          </div>
          {totalUnread > 0 && (
            <div className="mt-2 px-2 py-1 bg-[#00A884] text-white text-xs font-medium rounded-full inline-block">
              {totalUnread} sin leer
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="px-3 py-2 bg-[#111B21] flex gap-2 border-b border-[#2A3942]">
          <Button
            variant={filterType === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterType("all")}
            className={`text-xs h-7 ${filterType === "all" ? "bg-[#00A884] hover:bg-[#06CF9C]" : "text-[#8696A0] hover:text-white hover:bg-[#2A3942]"}`}
          >
            Todas
          </Button>
          <Button
            variant={filterType === "unread" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterType("unread")}
            className={`text-xs h-7 ${filterType === "unread" ? "bg-[#00A884] hover:bg-[#06CF9C]" : "text-[#8696A0] hover:text-white hover:bg-[#2A3942]"}`}
          >
            No leídos {totalUnread > 0 && `(${totalUnread})`}
          </Button>
          <Button
            variant={filterType === "active" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterType("active")}
            className={`text-xs h-7 ${filterType === "active" ? "bg-[#00A884] hover:bg-[#06CF9C]" : "text-[#8696A0] hover:text-white hover:bg-[#2A3942]"}`}
          >
            Activas
          </Button>
          <Button
            variant={filterType === "expired" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterType("expired")}
            className={`text-xs h-7 ${filterType === "expired" ? "bg-[#00A884] hover:bg-[#06CF9C]" : "text-[#8696A0] hover:text-white hover:bg-[#2A3942]"}`}
          >
            Expiradas
          </Button>
        </div>

        {/* Lista */}
        <ScrollArea className="flex-1 bg-[#111B21]">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-[#8696A0]">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay conversaciones activas</p>
            </div>
          ) : (
            <div>
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => loadMessages(conv)}
                  className={`px-3 py-3 cursor-pointer hover:bg-[#202C33] transition-colors ${
                    selectedConversation?.id === conv.id ? "bg-[#2A3942]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#6B7C85] flex items-center justify-center text-white font-medium flex-shrink-0">
                      {getInitials(conv.client_name)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-[#E9EDEF] truncate">
                          {conv.client_name}
                        </h3>
                        <span className="text-xs text-[#8696A0] ml-2 flex-shrink-0">
                          {formatDistanceToNow(new Date(conv.last_message_at), {
                            addSuffix: false,
                            locale: es,
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          conv.unread_count > 0 ? "text-[#D1D7DB] font-medium" : "text-[#8696A0]"
                        }`}>
                          {conv.last_message_direction === "outgoing" && (
                            <CheckCheck className="inline h-3 w-3 mr-1 text-[#53BDEB]" />
                          )}
                          {conv.last_message_preview}
                        </p>
                        {conv.unread_count > 0 && (
                          <div className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-[#00A884] flex items-center justify-center">
                            <span className="text-xs text-white font-medium">{conv.unread_count}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Panel de Mensajes */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <div className="flex h-full">
            {/* Área de Chat */}
            <div className="flex-1 flex flex-col">
            {/* Header del Chat */}
            <div className="h-[60px] px-4 bg-[#202C33] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#6B7C85] flex items-center justify-center text-white font-medium">
                  {getInitials(selectedConversation.client_name)}
                </div>
                <div>
                  <h2 className="text-base font-medium text-[#E9EDEF]">
                    {selectedConversation.client_name}
                  </h2>
                  <p className="text-xs text-[#8696A0]">
                    {selectedConversation.client_phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[#AEBAC1]">
                {!isWithinWindow && (
                  <div className="px-2 py-1 bg-red-900/30 text-red-400 text-xs font-medium rounded">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    Ventana expirada
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowClientPanel(!showClientPanel)}
                  className="text-[#AEBAC1] hover:text-white hover:bg-[#2A3942] rounded-full"
                  title="Info del cliente"
                >
                  <User className="h-5 w-5" />
                </Button>
                <Archive 
                  className="h-5 w-5 cursor-pointer hover:text-white" 
                  onClick={() => archiveConversation(selectedConversation.id)}
                />
              </div>
            </div>

            {/* Mensajes con fondo WhatsApp */}
            <div 
              className="flex-1 overflow-y-auto p-4 pb-6"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%230b141a'/%3E%3Cpath d='M0 0L50 50M50 0L0 50M50 0L100 50M100 0L50 50M50 50L100 100M50 50L0 100M100 50L50 100' stroke='%23202c33' stroke-width='0.5' opacity='0.3'/%3E%3C/svg%3E")`,
                backgroundColor: "#0B141A",
                minHeight: 0
              }}
            >
              <div className="max-w-5xl mx-auto space-y-2 min-h-full flex flex-col justify-end">
                {messages.map((msg, index) => {
                  const showDate = index === 0 || 
                    new Date(messages[index - 1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();
                  
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center mb-3 mt-3">
                          <div className="bg-[#182229] px-3 py-1 rounded-md shadow-sm">
                            <span className="text-xs text-[#8696A0]">
                              {format(new Date(msg.timestamp), "d 'de' MMMM 'de' yyyy", {
                                locale: es,
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div
                        className={`flex ${
                          msg.direction === "outgoing" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`relative max-w-[65%] rounded-lg px-3 py-2 shadow-md ${
                            msg.direction === "outgoing"
                              ? "bg-[#005C4B] text-white rounded-br-none"
                              : "bg-[#202C33] text-[#E9EDEF] rounded-bl-none"
                          }`}
                          style={{
                            animation: "slideIn 0.2s ease-out"
                          }}
                        >
                          <p className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-1 min-w-[60px]">
                            <span
                              className={`text-[11px] ${
                                msg.direction === "outgoing" ? "text-[#8696A0]" : "text-[#8696A0]"
                              }`}
                            >
                              {format(new Date(msg.timestamp), "HH:mm", {
                                locale: es,
                              })}
                            </span>
                            {msg.direction === "outgoing" && (
                              <span className="text-[#8696A0]">
                                {getStatusIcon(msg.status)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input de Respuesta */}
            <div className="px-4 py-3 bg-[#202C33] border-t border-[#2A3942] flex-shrink-0">
              {isWithinWindow ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escribe un mensaje"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                    className="flex-1 bg-[#2A3942] border-none text-[#E9EDEF] placeholder:text-[#8696A0] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg h-10"
                  />
                  <Button
                    onClick={sendReply}
                    disabled={!replyText.trim()}
                    className="bg-[#00A884] hover:bg-[#06CF9C] disabled:opacity-50 disabled:cursor-not-allowed rounded-full h-10 w-10 p-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center py-3 bg-[#182229] rounded-lg border border-red-900/30">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-400" />
                    <p className="text-red-400 font-medium text-sm">
                      La ventana de 24hs expiró
                    </p>
                    <p className="text-xs text-[#8696A0] mt-1">
                      Solo puedes usar templates aprobados ($0.047 por mensaje)
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowTemplateModal(true)}
                    className="w-full bg-[#00A884] hover:bg-[#00A884]/90 text-white"
                  >
                    Enviar Plantilla Aprobada
                  </Button>
                </div>
              )}
            </div>
            </div>

            {/* Panel de Información del Cliente */}
            {showClientPanel && (
              <div className="w-[320px] bg-[#111B21] border-l border-[#2A3942] flex flex-col">
                {/* Header del Panel */}
                <div className="h-[60px] px-4 bg-[#202C33] flex items-center justify-between border-b border-[#2A3942]">
                  <h3 className="text-base font-medium text-[#E9EDEF]">Información del Cliente</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowClientPanel(false)}
                    className="text-[#8696A0] hover:text-white hover:bg-[#2A3942]"
                  >
                    <AlertCircle className="h-5 w-5 rotate-45" />
                  </Button>
                </div>

                {/* Contenido del Panel */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {/* Avatar y nombre */}
                    <div className="text-center pb-4 border-b border-[#2A3942]">
                      <div className="w-20 h-20 rounded-full bg-[#6B7C85] flex items-center justify-center text-white font-medium text-2xl mx-auto mb-3">
                        {getInitials(selectedConversation.client_name)}
                      </div>
                      <h4 className="text-lg font-medium text-[#E9EDEF] mb-1">
                        {selectedConversation.client_name}
                      </h4>
                      <p className="text-sm text-[#8696A0]">
                        {selectedConversation.client_phone}
                      </p>
                    </div>

                    {/* Información de la cuenta */}
                    {selectedConversation.metadata?.client_account && (
                      <div className="bg-[#202C33] rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-[#8696A0]">
                          <User className="h-4 w-4" />
                          <span className="text-xs font-medium">N° de Cuenta</span>
                        </div>
                        <p className="text-[#E9EDEF] font-mono text-sm pl-6">
                          {selectedConversation.metadata.client_account}
                        </p>
                      </div>
                    )}

                    {/* Última deuda enviada */}
                    {selectedConversation.metadata?.last_debt_sent && (
                      <div className="bg-[#202C33] rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-[#8696A0]">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs font-medium">Última Deuda Enviada</span>
                        </div>
                        <p className="text-[#E9EDEF] text-sm pl-6">
                          {format(new Date(selectedConversation.metadata.last_debt_sent), "d 'de' MMMM 'de' yyyy", {
                            locale: es,
                          })}
                        </p>
                      </div>
                    )}

                    {/* Estado de la ventana */}
                    <div className="bg-[#202C33] rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-[#8696A0]">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs font-medium">Ventana de 24hs</span>
                      </div>
                      <div className="pl-6">
                        {isWithinWindow ? (
                          <div className="text-sm">
                            <p className="text-green-400 font-medium mb-1">✓ Activa</p>
                            <p className="text-[#8696A0] text-xs">
                              Expira {formatDistanceToNow(new Date(selectedConversation.conversation_window_expires_at!), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </p>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <p className="text-red-400 font-medium mb-1">✗ Expirada</p>
                            <p className="text-[#8696A0] text-xs">
                              Solo puedes usar templates aprobados
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fecha de inicio de conversación */}
                    <div className="bg-[#202C33] rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-[#8696A0]">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs font-medium">Última Actividad</span>
                      </div>
                      <p className="text-[#E9EDEF] text-sm pl-6">
                        {format(new Date(selectedConversation.last_message_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#0B141A]">
            <div className="text-center">
              <MessageCircle className="h-24 w-24 mx-auto mb-4 text-[#8696A0] opacity-30" />
              <h2 className="text-2xl font-medium text-[#E9EDEF] mb-2">
                Selecciona una conversación
              </h2>
              <p className="text-sm text-[#8696A0] max-w-md mx-auto">
                Elige un chat de la lista para ver los mensajes
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación para envío de plantilla */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTemplateModal(false)}>
          <div className="bg-[#202C33] rounded-lg max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-[#E9EDEF] mb-2">
                    Enviar Plantilla Aprobada
                  </h3>
                  <div className="space-y-1 text-xs text-[#8696A0]">
                    <p>⚠️ <strong className="text-yellow-400">Cobrado</strong> si excedes 400 mensajes/mes · 💰 <strong>$0.047 USD</strong></p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="text-[#8696A0] hover:text-white">✕</button>
            </div>

            {/* Lista de templates */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#E9EDEF]">
                Selecciona una plantilla:
              </label>
              
              {loadingTemplates ? (
                <div className="text-center py-8 text-[#8696A0]">Cargando plantillas...</div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-[#8696A0]">
                  <p>No hay plantillas aprobadas disponibles</p>
                  <p className="text-xs mt-2">Crea y aprueba plantillas en Meta Business Manager</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedTemplate?.id === template.id
                          ? "bg-[#00A884]/10 border-[#00A884] text-[#E9EDEF]"
                          : "bg-[#2A3942] border-[#8696A0]/20 text-[#8696A0] hover:border-[#8696A0]/50"
                      }`}
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs opacity-70">{template.category} · {template.language}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preview del template seleccionado */}
            {selectedTemplate && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#E9EDEF]">
                  Vista previa:
                </label>
                <div className="bg-[#2A3942] rounded-lg p-4 border border-[#8696A0]/20">
                  {selectedTemplate.components.map((component, idx) => (
                    <div key={idx} className="text-sm text-[#E9EDEF] whitespace-pre-wrap">
                      {component.text || ""}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <Button
                onClick={() => {
                  setShowTemplateModal(false);
                  setSelectedTemplate(null);
                }}
                variant="outline"
                className="flex-1 border-[#8696A0]/30 text-[#8696A0] hover:bg-[#2A3942]"
              >
                Cancelar
              </Button>
              <Button
                onClick={sendTemplate}
                disabled={!selectedTemplate}
                className="flex-1 bg-[#00A884] hover:bg-[#00A884]/90 text-white disabled:opacity-50"
              >
                Confirmar y Enviar
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
