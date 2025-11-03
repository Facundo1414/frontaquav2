/**
 * React Query Client Configuration
 * Sprint 5 - Task 8: Frontend State Management Optimization
 * 
 * Features:
 * - Smart caching con stale-while-revalidate
 * - Retry automático con exponential backoff
 * - Deduplicación de requests
 * - Optimistic updates
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * Configuración global de React Query
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Caching strategy
        staleTime: 5 * 60 * 1000, // 5 minutos - datos considerados frescos
        gcTime: 10 * 60 * 1000, // 10 minutos - garbage collection time (antes cacheTime)
        
        // Refetch behavior
        refetchOnWindowFocus: true, // Refetch al volver al tab
        refetchOnReconnect: true, // Refetch al reconectar
        refetchOnMount: true, // Refetch al montar componente
        
        // Retry strategy (exponential backoff)
        retry: (failureCount, error: any) => {
          // No reintentar en errores 4xx (client errors)
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return false;
          }
          // Máximo 3 reintentos para errores 5xx
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Performance
        structuralSharing: true, // Evita re-renders innecesarios
      },
      mutations: {
        // Retry solo 1 vez para mutations
        retry: 1,
        retryDelay: 1000,
        
        // Network mode
        networkMode: 'online', // Solo ejecutar cuando hay conexión
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: siempre crear nuevo client
    return makeQueryClient();
  } else {
    // Browser: reusar client existente
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * Provider de React Query para la aplicación
 * Uso en layout.tsx:
 * 
 * ```tsx
 * <QueryProvider>
 *   {children}
 * </QueryProvider>
 * ```
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  // NOTE: Evitar useState cuando se comparte el queryClient entre usuarios
  // en Node runtime (ssr: true). Preferir getQueryClient() directamente.
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Query keys factory para consistencia
 */
export const queryKeys = {
  // Clients
  clients: {
    all: ['clients'] as const,
    lists: () => [...queryKeys.clients.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.clients.lists(), filters] as const,
    details: () => [...queryKeys.clients.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.clients.details(), id] as const,
    byUF: (uf: string) => [...queryKeys.clients.all, 'byUF', uf] as const,
  },
  
  // Debts
  debts: {
    all: ['debts'] as const,
    byClient: (clientId: string) => [...queryKeys.debts.all, 'client', clientId] as const,
    summary: (userId: string) => [...queryKeys.debts.all, 'summary', userId] as const,
  },
  
  // Documents
  documents: {
    all: ['documents'] as const,
    byClient: (clientId: string) => [...queryKeys.documents.all, 'client', clientId] as const,
    preview: (documentId: string) => [...queryKeys.documents.all, 'preview', documentId] as const,
  },
  
  // WhatsApp
  whatsapp: {
    sessions: ['whatsapp', 'sessions'] as const,
    qr: (sessionId: string) => ['whatsapp', 'qr', sessionId] as const,
  },
  
  // Stats
  stats: {
    dashboard: (userId: string) => ['stats', 'dashboard', userId] as const,
    clientsCount: (userId: string) => ['stats', 'clientsCount', userId] as const,
  },
};

/**
 * Type helpers para invalidación de queries
 */
export type QueryKey = ReturnType<typeof queryKeys[keyof typeof queryKeys][keyof typeof queryKeys[keyof typeof queryKeys]]>;
