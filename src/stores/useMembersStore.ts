import { create } from "zustand";
import { StudentBooking } from "@/types/booking";
import { apiFetch, APIException } from "@/lib/api";

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
  setMembers: (m: StudentBooking[]) => set({ members: m }),
  setSelectedMember: (m: StudentBooking | null) => set({ selectedMember: m }),
  updateMember: (u: StudentBooking) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === u.id ? u : m)),
      selectedMember: state.selectedMember?.id === u.id ? u : state.selectedMember,
    })),
  addMember: (m: StudentBooking) =>
    set((state) => ({
      members: state.members.find((x) => x.id === m.id) ? state.members : [...state.members, m],
    })),
  removeMember: (id: string) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
      selectedMember: state.selectedMember?.id === id ? null : state.selectedMember,
    })),

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
        ...(filters.status !== "all" && { status: filters.status }),
      });

      const response = await apiFetch<
        | { members: StudentBooking[]; total: number; page: number; pageSize: number }
        | { data: StudentBooking[]; total: number; page: number; pageSize: number }
      >(`/members?${params}`, {
        method: "GET",
      });

      const members = "members" in response ? response.members : response.data;
      const total = response.total ?? 0;
      const curPage = response.page ?? page;
      const size = response.pageSize ?? pageSize;

      set({
        members,
        totalMembers: total,
        currentPage: curPage,
        pageSize: size,
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
      const updated = await apiFetch<StudentBooking>(`/members/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      set((state) => ({
        members: state.members.map((m) => (m.id === id ? updated : m)),
        selectedMember: state.selectedMember?.id === id ? updated : state.selectedMember,
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
            : "Failed to update member";
      set({ error: message, loading: false });
      throw err;
    }
  },

  deleteMember: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiFetch(`/members/${id}`, {
        method: "DELETE",
      });

      set((state) => ({
        members: state.members.filter((m) => m.id !== id),
        selectedMember: state.selectedMember?.id === id ? null : state.selectedMember,
        loading: false,
        error: null,
      }));
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
