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
} from "lucide-react";

type NotificationFilters = {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
};

type ApiNotification = {
  id: string;
  type: Notification["type"];
  title: string;
  description: string;
  relatedId?: string;
  read: boolean;
  createdAt?: string;
};

type FetchResponse = {
  notifications: ApiNotification[];
  total?: number;
  unreadCount?: number;
};

interface NotificationsState {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  filters: Required<NotificationFilters>;

  addNotification: (notification: Notification) => void;
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
  setFilters: (filters: NotificationFilters) => void;
  clearError: () => void;
}

// *** ADMIN NOTIFICATION ICONS + COLORS ***
export const typeConfig = {
  new_booking: {
    icon: ClipboardList,
    color: "bg-blue-100 text-blue-600 border-blue-500",
  },
  payment_made: {
    icon: Receipt,
    color: "bg-green-100 text-green-600 border-green-500",
  },
  maintenance_request: {
    icon: Wrench,
    color: "bg-orange-100 text-orange-600 border-orange-500",
  },
  new_user: {
    icon: UserPlus,
    color: "bg-purple-100 text-purple-600 border-purple-500",
  },
  system_alert: {
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
  read: notification.read,
  createdAt: notification.createdAt,
  time: formatRelativeTime(notification.createdAt),
});

const defaultFilters: Required<NotificationFilters> = {
  limit: 20,
  offset: 0,
  unreadOnly: false,
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  total: 0,
  unreadCount: 0,
  loading: false,
  error: null,
  filters: defaultFilters,

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
        limit: mergedFilters.limit.toString(),
        offset: mergedFilters.offset.toString(),
        unreadOnly: mergedFilters.unreadOnly.toString(),
      });

      const response = await apiFetch<FetchResponse>(`/notifications?${params.toString()}`);

      const normalized = response.notifications.map(normalizeNotification);
      const unread = response.unreadCount ?? normalized.filter((n) => !n.read).length;

      set({
        notifications: normalized,
        total: response.total ?? normalized.length,
        unreadCount: unread,
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
      await apiFetch(`/notifications/${id}/read`, { method: "POST" });
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
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
      await apiFetch("/notifications/mark-all-read", { method: "POST" });
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
      await apiFetch(`/notifications/${id}`, { method: "DELETE" });
      set((state) => {
        const nextNotifications = state.notifications.filter((n) => n.id !== id);
        const unreadAdjustment = state.notifications.find((n) => n.id === id && !n.read) ? 1 : 0;

        return {
          notifications: nextNotifications,
          total: Math.max(0, state.total - 1),
          unreadCount: Math.max(0, state.unreadCount - unreadAdjustment),
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
    })),

  clearError: () => set({ error: null }),
}));
