"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Clock, CheckCheck, Send, Archive, Search, AlertCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { whatsappChatApi, Conversation, Message } from "@/lib/api/whatsappChatApi";
import { toast } from "sonner";
import { getAccessToken } from "@/utils/authToken";

export default function ConversacionesPage() {
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
    
    if (!token) {
      toast.error("No se encontró token de autenticación");
      return;
    }

    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("✅ Conectado al servidor de chat");
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
  }, [selectedConversation]);

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
        text: replyText,
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
        return <CheckCheck className="h-3 w-3" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 animate-pulse text-blue-500" />
          <p className="text-gray-600">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Lista de Conversaciones */}
      <div className="w-1/3 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-blue-600 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <MessageCircle className="h-7 w-7" />
            Conversaciones
          </h1>
          {totalUnread > 0 && (
            <Badge variant="destructive" className="mt-2">
              {totalUnread} sin leer
            </Badge>
          )}
        </div>

        {/* Búsqueda */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista */}
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay conversaciones activas</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => loadMessages(conv)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedConversation?.id === conv.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conv.client_name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.client_phone}
                        {conv.metadata?.client_account && ` • ${conv.metadata.client_account}`}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <Badge variant="default" className="ml-2">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate mb-1">
                    {conv.last_message_direction === "outgoing" && "Tú: "}
                    {conv.last_message_preview}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {formatDistanceToNow(new Date(conv.last_message_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                    {conv.conversation_window_expires_at &&
                      new Date(conv.conversation_window_expires_at) > new Date() && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(
                            new Date(conv.conversation_window_expires_at),
                            { locale: es }
                          )}
                        </Badge>
                      )}
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
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedConversation.client_name}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedConversation.client_phone}
                  {selectedConversation.metadata?.client_account &&
                    ` • Cuenta: ${selectedConversation.metadata.client_account}`}
                </p>
              </div>
              <div className="flex gap-2">
                {!isWithinWindow && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Ventana expirada
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => archiveConversation(selectedConversation.id)}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archivar
                </Button>
              </div>
            </div>

            {/* Mensajes */}
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.direction === "outgoing" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.direction === "outgoing"
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-900 shadow"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span
                          className={`text-xs ${
                            msg.direction === "outgoing" ? "text-blue-100" : "text-gray-400"
                          }`}
                        >
                          {format(new Date(msg.timestamp), "HH:mm", {
                            locale: es,
                          })}
                        </span>
                        {msg.direction === "outgoing" && getStatusIcon(msg.status)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de Respuesta */}
            <div className="p-4 border-t bg-white">
              {isWithinWindow ? (
                <div className="flex gap-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendReply}
                    disabled={!replyText.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <p className="text-red-600 font-semibold">
                    La ventana de 24hs expiró
                  </p>
                  <p className="text-sm text-red-500 mt-1">
                    Solo puedes usar templates aprobados ($0.047 por mensaje)
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-20 w-20 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Selecciona una conversación para ver los mensajes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
