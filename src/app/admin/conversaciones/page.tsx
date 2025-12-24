"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  User,
  Clock,
  Search,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { whatsappChatApi, Conversation } from "@/lib/api/whatsappChatApi";
import { toast } from "sonner";
import api from "@/lib/api/axiosInstance";
import { getAccessToken } from "@/utils/authToken";
import { PageHeader } from "@/components/PageHeader";

interface UserData {
  id: string;
  email: string;
  name?: string;
}

interface ConversationStats {
  total: number;
  withUnread: number;
  activeWindows: number;
  expiredWindows: number;
}

interface UserStats {
  user: UserData;
  count: number;
  unread: number;
}

export default function AdminConversacionesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const conversationsData = await whatsappChatApi.getConversations("active", 1, 1000);
      setConversations(conversationsData);
      
      // Extraer usuarios únicos y obtener sus display names
      const uniqueUsers = await fetchUsersWithDisplayNames(conversationsData);
      setUsers(uniqueUsers);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersWithDisplayNames = async (conversations: Conversation[]): Promise<UserData[]> => {
    const uniqueUserIds = Array.from(
      new Set(conversations.map(conv => conv.initiated_by_user_id).filter(Boolean))
    );

    if (uniqueUserIds.length === 0) return [];

    try {
      // Hacer solicitud al backend para obtener usuarios
      const { data } = await api.post(
        '/admin/users/by-ids',
        { userIds: uniqueUserIds },
        { headers: { Authorization: `Bearer ${getAccessToken()}` } }
      );

      return data.map((user: any) => ({
        id: user.id,
        email: user.email,
        name: user.display_name || user.email,
      }));
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return extractUniqueUsers(conversations);
    }
  };

  const extractUniqueUsers = (conversations: Conversation[]): UserData[] => {
    const userMap = new Map<string, UserData>();
    
    conversations.forEach(conv => {
      if (conv.initiated_by_user_id && !userMap.has(conv.initiated_by_user_id)) {
        // Crear un nombre más legible del UID (primeros y últimos caracteres)
        const shortId = conv.initiated_by_user_id.slice(0, 8) + '...' + conv.initiated_by_user_id.slice(-4);
        
        userMap.set(conv.initiated_by_user_id, {
          id: conv.initiated_by_user_id,
          email: shortId,
          name: `Display name (${shortId})`,
        });
      }
    });
    
    return Array.from(userMap.values());
  };

  const filteredConversations = conversations.filter((conv) => {
    // Filtrar por usuario
    if (selectedUser !== "all" && conv.initiated_by_user_id !== selectedUser) {
      return false;
    }
    // Filtrar por búsqueda
    if (searchTerm) {
      return (
        conv.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.client_phone?.includes(searchTerm)
      );
    }
    return true;
  });

  const stats: ConversationStats = {
    total: conversations.length,
    withUnread: conversations.filter((c) => c.unread_count > 0).length,
    activeWindows: conversations.filter(
      (c) =>
        c.conversation_window_expires_at &&
        new Date(c.conversation_window_expires_at) > new Date()
    ).length,
    expiredWindows: conversations.filter(
      (c) =>
        !c.conversation_window_expires_at ||
        new Date(c.conversation_window_expires_at) <= new Date()
    ).length,
  };

  const userStats: UserStats[] = users.map((u) => ({
    user: u,
    count: conversations.filter((c) => c.initiated_by_user_id === u.id).length,
    unread: conversations.filter(
      (c) => c.initiated_by_user_id === u.id && c.unread_count > 0
    ).length,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 animate-pulse text-blue-500" />
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <PageHeader
        title="Monitoreo de Conversaciones"
        description="Vista en tiempo real de todas las conversaciones de WhatsApp"
        icon={MessageCircle}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Conversaciones' }
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Total Conversaciones
                </p>
              </div>
              <MessageCircle className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.withUnread}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Con mensajes sin leer
                </p>
              </div>
              <AlertCircle className="h-12 w-12 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {stats.activeWindows}
                </div>
                <p className="text-sm text-gray-600 mt-1">Ventanas activas</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">
                  {stats.expiredWindows}
                </div>
                <p className="text-sm text-gray-600 mt-1">Ventanas expiradas</p>
              </div>
              <Clock className="h-12 w-12 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats por Usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Conversaciones por Empleado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userStats
              .sort((a, b) => b.count - a.count)
              .map((item) => (
                <div
                  key={item.user.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.user.name || item.user.email}
                      </p>
                      <p className="text-sm text-gray-500">{item.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm">
                      {item.count} conversaciones
                    </Badge>
                    {item.unread > 0 && (
                      <Badge variant="destructive">{item.unread} sin leer</Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por cliente o teléfono..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-64">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por empleado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los empleados</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Conversaciones */}
      <Card>
        <CardHeader>
          <CardTitle>
            Conversaciones Activas ({filteredConversations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No hay conversaciones que coincidan con los filtros</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredConversations.map((conv) => {
                  const user = users.find((u) => u.id === conv.initiated_by_user_id);
                  const isWithinWindow =
                    conv.conversation_window_expires_at &&
                    new Date(conv.conversation_window_expires_at) > new Date();

                  return (
                    <div
                      key={conv.id}
                      className="p-4 border rounded-lg bg-white hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-gray-900">
                              {conv.client_name}
                            </h3>
                            {conv.unread_count > 0 && (
                              <Badge variant="destructive">
                                {conv.unread_count} nuevos
                              </Badge>
                            )}
                            {isWithinWindow ? (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ventana activa
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <Clock className="h-3 w-3 mr-1" />
                                Ventana expirada
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {user?.name || user?.email || "Usuario desconocido"}
                            </span>
                            <span>{conv.client_phone}</span>
                            {conv.metadata?.client_account && (
                              <span className="font-mono">
                                Cuenta: {conv.metadata.client_account}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {formatDistanceToNow(new Date(conv.last_message_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded border-l-4 border-l-blue-600">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">
                            {conv.last_message_direction === "outgoing"
                              ? "Tú: "
                              : "Cliente: "}
                          </span>
                          {conv.last_message_preview}
                        </p>
                      </div>

                      {isWithinWindow && conv.conversation_window_expires_at && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>
                            Ventana expira en{" "}
                            {formatDistanceToNow(
                              new Date(conv.conversation_window_expires_at),
                              { locale: es }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
