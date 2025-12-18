// src/stores/useBroadcastStore.ts

import { create } from "zustand";
import { BroadcastMessage, BroadcastComposer } from "@/types/broadcast";
import { apiFetch, APIException } from "@/lib/api";

export interface BroadcastState {
  // Data
  messages: BroadcastMessage[];
  selectedMessage: BroadcastMessage | null;
  composer: BroadcastComposer;

  // UI States
  loading: boolean;
  error: string | null;
  success: string | null;
  isComposeDialogOpen: boolean;
  currentPage: number;
  pageSize: number;
  totalMessages: number;
  searchQuery: string;
  statusFilter: "all" | BroadcastMessage["status"];
  priorityFilter: "all" | BroadcastMessage["priority"];

  // Message actions
  setMessages: (messages: BroadcastMessage[]) => void;
  setSelectedMessage: (message: BroadcastMessage | null) => void;
  addMessage: (message: BroadcastMessage) => void;
  updateMessage: (message: BroadcastMessage) => void;
  removeMessage: (id: string) => void;

  // Composer actions
  setComposer: (composer: Partial<BroadcastComposer>) => void;
  resetComposer: () => void;
  getComposer: () => BroadcastComposer;

  // Dialog actions
  openComposeDialog: () => void;
  closeComposeDialog: () => void;

  // Pagination actions
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalMessages: (total: number) => void;

  // Filter actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: "all" | BroadcastMessage["status"]) => void;
  setPriorityFilter: (priority: "all" | BroadcastMessage["priority"]) => void;

  // API state actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  clearError: () => void;
  clearSuccess: () => void;
  clearMessages: () => void;

  // API Actions
  fetchMessages: (page?: number, pageSize?: number) => Promise<void>;
  sendMessage: (message: BroadcastComposer) => Promise<BroadcastMessage>;
  updateMessageApi: (id: string, updates: Partial<BroadcastMessage>) => Promise<BroadcastMessage>;
  deleteMessageApi: (id: string) => Promise<void>;
  resendMessage: (id: string) => Promise<BroadcastMessage>;
}

const defaultComposer: BroadcastComposer = {
  title: "",
  content: "",
  recipientType: "all-members",
  selectedRecipients: [],
  priority: "medium",
  scheduledFor: "",
};

