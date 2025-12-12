import { create } from "zustand";
import { StudentBooking } from "@/types/booking";
import { apiFetch, APIException } from "@/lib/api";

export type BookingsState = {
  bookings: StudentBooking[];
  selectedBooking: StudentBooking | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalBookings: number;
  filters: {
    search: string;
    status: string;
    gender?: string;
    roomType?: string;
  };

  // Actions
  setBookings: (b: StudentBooking[]) => void;
  setSelectedBooking: (b: StudentBooking | null) => void;
  updateBooking: (u: StudentBooking) => void;
  removeBooking: (id: string) => void;
  addBooking: (b: StudentBooking) => void;

  // API Actions
  fetchBookings: (page?: number, pageSize?: number) => Promise<void>;
  createBooking: (booking: Partial<StudentBooking>) => Promise<StudentBooking>;
  updateBookingApi: (id: string, updates: Partial<StudentBooking>) => Promise<StudentBooking>;
  deleteBooking: (id: string) => Promise<void>;
  approvePayment: (id: string) => Promise<StudentBooking>;
  assignRoom: (id: string, roomNumber: number) => Promise<StudentBooking>;
  completeOnboarding: (id: string) => Promise<void>;

  // Pagination & Filter Actions
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilters: (filters: Partial<BookingsState["filters"]>) => void;
  clearError: () => void;
};

export const useBookingsStore = create<BookingsState>((set, get) => ({
  // Initial state
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  totalBookings: 0,
  filters: {
    search: "",
    status: "all",
    gender: undefined,
    roomType: undefined,
  },

  // --- Basic State Actions ---
  setBookings: (b: StudentBooking[]) => set({ bookings: b }),
  setSelectedBooking: (b: StudentBooking | null) => set({ selectedBooking: b }),
  updateBooking: (u: StudentBooking) =>
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === u.id ? u : b)),
      selectedBooking: state.selectedBooking?.id === u.id ? u : state.selectedBooking,
    })),
  removeBooking: (id: string) =>
    set((state) => ({
      bookings: state.bookings.filter((b) => b.id !== id),
      selectedBooking: state.selectedBooking?.id === id ? null : state.selectedBooking,
    })),
  addBooking: (b: StudentBooking) =>
    set((state) => ({
      bookings: [...state.bookings, b],
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
  fetchBookings: async (page = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.gender !== "all" && { gender: filters.gender }),
        ...(filters.roomType !== "all" && { roomType: filters.roomType }),
      });

      const response = await apiFetch<
        | { bookings: StudentBooking[]; total: number; page: number; pageSize: number }
        | { data: StudentBooking[]; total: number; page: number; pageSize: number }
      >(`/bookings?${params}`, {
        method: "GET",
      });

      const bookings = "bookings" in response ? response.bookings : response.data;
      const total = response.total ?? 0;
      const curPage = response.page ?? page;
      const size = response.pageSize ?? pageSize;

      set({
        bookings,
        totalBookings: total,
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
            : "Failed to fetch bookings";
      set({ error: message, loading: false });
    }
  },

  createBooking: async (booking) => {
    set({ loading: true, error: null });
    try {
      const newBooking = await apiFetch<StudentBooking>("/bookings", {
        method: "POST",
        body: JSON.stringify(booking),
      });

      set((state) => ({
        bookings: [...state.bookings, newBooking],
        loading: false,
        error: null,
      }));

      return newBooking;
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to create booking";
      set({ error: message, loading: false });
      throw err;
    }
  },

  updateBookingApi: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updated = await apiFetch<StudentBooking>(`/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? updated : b)),
        selectedBooking: state.selectedBooking?.id === id ? updated : state.selectedBooking,
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
            : "Failed to update booking";
      set({ error: message, loading: false });
      throw err;
    }
  },

  deleteBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiFetch(`/bookings/${id}`, {
        method: "DELETE",
      });

      set((state) => ({
        bookings: state.bookings.filter((b) => b.id !== id),
        selectedBooking: state.selectedBooking?.id === id ? null : state.selectedBooking,
        loading: false,
        error: null,
      }));
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to delete booking";
      set({ error: message, loading: false });
      throw err;
    }
  },

  approvePayment: async (id) => {
    set({ loading: true, error: null });
    try {
      const updated = await apiFetch<StudentBooking>(
        `/bookings/${id}/approve-payment`,
        {
          method: "POST",
        }
      );

      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? updated : b)),
        selectedBooking: state.selectedBooking?.id === id ? updated : state.selectedBooking,
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
            : "Failed to approve payment";
      set({ error: message, loading: false });
      throw err;
    }
  },

  assignRoom: async (id, roomNumber) => {
    set({ loading: true, error: null });
    try {
      const updated = await apiFetch<StudentBooking>(`/bookings/${id}/assign-room`, {
        method: "PATCH",
        body: JSON.stringify({ roomNumber }),
      });

      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? updated : b)),
        selectedBooking: state.selectedBooking?.id === id ? updated : state.selectedBooking,
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
            : "Failed to assign room";
      set({ error: message, loading: false });
      throw err;
    }
  },

  completeOnboarding: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiFetch(`/bookings/${id}/complete-onboarding`, {
        method: "POST",
      });

      set((state) => ({
        bookings: state.bookings.filter((b) => b.id !== id),
        selectedBooking: state.selectedBooking?.id === id ? null : state.selectedBooking,
        loading: false,
        error: null,
      }));
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to complete onboarding";
      set({ error: message, loading: false });
      throw err;
    }
  },
}));
