import { useState, useEffect } from "react";
import api from "@/lib/api/axiosInstance";

interface Subscription {
  id: string;
  plan_type: "BASE" | "PRO";
  plan_price: number;
  is_active: boolean;
  login_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/subscription");

      if (response.data.success) {
        setSubscription(response.data.data);
      } else {
        setError("No se pudo cargar la suscripción");
      }
    } catch (err: any) {
      console.error("Error loading subscription:", err);
      setError(err.response?.data?.message || "Error al cargar suscripción");
    } finally {
      setIsLoading(false);
    }
  };

  const hasPlan = (requiredPlan: "BASE" | "PRO"): boolean => {
    if (!subscription) return false;
    if (requiredPlan === "BASE") return true; // BASE and PRO can access BASE features
    return subscription.plan_type === "PRO"; // Only PRO can access PRO features
  };

  const isPro = subscription?.plan_type === "PRO";
  const isBase = subscription?.plan_type === "BASE";
  const isActive = subscription?.is_active === true;

  return {
    subscription,
    isLoading,
    error,
    hasPlan,
    isPro,
    isBase,
    isActive,
    reload: loadSubscription,
  };
}
