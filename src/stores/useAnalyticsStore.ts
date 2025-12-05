// src/stores/useAnalyticsStore.ts

import { create } from "zustand";
import { DashboardAnalytics } from "@/types/analytics";

export interface AnalyticsState {
  analytics: DashboardAnalytics | null;
  loading: boolean;
  error: string | null;
  dateRange: {
    startDate: string;
    endDate: string;
  };

  // Actions
  setAnalytics: (analytics: DashboardAnalytics) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  refreshAnalytics: () => void;
}

const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Last 30 days

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  analytics: null,
  loading: false,
  error: null,
  dateRange: getDefaultDateRange(),

  setAnalytics: (analytics) => set({ analytics, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setDateRange: (startDate, endDate) => set({ dateRange: { startDate, endDate } }),
  refreshAnalytics: () => set({ analytics: null, loading: true, error: null }),
}));
