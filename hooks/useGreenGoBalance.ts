import { useAuth } from "@/contexts/AuthContext";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export function formatGreenGoBalance(amount: number): string {
  return `${amount.toFixed(2).replace(".", ",")} ₾`;
}

export function useGreenGoBalance() {
  const { user, refreshUser } = useAuth();

  useFocusEffect(
    useCallback(() => {
      void refreshUser();
    }, [refreshUser]),
  );

  const balance = user?.balance ?? 0;

  return {
    balance,
    formattedBalance: formatGreenGoBalance(balance),
  };
}
