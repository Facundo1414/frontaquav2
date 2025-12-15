"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Clock, CheckCheck, Check, Send, Archive, Search, AlertCircle, MoreVertical, Paperclip, Smile, Mic, User } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { whatsappChatApi, Conversation, Message } from "@/lib/api/whatsappChatApi";
import { toast } from "sonner";
import { getAccessToken } from "@/utils/authToken";
import { useGlobalContext } from "@/app/providers/context/GlobalContext";

export default function ConversacionesPage() {
  const { userId } = useGlobalContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializar WebSocket
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const token = getAccessToken();
    
    if (!token || !userId) {
      toast.error("No se encontró token de autenticación");
      return;
    }

    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("✅ Conectado al servidor de chat");
      console.log("📡 Suscribiendo al usuario:", userId);
      
      // Suscribirse al canal de WhatsApp del usuario
      socket.emit("whatsapp:subscribe", { userId });
      console.log("✅ Evento de suscripción enviado");
    });

    socket.on("new_message", (message: Message) => {
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
    });

    socket.on("message_status", (status: any) => {
      console.log("📊 Estado de mensaje actualizado:", status);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.message_id === status.messageId
            ? { ...msg, status: status.status }
            : msg
        )
      );
    });

    socket.on("disconnect", () => {
      console.log("❌ Desconectado del servidor de chat");
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  // Cargar conversaciones iniciales
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const markAsRead = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      )
    );
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

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.client_phone?.includes(searchTerm)
  );

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
            <div className="w-10 h-10 rounded-full bg-[#00A884] flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-medium text-[#E9EDEF]">
              Chats
            </h1>
          </div>
          <div className="flex items-center gap-6 text-[#AEBAC1]">
            <MoreVertical className="h-5 w-5 cursor-pointer hover:text-white" />
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
          <>
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
                <Archive 
                  className="h-5 w-5 cursor-pointer hover:text-white" 
                  onClick={() => archiveConversation(selectedConversation.id)}
                />
                <MoreVertical className="h-5 w-5 cursor-pointer hover:text-white" />
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
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-[#8696A0] hover:text-white hover:bg-[#2A3942] rounded-full"
                  >
                    <Smile className="h-6 w-6" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-[#8696A0] hover:text-white hover:bg-[#2A3942] rounded-full"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
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
                  {replyText.trim() ? (
                    <Button
                      onClick={sendReply}
                      className="bg-[#00A884] hover:bg-[#06CF9C] rounded-full h-10 w-10 p-0"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-[#8696A0] hover:text-white hover:bg-[#2A3942] rounded-full"
                    >
                      <Mic className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-3 bg-[#182229] rounded-lg border border-red-900/30">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-400" />
                  <p className="text-red-400 font-medium text-sm">
                    La ventana de 24hs expiró
                  </p>
                  <p className="text-xs text-[#8696A0] mt-1">
                    Solo puedes usar templates aprobados ($0.047 por mensaje)
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#0B141A]">
            <div className="text-center">
              <div className="w-80 mx-auto mb-6">
                <div className="w-72 h-72 mx-auto rounded-full border-8 border-[#202C33] bg-[#111B21] flex items-center justify-center">
                  <MessageCircle className="h-32 w-32 text-[#8696A0] opacity-20" />
                </div>
              </div>
              <h2 className="text-[32px] font-light text-[#E9EDEF] mb-3">
                WhatsApp Business
              </h2>
              <p className="text-sm text-[#8696A0] max-w-md mx-auto leading-5">
                Selecciona una conversación para ver los mensajes o inicia un nuevo chat.
              </p>
            </div>
          </div>
        )}
      </div>

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
