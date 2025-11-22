'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useGlobalContext } from '@/app/providers/context/GlobalContext';

// =====================================================
// INTERFACES Y TIPOS
// =====================================================

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: 'BASE' | 'PRO';
  plan_price: number;
  is_active: boolean;
  login_enabled: boolean;
  last_payment_date: string | null;
  next_billing_date: string | null;
  total_payments_count: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionContextType {
  subscription: UserSubscription | null;
  isLoading: boolean;
  error: string | null;
  isPro: boolean;
  isBase: boolean;
  isActive: boolean;
  hasFeature: (feature: string) => boolean;
  refreshSubscription: () => Promise<void>;
  daysUntilBilling: number | null;
  isOverdue: boolean;
}

// =====================================================
// CONTEXT
// =====================================================

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// =====================================================
// PROVIDER
// =====================================================

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId, accessToken } = useGlobalContext(); // 🔧 Get token from context
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Prevent simultaneous fetches
  const isFetchingRef = React.useRef<boolean>(false);

  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || '';

  /**
   * Fetch user subscription from backend
   */
  const fetchSubscription = useCallback(async () => {
    console.log('🎯 fetchSubscription called with userId:', userId, 'hasToken:', !!accessToken);
    
    // Prevent duplicate simultaneous fetches
    if (isFetchingRef.current) {
      console.log('🔒 SubscriptionContext: Fetch already in progress, skipping...');
      return;
    }

    if (!userId) {
      console.log('⚠️ SubscriptionContext: No userId, skipping fetch');
      setIsLoading(false);
      return;
    }

    // Check if user is authenticated - use token from context
    if (!accessToken) {
      console.log('⚠️ SubscriptionContext: No accessToken in context, waiting...');
      setIsLoading(false);
      setSubscription(null);
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      console.log('📡 SubscriptionContext: Fetching subscription for user:', userId);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const baseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
      
      const response = await fetch(`${baseUrl}/subscription`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        // Silently fail if unauthorized (user not logged in yet)
        if (response.status === 401 || response.status === 403) {
          setSubscription(null);
          setIsLoading(false);
          return;
        }
        
        // Handle rate limiting
        if (response.status === 429) {
          console.warn('⚠️ SubscriptionContext: Rate limit exceeded, will retry later');
          throw new Error('Demasiadas solicitudes, intente nuevamente en unos segundos');
        }
        
        throw new Error('Error al obtener suscripción');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setSubscription(result.data);
        console.log('✅ SubscriptionContext: Subscription loaded:', result.data.plan_type);
      } else {
        // Usuario sin suscripción (creará una automática con plan BASE)
        setSubscription(null);
      }
    } catch (err: any) {
      console.error('❌ SubscriptionContext: Error fetching subscription:', err);
      setError(err.message || 'Error al cargar suscripción');
      setSubscription(null);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId, accessToken]); // Dependencies: userId, accessToken

  /**
   * Refresh subscription manually
   */
  const refreshSubscription = useCallback(async () => {
    await fetchSubscription();
  }, [fetchSubscription]);

  /**
   * Load subscription on mount and when userId changes
   */
  useEffect(() => {
    console.log('🔄 SubscriptionContext useEffect triggered:', { userId, hasToken: !!accessToken, ADMIN_UID });
    if (userId && accessToken) {
      fetchSubscription();
    }
  }, [userId, accessToken, fetchSubscription]);

  // =====================================================
  // COMPUTED PROPERTIES
  // =====================================================

  const isPro = subscription?.plan_type === 'PRO' && subscription?.is_active === true;
  const isBase = subscription?.plan_type === 'BASE' || !subscription;
  const isActive = subscription?.is_active === true;

  /**
   * Calculate days until next billing
   */
  const daysUntilBilling = React.useMemo(() => {
    if (!subscription?.next_billing_date) return null;
    
    const now = new Date();
    const billingDate = new Date(subscription.next_billing_date);
    const diffTime = billingDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [subscription?.next_billing_date]);

  /**
   * Check if subscription is overdue
   */
  const isOverdue = React.useMemo(() => {
    if (!daysUntilBilling) return false;
    return daysUntilBilling < 0;
  }, [daysUntilBilling]);

  /**
   * Check if user has access to a specific feature
   */
  const hasFeature = useCallback(
    (feature: string): boolean => {
      // Admin has all features
      if (userId === ADMIN_UID) {
        return true;
      }

      // No subscription = BASE plan
      if (!subscription) {
        return baseFeatures.includes(feature);
      }

      // Login disabled = no features
      if (!subscription.login_enabled) {
        return false;
      }

      // PRO features
      if (proFeatures.includes(feature)) {
        return isPro;
      }

      // BASE features (available to all)
      if (baseFeatures.includes(feature)) {
        return true;
      }

      // Unknown feature, default to false
      return false;
    },
    [userId, subscription, isPro, ADMIN_UID]
  );

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    error,
    isPro,
    isBase,
    isActive,
    hasFeature,
    refreshSubscription,
    daysUntilBilling,
    isOverdue,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

// =====================================================
// HOOK
// =====================================================

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// =====================================================
// FEATURE DEFINITIONS
// =====================================================

const proFeatures = [
  'send_debts',
  'send_proximos_vencer',
  'generate_reports',
  'send_sin_plan',
];

const baseFeatures = [
  'filter_clients',
  'recover_files',
  'client_database',
  'faq',
];

/**
 * Helper to get feature label in Spanish
 */
export const getFeatureLabel = (feature: string): string => {
  const labels: Record<string, string> = {
    send_debts: 'Enviar Comprobantes Vencidos',
    send_proximos_vencer: 'Notificar Próximos a Vencer',
    generate_reports: 'Generar Reportes de Deuda',
    send_sin_plan: 'Enviar a Clientes sin Plan (+3 vencidos)',
    filter_clients: 'Filtrar Clientes PYSE',
    recover_files: 'Recuperar Archivos',
    client_database: 'Base de Clientes',
    faq: 'Preguntas Frecuentes',
  };
  return labels[feature] || feature;
};

/**
 * Helper to get all PRO features
 */
export const getProFeatures = (): string[] => proFeatures;

/**
 * Helper to get all BASE features
 */
export const getBaseFeatures = (): string[] => baseFeatures;