export const useBroadcastStore = create<BroadcastState>((set, get) => ({
  // Initial state
  messages: [],
  selectedMessage: null,
  composer: { ...defaultComposer },

  loading: false,
  error: null,
  success: null,
  isComposeDialogOpen: false,
  currentPage: 1,
  pageSize: 10,
  totalMessages: 0,
  searchQuery: "",
  statusFilter: "all",
  priorityFilter: "all",

  // Message actions
  setMessages: (messages) => set({ messages }),

  setSelectedMessage: (message) => set({ selectedMessage: message }),

  addMessage: (message) =>
    set((state) => ({
      messages: [message, ...state.messages],
      totalMessages: state.totalMessages + 1,
    })),

  updateMessage: (message) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === message.id ? message : m)),
      selectedMessage: state.selectedMessage?.id === message.id ? message : state.selectedMessage,
    })),

  removeMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
      totalMessages: state.totalMessages - 1,
      selectedMessage: state.selectedMessage?.id === id ? null : state.selectedMessage,
    })),

  // Composer actions
  setComposer: (updates) =>
    set((state) => ({
      composer: { ...state.composer, ...updates },
    })),

  resetComposer: () => set({ composer: { ...defaultComposer } }),

  getComposer: () => get().composer,

  // Dialog actions
  openComposeDialog: () => set({ isComposeDialogOpen: true }),

  closeComposeDialog: () => {
    set({ isComposeDialogOpen: false });
    // Reset composer after dialog closes
    setTimeout(() => set({ composer: { ...defaultComposer } }), 300);
  },

  // Pagination actions
  setCurrentPage: (page) => set({ currentPage: page }),

  setPageSize: (size) => set({ pageSize: size }),

  setTotalMessages: (total) => set({ totalMessages: total }),

  // Filter actions
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),

  setStatusFilter: (status) => set({ statusFilter: status, currentPage: 1 }),

  setPriorityFilter: (priority) => set({ priorityFilter: priority, currentPage: 1 }),

  // API state actions
  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setSuccess: (success) => set({ success }),

  clearError: () => set({ error: null }),

  clearSuccess: () => set({ success: null }),

  clearMessages: () =>
    set({
      messages: [],
      selectedMessage: null,
      totalMessages: 0,
      currentPage: 1,
    }),

  // --- API Actions ---
  fetchMessages: async (page = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const { searchQuery, statusFilter, priorityFilter } = get();
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(priorityFilter !== "all" && { priority: priorityFilter }),
      });

      // API returns { success: true, data: [...], pagination: {...} }
      const response = await apiFetch<{
        success: boolean;
        data: BroadcastMessage[];
        pagination: { page: number; pageSize: number; total: number; totalPages: number };
      }>(`/broadcasts?${params}`, {
        method: "GET",
      });

      const messages = response.data ?? [];
      const pagination = response.pagination ?? { page, pageSize, total: 0, totalPages: 0 };

      set({
        messages,
        totalMessages: pagination.total,
        currentPage: pagination.page,
        pageSize: pagination.pageSize,
        loading: false,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to fetch messages";
      set({ error: message, loading: false });
    }
  },

  sendMessage: async (message) => {
    set({ loading: true, error: null });
    try {
      // Remove selectedRecipients and scheduledFor from payload as per API spec
      const payload: {
        title: string;
        content: string;
        recipientType: "all-members" | "all-admins";
        priority: BroadcastPriority;
        scheduledFor?: string;
      } = {
        title: message.title,
        content: message.content,
        recipientType: message.recipientType as "all-members" | "all-admins",
        priority: message.priority,
      };

      // Determine endpoint based on whether scheduling is requested
      const hasScheduledFor = message.scheduledFor && message.scheduledFor.trim() !== "";
      const endpoint = hasScheduledFor ? "/broadcasts/schedule" : "/broadcasts";
      
      if (hasScheduledFor) {
        const scheduledDate = new Date(message.scheduledFor);
        if (isNaN(scheduledDate.getTime())) {
          throw new Error("Invalid scheduled date");
        }
        payload.scheduledFor = scheduledDate.toISOString();
      }

      // API returns { success: true, data: BroadcastMessage, message: string }
      const response = await apiFetch<{
        success: boolean;
        data: BroadcastMessage;
        message: string;
      }>(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const newMessage = response.data;

      set((state) => ({
        messages: [newMessage, ...state.messages],
        totalMessages: state.totalMessages + 1,
        loading: false,
        error: null,
        success: response.message || "Message sent successfully",
        composer: { ...defaultComposer },
        isComposeDialogOpen: false,
      }));

      return newMessage;
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to send message";
      set({ error: message, loading: false });
      throw err;
    }
  },

  updateMessageApi: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      // API returns { success: true, data: BroadcastMessage }
      const response = await apiFetch<{
        success: boolean;
        data: BroadcastMessage;
      }>(`/broadcasts/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      const updated = response.data;

      set((state) => ({
        messages: state.messages.map((m) => (m.id === id ? updated : m)),
        selectedMessage: state.selectedMessage?.id === id ? updated : state.selectedMessage,
        loading: false,
        error: null,
      }));

      return updated;
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to update message";
      set({ error: message, loading: false });
      throw err;
    }
  },

  deleteMessageApi: async (id) => {
    set({ loading: true, error: null });
    try {
      // API returns { success: true, data: { success: true, message: string } }
      await apiFetch<{
        success: boolean;
        data: { success: boolean; message: string };
      }>(`/broadcasts/${id}`, {
        method: "DELETE",
      });

      set((state) => ({
        messages: state.messages.filter((m) => m.id !== id),
        selectedMessage: state.selectedMessage?.id === id ? null : state.selectedMessage,
        totalMessages: state.totalMessages - 1,
        loading: false,
        error: null,
      }));
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to delete message";
      set({ error: message, loading: false });
      throw err;
    }
  },

  resendMessage: async (id) => {
    set({ loading: true, error: null });
    try {
      // API returns { success: true, data: BroadcastMessage }
      const response = await apiFetch<{
        success: boolean;
        data: BroadcastMessage;
      }>(`/broadcasts/${id}/resend`, {
        method: "POST",
      });

      const updated = response.data;

      set((state) => ({
        messages: state.messages.map((m) => (m.id === id ? updated : m)),
        selectedMessage: state.selectedMessage?.id === id ? updated : state.selectedMessage,
        loading: false,
        error: null,
        success: "Message sent!",
      }));

      return updated;
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to resend message";
      set({ error: message, loading: false });
      throw err;
    }
  },
}));
