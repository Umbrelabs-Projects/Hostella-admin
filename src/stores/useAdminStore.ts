// src/stores/useAdminStore.ts

import { create } from "zustand";
import { Admin, Hostel } from "@/types/admin";

export interface AdminState {
  // Data
  admins: Admin[];
  hostels: Hostel[];
  selectedAdmin: Admin | null;

  // UI States
  loading: boolean;
  error: string | null;
  success: string | null;
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  currentPage: number;
  pageSize: number;
  totalAdmins: number;
  searchQuery: string;
  roleFilter: "all" | Admin["role"];
  statusFilter: "all" | Admin["status"];

  // Admin actions
  setAdmins: (admins: Admin[]) => void;
  setSelectedAdmin: (admin: Admin | null) => void;
  addAdmin: (admin: Admin) => void;
  updateAdmin: (admin: Admin) => void;
  removeAdmin: (id: string) => void;

  // Hostel actions
  setHostels: (hostels: Hostel[]) => void;
  updateHostelAdminStatus: (hostelId: string, hasAdmin: boolean) => void;

  // Dialog actions
  openAddDialog: () => void;
  closeAddDialog: () => void;
  openEditDialog: (admin: Admin) => void;
  closeEditDialog: () => void;
  openDeleteDialog: (admin: Admin) => void;
  closeDeleteDialog: () => void;

  // Pagination actions
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalAdmins: (total: number) => void;

  // Filter actions
  setSearchQuery: (query: string) => void;
  setRoleFilter: (role: "all" | Admin["role"]) => void;
  setStatusFilter: (status: "all" | Admin["status"]) => void;
  resetFilters: () => void;

  // API state actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

const initialState = {
  admins: [],
  hostels: [],
  selectedAdmin: null,
  loading: false,
  error: null,
  success: null,
  isAddDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
  currentPage: 1,
  pageSize: 10,
  totalAdmins: 0,
  searchQuery: "",
  roleFilter: "all" as const,
  statusFilter: "all" as const,
};

export const useAdminStore = create<AdminState>((set) => ({
  ...initialState,

  // Admin actions
  setAdmins: (admins) => set({ admins }),
  setSelectedAdmin: (admin) => set({ selectedAdmin: admin }),
  addAdmin: (admin) => set((state) => ({ admins: [...state.admins, admin] })),
  updateAdmin: (admin) =>
    set((state) => ({
      admins: state.admins.map((a) => (a.id === admin.id ? admin : a)),
      selectedAdmin: state.selectedAdmin?.id === admin.id ? admin : state.selectedAdmin,
    })),
  removeAdmin: (id) =>
    set((state) => ({
      admins: state.admins.filter((a) => a.id !== id),
      selectedAdmin: state.selectedAdmin?.id === id ? null : state.selectedAdmin,
    })),

  // Hostel actions
  setHostels: (hostels) => set({ hostels }),
  updateHostelAdminStatus: (hostelId, hasAdmin) =>
    set((state) => ({
      hostels: state.hostels.map((h) => (h.id === hostelId ? { ...h, hasAdmin } : h)),
    })),

  // Dialog actions
  openAddDialog: () => set({ isAddDialogOpen: true, error: null }),
  closeAddDialog: () => set({ isAddDialogOpen: false, error: null }),
  openEditDialog: (admin) => set({ isEditDialogOpen: true, selectedAdmin: admin, error: null }),
  closeEditDialog: () => set({ isEditDialogOpen: false, selectedAdmin: null, error: null }),
  openDeleteDialog: (admin) => set({ isDeleteDialogOpen: true, selectedAdmin: admin, error: null }),
  closeDeleteDialog: () => set({ isDeleteDialogOpen: false, selectedAdmin: null, error: null }),

  // Pagination actions
  setCurrentPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size }),
  setTotalAdmins: (total) => set({ totalAdmins: total }),

  // Filter actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setRoleFilter: (role) => set({ roleFilter: role }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  resetFilters: () => set({ searchQuery: "", roleFilter: "all", statusFilter: "all" }),

  // API state actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
}));
