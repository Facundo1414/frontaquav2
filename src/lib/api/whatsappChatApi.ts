import api from "./axiosInstance";
import { getAccessToken } from "@/utils/authToken";

const withAuth = () => ({ Authorization: `Bearer ${getAccessToken()}` });

export interface Conversation {
  id: string;
  client_phone: string;
  client_name: string;
  client_id: string;
  last_message_at: string;
  last_message_preview: string;
  last_message_direction: "incoming" | "outgoing";
  unread_count: number;
  status: string;
  metadata: {
    client_account?: string;
    last_debt_sent?: string;
  };
  conversation_window_expires_at: string | null;
  initiated_by_user_id: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  message_id: string;
  direction: "incoming" | "outgoing";
  sender_user_id: string | null;
  message_type: string;
  content: string;
  status: string;
  timestamp: string;
  is_within_window: boolean;
  conversation_window_expires_at: string | null;
}

export interface SendReplyPayload {
  content: string;
}

export interface SendTemplatePayload {
  templateName: string;
  params?: string[];
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  status: string;
  category: string;
  components: Array<{
    type: string;
    text?: string;
    parameters?: any[];
  }>;
}

export const whatsappChatApi = {
  // Obtener conversaciones del usuario
  getConversations: async (status?: string, page = 1, limit = 20) => {
    const { data } = await api.get("/whatsapp-chat/conversations", {
      headers: withAuth(),
      params: { status, page, limit },
    });
    return data as Conversation[];
  },

  // Obtener mensajes de una conversación
  getMessages: async (conversationId: string, page = 1, limit = 50) => {
    const { data } = await api.get(
      `/whatsapp-chat/conversations/${conversationId}/messages`,
      {
        headers: withAuth(),
        params: { page, limit },
      }
    );
    return data as Message[];
  },

  // Enviar respuesta gratuita (dentro de 24hs)
  sendReply: async (conversationId: string, payload: SendReplyPayload) => {
    const { data } = await api.post(
      `/whatsapp-chat/conversations/${conversationId}/reply`,
      payload,
      {
        headers: withAuth(),
      }
    );
    return data;
  },

  // Obtener templates aprobados
  getTemplates: async () => {
    const { data } = await api.get("/whatsapp-chat/templates", {
      headers: withAuth(),
    });
    return data as WhatsAppTemplate[];
  },

  // Enviar template (fuera de ventana de 24hs)
  sendTemplate: async (
    conversationId: string,
    payload: SendTemplatePayload
  ) => {
    const { data } = await api.post(
      `/whatsapp-chat/conversations/${conversationId}/send-template`,
      payload,
      {
        headers: withAuth(),
      }
    );
    return data;
  },

  // Archivar conversación
  archiveConversation: async (conversationId: string) => {
    const { data } = await api.post(
      `/whatsapp-chat/conversations/${conversationId}/archive`,
      {},
      {
        headers: withAuth(),
      }
    );
    return data;
  },

  // Marcar conversación como leída
  markAsRead: async (conversationId: string) => {
    const { data } = await api.post(
      `/whatsapp-chat/conversations/${conversationId}/mark-read`,
      {},
      {
        headers: withAuth(),
      }
    );
    return data;
  },

  // ========================================
  // 🤖 CONTROL DEL BOT
  // ========================================

  // Obtener estado de asignación de una conversación
  getConversationAssignment: async (conversationId: string) => {
    const { data } = await api.get(
      `/whatsapp-chat/conversations/${conversationId}/assignment`,
      {
        headers: withAuth(),
      }
    );
    return data as {
      botEnabled: boolean;
      assignedUserId: string | null;
      assignedAt: string | null;
      assignmentNote: string | null;
    };
  },

  // Asignar conversación a un asesor (desactiva el bot)
  assignConversation: async (conversationId: string, note?: string) => {
    const { data } = await api.post(
      `/whatsapp-chat/conversations/${conversationId}/assign`,
      { note },
      {
        headers: withAuth(),
      }
    );
    return data as { success: boolean; message: string };
  },

  // Liberar conversación (reactiva el bot)
  releaseConversation: async (conversationId: string) => {
    const { data } = await api.post(
      `/whatsapp-chat/conversations/${conversationId}/release`,
      {},
      {
        headers: withAuth(),
      }
    );
    return data as { success: boolean; message: string };
  },

  // Alternar estado del bot (toggle)
  toggleBot: async (conversationId: string) => {
    const { data } = await api.post(
      `/whatsapp-chat/conversations/${conversationId}/toggle-bot`,
      {},
      {
        headers: withAuth(),
      }
    );
    return data as { botEnabled: boolean; message: string };
  },

  // ========================================
  // 📨 MENSAJES INTERACTIVOS
  // ========================================

  // Enviar botones de respuesta rápida
  sendReplyButtons: async (
    conversationId: string,
    payload: {
      bodyText: string;
      buttons: Array<{ id: string; title: string }>;
      headerText?: string;
      footerText?: string;
    }
  ) => {
    const { data } = await api.post(
      `/whatsapp-chat/conversations/${conversationId}/send-buttons`,
      payload,
      {
        headers: withAuth(),
      }
    );
    return data;
  },

  // Enviar lista interactiva
  sendListMessage: async (
    conversationId: string,
    payload: {
      bodyText: string;
      buttonText: string;
      sections: Array<{
        title: string;
        rows: Array<{ id: string; title: string; description?: string }>;
      }>;
      headerText?: string;
      footerText?: string;
    }
  ) => {
    const { data } = await api.post(
      `/whatsapp-chat/conversations/${conversationId}/send-list`,
      payload,
      {
        headers: withAuth(),
      }
    );
    return data;
  },

  // Enviar ubicación
  sendLocation: async (
    conversationId: string,
    payload: {
      latitude: number;
      longitude: number;
      name: string;
      address: string;
    }
  ) => {
    const { data } = await api.post(
      `/whatsapp-chat/conversations/${conversationId}/send-location`,
      payload,
      {
        headers: withAuth(),
      }
    );
    return data;
  },

  // Mostrar indicador de escribiendo
  showTyping: async (conversationId: string) => {
    const { data } = await api.post(
      `/whatsapp-chat/conversations/${conversationId}/typing`,
      {},
      {
        headers: withAuth(),
      }
    );
    return data;
  },
};
