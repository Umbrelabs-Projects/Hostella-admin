// src/stores/useBroadcastStore.ts

import { create } from "zustand";
import { BroadcastMessage, BroadcastComposer } from "@/types/broadcast";

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
  clearMessages: () => void;
}

const defaultComposer: BroadcastComposer = {
  title: "",
  content: "",
  recipientType: "all-residents",
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

  clearMessages: () =>
    set({
      messages: [],
      selectedMessage: null,
      totalMessages: 0,
      currentPage: 1,
    }),
}));
