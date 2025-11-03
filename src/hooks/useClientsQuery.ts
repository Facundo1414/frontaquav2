/**
 * Custom React Query Hooks para Clients API
 * Sprint 5 - Task 8: Frontend State Management Optimization
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ==================== TYPES ====================

export interface Client {
  id: string;
  uf: string;
  titular: string;
  domicilio: string;
  phone?: string;
  deuda_total?: number;
  categoria?: string;
  // ... otros campos
}

export interface ClientFilters {
  search?: string;
  categoria?: string;
  distrito?: string;
  zona?: string;
  limit?: number;
  offset?: number;
}

// ==================== QUERIES ====================

/**
 * Hook para obtener lista de clientes con filtros
 * Implementa caching inteligente por filtros
 */
export function useClients(filters: ClientFilters = {}) {
  return useQuery({
    queryKey: queryKeys.clients.list(filters),
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const { data } = await axios.get<Client[]>(`${API_URL}/client-database`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      return data;
    },
    enabled: !!localStorage.getItem("token"), // Solo si hay token
    staleTime: 3 * 60 * 1000, // 3 minutos (lista puede cambiar frecuentemente)
  });
}

/**
 * Hook para obtener un cliente por ID
 * Cache de 5 minutos (datos individuales son más estables)
 */
export function useClient(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.clients.detail(id),
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const { data } = await axios.get<Client>(
        `${API_URL}/client-database/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    enabled: enabled && !!id && !!localStorage.getItem("token"),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener cliente por UF (Unidad Funcional)
 * Cache de 5 minutos
 */
export function useClientByUF(uf: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.clients.byUF(uf),
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const { data } = await axios.get<Client>(
        `${API_URL}/client-database/by-uf/${uf}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    enabled: enabled && !!uf && !!localStorage.getItem("token"),
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== MUTATIONS ====================

/**
 * Hook para crear un nuevo cliente
 * Implementa optimistic update + invalidación automática
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newClient: Partial<Client>) => {
      const token = localStorage.getItem("token");
      const { data } = await axios.post<Client>(
        `${API_URL}/client-database`,
        newClient,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    onSuccess: () => {
      // Invalidar todas las listas de clientes
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.lists() });
    },
  });
}

/**
 * Hook para actualizar un cliente
 * Implementa optimistic update
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Client>;
    }) => {
      const token = localStorage.getItem("token");
      const { data } = await axios.patch<Client>(
        `${API_URL}/client-database/${id}`,
        updates,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    // Optimistic update
    onMutate: async ({ id, updates }) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({
        queryKey: queryKeys.clients.detail(id),
      });

      // Snapshot del valor anterior
      const previousClient = queryClient.getQueryData<Client>(
        queryKeys.clients.detail(id)
      );

      // Actualizar optimísticamente
      if (previousClient) {
        queryClient.setQueryData<Client>(queryKeys.clients.detail(id), {
          ...previousClient,
          ...updates,
        });
      }

      return { previousClient };
    },
    onError: (err, { id }, context) => {
      // Rollback en caso de error
      if (context?.previousClient) {
        queryClient.setQueryData(
          queryKeys.clients.detail(id),
          context.previousClient
        );
      }
    },
    onSettled: (data, error, { id }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.lists() });
    },
  });
}

/**
 * Hook para eliminar un cliente
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/client-database/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: (_, id) => {
      // Remover del cache
      queryClient.removeQueries({ queryKey: queryKeys.clients.detail(id) });
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.lists() });
    },
  });
}

/**
 * Hook para prefetch de cliente (útil para hover states)
 */
export function usePrefetchClient() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.clients.detail(id),
      queryFn: async () => {
        const token = localStorage.getItem("token");
        const { data } = await axios.get<Client>(
          `${API_URL}/client-database/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
