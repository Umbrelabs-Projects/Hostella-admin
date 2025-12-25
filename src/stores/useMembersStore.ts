import { create } from "zustand";
import { StudentBooking } from "@/types/booking";
import { apiFetch, APIException } from "@/lib/api";
import { transformBooking, transformBookings } from "@/lib/transformBooking";

export type MembersState = {
  members: StudentBooking[];
  selectedMember: StudentBooking | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalMembers: number;
  filters: {
    search: string;
    status: string;
  };

  // Basic actions
  setMembers: (m: StudentBooking[]) => void;
  setSelectedMember: (m: StudentBooking | null) => void;
  updateMember: (u: StudentBooking) => void;
  addMember: (m: StudentBooking) => void;
  removeMember: (id: string) => void;

  // API actions
  fetchMembers: (page?: number, pageSize?: number) => Promise<void>;
  updateMemberApi: (id: string, updates: Partial<StudentBooking>) => Promise<StudentBooking>;
  deleteMember: (id: string) => Promise<void>;

  // Pagination & Filter
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilters: (filters: Partial<MembersState["filters"]>) => void;
  clearError: () => void;
};

export const useMembersStore = create<MembersState>((set, get) => ({
  // Initial state
  members: [],
  selectedMember: null,
  loading: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  totalMembers: 0,
  filters: {
    search: "",
    status: "all",
  },

  // --- Basic State Actions ---
  setMembers: (m: StudentBooking[]) => set({ members: Array.isArray(m) ? m : [] }),
  setSelectedMember: (m: StudentBooking | null) => set({ selectedMember: m }),
  updateMember: (u: StudentBooking) =>
    set((state) => {
      const currentMembers = Array.isArray(state.members) ? state.members : [];
      return {
        members: currentMembers.map((m) => (m.id === u.id ? u : m)),
        selectedMember: state.selectedMember?.id === u.id ? u : state.selectedMember,
      };
    }),
  addMember: (m: StudentBooking) =>
    set((state) => {
      const currentMembers = Array.isArray(state.members) ? state.members : [];
      return {
        members: currentMembers.find((x) => x.id === m.id) ? currentMembers : [...currentMembers, m],
      };
    }),
  removeMember: (id: string) =>
    set((state) => {
      const currentMembers = Array.isArray(state.members) ? state.members : [];
      return {
        members: currentMembers.filter((m) => m.id !== id),
        selectedMember: state.selectedMember?.id === id ? null : state.selectedMember,
      };
    }),

  // --- Pagination & Filter Actions ---
  setCurrentPage: (page: number) => set({ currentPage: page }),
  setPageSize: (size: number) => set({ pageSize: size, currentPage: 1 }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      currentPage: 1,
    })),
  clearError: () => set({ error: null }),

  // --- API Actions ---
  fetchMembers: async (page = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && filters.status !== "all" && { status: filters.status }),
      });

      // Backend may return different formats:
      // 1. { success: true, data: [...], pagination: {...} }
      // 2. { members: [...], total, page, pageSize }
      // 3. Direct array [...]
      const response = await apiFetch<unknown>(`/members?${params}`, {
        method: "GET",
      });

      // Extract members from various possible response formats
      let members: StudentBooking[] = [];
      let pagination: { page: number; pageSize: number; total: number; totalPages: number };

      // Type guard helpers
      const isArray = (val: unknown): val is StudentBooking[] => Array.isArray(val);
      const hasMembers = (val: unknown): val is { members: StudentBooking[]; total?: number; page?: number; pageSize?: number; totalPages?: number } => {
        return typeof val === "object" && val !== null && "members" in val && Array.isArray((val as { members: unknown }).members);
      };
      const hasData = (val: unknown): val is { success?: boolean; data: StudentBooking[] | { members: StudentBooking[] }; pagination?: { page: number; pageSize: number; total: number; totalPages: number }; page?: number; pageSize?: number; total?: number; totalPages?: number } => {
        return typeof val === "object" && val !== null && "data" in val;
      };

      if (isArray(response)) {
        // Direct array response
        members = response;
        pagination = { page, pageSize, total: response.length, totalPages: Math.ceil(response.length / pageSize) };
      } else if (hasMembers(response)) {
        // Old format: { members: [...], total, page, pageSize }
        members = response.members;
        pagination = {
          page: response.page ?? page,
          pageSize: response.pageSize ?? pageSize,
          total: response.total ?? response.members.length,
          totalPages: response.totalPages ?? Math.ceil((response.total ?? response.members.length) / (response.pageSize ?? pageSize)),
        };
      } else if (hasData(response)) {
        // New format: { success: true, data: [...], pagination: {...} } or { data: [...] }
        if (Array.isArray(response.data)) {
          members = response.data;
        } else if (typeof response.data === "object" && response.data !== null && "members" in response.data) {
          // If data is an object with members array inside
          const dataWithMembers = response.data as { members: StudentBooking[] };
          if (Array.isArray(dataWithMembers.members)) {
            members = dataWithMembers.members;
          } else {
            console.warn("[fetchMembers] Response.data.members is not an array:", response.data);
            members = [];
          }
        } else {
          console.warn("[fetchMembers] Response.data is not an array or object with members:", response.data);
          members = [];
        }
        
        pagination = response.pagination ?? {
          page: response.page ?? page,
          pageSize: response.pageSize ?? pageSize,
          total: response.total ?? members.length,
          totalPages: response.totalPages ?? Math.ceil((response.total ?? members.length) / (response.pageSize ?? pageSize)),
        };
      } else {
        console.warn("[fetchMembers] Unexpected response format:", response);
        members = [];
        pagination = { page, pageSize, total: 0, totalPages: 0 };
      }

      // Transform nested API response to flat structure
      const transformedMembers = transformBookings(members);

      // Debug: Log member data to check for room number and floor
      if (transformedMembers.length > 0) {
        console.log("[fetchMembers] First member sample:", JSON.stringify(transformedMembers[0], null, 2));
        console.log("[fetchMembers] First member allocatedRoomNumber:", transformedMembers[0].allocatedRoomNumber);
        console.log("[fetchMembers] First member floorNumber:", transformedMembers[0].floorNumber);
        console.log("[fetchMembers] First member keys:", Object.keys(transformedMembers[0]));
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[fetchMembers] Full response:", JSON.stringify(response, null, 2));
        console.log("[fetchMembers] Extracted members (before transform):", members);
        console.log("[fetchMembers] Transformed members:", transformedMembers);
        console.log("[fetchMembers] Members is array:", Array.isArray(transformedMembers));
        console.log("[fetchMembers] Pagination:", pagination);
      }

      set({
        members: transformedMembers,
        totalMembers: pagination.total,
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
            : "Failed to fetch members";
      set({ error: message, loading: false });
    }
  },

  updateMemberApi: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      // Backend returns { success: true, data: StudentBooking, message: string }
      const response = await apiFetch<{
        success: boolean;
        data: StudentBooking;
        message?: string;
      }>(`/members/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      // Helper to normalize status
      const normalizeStatus = (status: string): string => {
        const normalized = status.toLowerCase().trim();
        const statusMap: Record<string, string> = {
          "pending payment": "PENDING_PAYMENT",
          "pending approval": "PENDING_APPROVAL",
          "approved": "APPROVED",
          "room_allocated": "ROOM_ALLOCATED",
          "room allocated": "ROOM_ALLOCATED",
          "completed": "COMPLETED",
          "cancelled": "CANCELLED",
          "rejected": "REJECTED",
          "expired": "EXPIRED",
        };
        return statusMap[normalized] || normalized.toUpperCase().replace(/\s+/g, "_");
      };
      
      const transformed = transformBooking(response.data as any);
      const updated = {
        ...transformed,
        status: normalizeStatus(transformed.status) as StudentBooking["status"],
      };

      set((state) => {
        const currentMembers = Array.isArray(state.members) ? state.members : [];
        return {
          members: currentMembers.map((m) => (m.id === id ? updated : m)),
          selectedMember: state.selectedMember?.id === id ? updated : state.selectedMember,
          loading: false,
          error: null,
        };
      });

      return updated;
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to update member";
      set({ error: message, loading: false });
      throw err;
    }
  },

  deleteMember: async (id) => {
    set({ loading: true, error: null });
    try {
      // Backend returns { success: true, data: { success: true, message: string } }
      await apiFetch<{
        success: boolean;
        data: { success: boolean; message: string };
      }>(`/members/${id}`, {
        method: "DELETE",
      });

      set((state) => {
        const currentMembers = Array.isArray(state.members) ? state.members : [];
        return {
          members: currentMembers.filter((m) => m.id !== id),
          selectedMember: state.selectedMember?.id === id ? null : state.selectedMember,
          totalMembers: state.totalMembers - 1,
          loading: false,
          error: null,
        };
      });
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to delete member";
      set({ error: message, loading: false });
      throw err;
    }
  },
}));
