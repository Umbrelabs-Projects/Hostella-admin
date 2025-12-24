"use client";

import { create } from "zustand";
import { Notification } from "@/types/notifications";
import { apiFetch, APIException } from "@/lib/api";
import {
  UserPlus,
  Receipt,
  ClipboardList,
  Wrench,
  Bell,
  Key,
  CheckCircle,
  X,
  AlertCircle,
} from "lucide-react";

type NotificationFilters = {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
};

type ApiNotification = {
  id: string;
  type: Notification["type"];
  title: string;
  description: string;
  relatedId?: string;
  isRead: boolean; // Backend uses isRead, we'll map to read
  createdAt?: string;
};

type FetchResponse = {
  success: boolean;
  notifications: ApiNotification[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

interface NotificationsState {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  filters: Required<NotificationFilters>;
  currentPage: number;
  pageSize: number;
  totalPages: number;

  addNotification: (notification: Notification) => void;
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
  setFilters: (filters: NotificationFilters) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  clearError: () => void;
}

// *** ADMIN NOTIFICATION ICONS + COLORS ***
// Types match the guide: kebab-case (e.g., "payment-received", "new-booking")
export const typeConfig = {
  "new-booking": {
    icon: ClipboardList,
    color: "bg-blue-100 text-blue-600 border-blue-500",
  },
  "payment-received": {
    icon: Receipt,
    color: "bg-green-100 text-green-600 border-green-500",
  },
  "room-allocated": {
    icon: Key,
    color: "bg-blue-100 text-blue-600 border-blue-500",
  },
  "booking-approved": {
    icon: CheckCircle,
    color: "bg-green-100 text-green-600 border-green-500",
  },
  "booking-rejected": {
    icon: X,
    color: "bg-red-100 text-red-600 border-red-500",
  },
  "booking-cancelled": {
    icon: X,
    color: "bg-red-100 text-red-600 border-red-500",
  },
  "maintenance-alert": {
    icon: Wrench,
    color: "bg-orange-100 text-orange-600 border-orange-500",
  },
  "broadcast": {
    icon: Bell,
    color: "bg-purple-100 text-purple-600 border-purple-500",
  },
  "complaint-received": {
    icon: AlertCircle,
    color: "bg-yellow-100 text-yellow-600 border-yellow-500",
  },
  "complaint-resolved": {
    icon: CheckCircle,
    color: "bg-green-100 text-green-600 border-green-500",
  },
  // Fallback for unknown types
  "system-alert": {
    icon: Bell,
    color: "bg-gray-100 text-gray-600 border-gray-500",
  },
};

const formatRelativeTime = (timestamp?: string) => {
  if (!timestamp) return "Just now";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = date.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "seconds"],
    [60, "minutes"],
    [24, "hours"],
    [7, "days"],
    [4.34524, "weeks"],
    [12, "months"],
    [Number.POSITIVE_INFINITY, "years"],
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  let duration = diffSeconds;

  for (const [amount, unit] of divisions) {
    if (Math.abs(duration) < amount) {
      return formatter.format(duration, unit);
    }
    duration = Math.round(duration / amount);
  }

  return "Just now";
};

const normalizeNotification = (notification: ApiNotification): Notification => ({
  id: notification.id,
  type: notification.type,
  title: notification.title,
  description: notification.description,
  relatedId: notification.relatedId,
  read: notification.isRead, // Map isRead from backend to read for frontend
  createdAt: notification.createdAt,
  time: formatRelativeTime(notification.createdAt),
});

const defaultFilters: Required<NotificationFilters> = {
  page: 1,
  pageSize: 50,
  unreadOnly: false,
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  total: 0,
  unreadCount: 0,
  loading: false,
  error: null,
  filters: defaultFilters,
  currentPage: 1,
  pageSize: 50,
  totalPages: 0,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      total: state.total + 1,
      unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1,
    })),

  fetchNotifications: async (filters = {}) => {
    set({ loading: true, error: null });

    try {
      const mergedFilters = { ...get().filters, ...filters };
      const params = new URLSearchParams({
        page: mergedFilters.page.toString(),
        pageSize: mergedFilters.pageSize.toString(),
        ...(mergedFilters.unreadOnly && { unreadOnly: mergedFilters.unreadOnly.toString() }),
      });

      // Backend returns { success: true, notifications: [...], total, unreadCount, page, pageSize, totalPages }
      const response = await apiFetch<FetchResponse>(`/notifications?${params.toString()}`);

      // Handle different response formats
      let apiNotifications: ApiNotification[] = [];
      let paginationData = {
        total: 0,
        unreadCount: 0,
        page: mergedFilters.page,
        pageSize: mergedFilters.pageSize,
        totalPages: 0,
      };

      if (response.success && Array.isArray(response.notifications)) {
        apiNotifications = response.notifications;
        paginationData = {
          total: response.total ?? 0,
          unreadCount: response.unreadCount ?? 0,
          page: response.page ?? mergedFilters.page,
          pageSize: response.pageSize ?? mergedFilters.pageSize,
          totalPages: response.totalPages ?? 0,
        };
      } else if (Array.isArray(response.notifications)) {
        // Fallback: if response doesn't have success field but has notifications
        apiNotifications = response.notifications;
        paginationData = {
          total: response.total ?? apiNotifications.length,
          unreadCount: response.unreadCount ?? apiNotifications.filter((n) => !n.isRead).length,
          page: response.page ?? mergedFilters.page,
          pageSize: response.pageSize ?? mergedFilters.pageSize,
          totalPages: response.totalPages ?? Math.ceil((response.total ?? apiNotifications.length) / (response.pageSize ?? mergedFilters.pageSize)),
        };
      }

      const normalized = apiNotifications.map(normalizeNotification);

      set({
        notifications: normalized,
        total: paginationData.total,
        unreadCount: paginationData.unreadCount,
        currentPage: paginationData.page,
        pageSize: paginationData.pageSize,
        totalPages: paginationData.totalPages,
        loading: false,
        error: null,
        filters: mergedFilters,
      });
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to fetch notifications";

      set({ error: message, loading: false });
      throw err;
    }
  },

  markAsRead: async (id) => {
    try {
      // Backend returns { success: true, message: "Notification marked as read" }
      await apiFetch<{ success: boolean; message: string }>(`/notifications/${id}/read`, { 
        method: "POST" 
      });
      
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        const wasUnread = notification && !notification.read;
        
        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to mark notification as read";
      set({ error: message });
      throw err;
    }
  },

  markAllAsRead: async () => {
    try {
      // Backend returns { success: true, message: "All notifications marked as read" }
      await apiFetch<{ success: boolean; message: string }>("/notifications/mark-all-read", { 
        method: "POST" 
      });
      
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to mark all notifications as read";
      set({ error: message });
      throw err;
    }
  },

  deleteNotification: async (id) => {
    try {
      // Backend returns { success: true, message: "Notification deleted successfully" }
      await apiFetch<{ success: boolean; message: string }>(`/notifications/${id}`, { 
        method: "DELETE" 
      });
      
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        const wasUnread = notification && !notification.read;
        const nextNotifications = state.notifications.filter((n) => n.id !== id);

        return {
          notifications: nextNotifications,
          total: Math.max(0, state.total - 1),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to delete notification";
      set({ error: message });
      throw err;
    }
  },

  deleteAll: async () => {
    try {
      const ids = get().notifications.map((n) => n.id);
      await Promise.all(ids.map((id) => apiFetch(`/notifications/${id}`, { method: "DELETE" })));

      set({
        notifications: [],
        total: 0,
        unreadCount: 0,
      });
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to delete notifications";
      set({ error: message });
      throw err;
    }
  },

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      currentPage: 1, // Reset to first page when filters change
    })),

  setCurrentPage: (page: number) => set({ currentPage: page }),

  setPageSize: (size: number) => set({ pageSize: size, currentPage: 1 }),

  clearError: () => set({ error: null }),
}));
