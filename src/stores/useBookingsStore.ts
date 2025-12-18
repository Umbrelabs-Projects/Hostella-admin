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
    gender: "all",
    roomType: "all",
  },

  // --- Basic State Actions ---
  setBookings: (b: StudentBooking[]) => set({ bookings: Array.isArray(b) ? b : [] }),
  setSelectedBooking: (b: StudentBooking | null) => set({ selectedBooking: b }),
  updateBooking: (u: StudentBooking) =>
    set((state) => {
      const currentBookings = Array.isArray(state.bookings) ? state.bookings : [];
      return {
        bookings: currentBookings.map((b) => (b.id === u.id ? u : b)),
        selectedBooking: state.selectedBooking?.id === u.id ? u : state.selectedBooking,
      };
    }),
  removeBooking: (id: string) =>
    set((state) => {
      const currentBookings = Array.isArray(state.bookings) ? state.bookings : [];
      return {
        bookings: currentBookings.filter((b) => b.id !== id),
        selectedBooking: state.selectedBooking?.id === id ? null : state.selectedBooking,
      };
    }),
  addBooking: (b: StudentBooking) =>
    set((state) => {
      const currentBookings = Array.isArray(state.bookings) ? state.bookings : [];
      return {
        bookings: [...currentBookings, b],
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
  fetchBookings: async (page = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && filters.status !== "all" && { status: filters.status }),
        ...(filters.gender && filters.gender !== "all" && { gender: filters.gender }),
        ...(filters.roomType && filters.roomType !== "all" && { roomType: filters.roomType }),
      });

      // Backend may return different formats:
      // 1. { success: true, data: [...], pagination: {...} }
      // 2. { bookings: [...], total, page, pageSize }
      // 3. Direct array [...]
      const response = await apiFetch<any>(`/bookings?${params}`, {
        method: "GET",
      });

      // Extract bookings from various possible response formats
      let bookings: StudentBooking[] = [];
      let pagination: { page: number; pageSize: number; total: number; totalPages: number };

      if (Array.isArray(response)) {
        // Direct array response
        bookings = response;
        pagination = { page, pageSize, total: response.length, totalPages: Math.ceil(response.length / pageSize) };
      } else if (response.bookings && Array.isArray(response.bookings)) {
        // Old format: { bookings: [...], total, page, pageSize }
        bookings = response.bookings;
        pagination = {
          page: response.page ?? page,
          pageSize: response.pageSize ?? pageSize,
          total: response.total ?? response.bookings.length,
          totalPages: response.totalPages ?? Math.ceil((response.total ?? response.bookings.length) / (response.pageSize ?? pageSize)),
        };
      } else if (response.data) {
        // New format: { success: true, data: [...], pagination: {...} }
        if (Array.isArray(response.data)) {
          bookings = response.data;
        } else if (typeof response.data === "object" && response.data !== null) {
          // If data is an object, check if it has a bookings array inside
          if (Array.isArray(response.data.bookings)) {
            bookings = response.data.bookings;
          } else {
            console.warn("[fetchBookings] Response.data is an object but not an array:", response.data);
            bookings = [];
          }
        } else {
          console.warn("[fetchBookings] Response.data is not an array:", response.data);
          bookings = [];
        }
        pagination = response.pagination ?? {
          page: response.page ?? page,
          pageSize: response.pageSize ?? pageSize,
          total: response.total ?? bookings.length,
          totalPages: response.totalPages ?? Math.ceil((response.total ?? bookings.length) / (response.pageSize ?? pageSize)),
        };
      } else {
        console.warn("[fetchBookings] Unexpected response format:", response);
        bookings = [];
        pagination = { page, pageSize, total: 0, totalPages: 0 };
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[fetchBookings] Full response:", JSON.stringify(response, null, 2));
        console.log("[fetchBookings] Extracted bookings:", bookings);
        console.log("[fetchBookings] Bookings is array:", Array.isArray(bookings));
        console.log("[fetchBookings] Pagination:", pagination);
      }

      set({
        bookings,
        totalBookings: pagination.total,
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
            : "Failed to fetch bookings";
      set({ error: message, loading: false });
    }
  },

  createBooking: async (booking) => {
    set({ loading: true, error: null });
    try {
      // Backend returns { success: true, data: StudentBooking, message: string }
      const response = await apiFetch<{
        success: boolean;
        data: StudentBooking;
        message?: string;
      }>("/bookings", {
        method: "POST",
        body: JSON.stringify(booking),
      });

      const newBooking = response.data;

      // Ensure bookings is always an array before updating
      set((state) => {
        const currentBookings = Array.isArray(state.bookings) ? state.bookings : [];
        return {
          bookings: [newBooking, ...currentBookings],
          totalBookings: state.totalBookings + 1,
          loading: false,
          error: null,
        };
      });

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
      // Backend returns { success: true, data: StudentBooking, message: string }
      const response = await apiFetch<{
        success: boolean;
        data: StudentBooking;
        message?: string;
      }>(`/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      const updated = response.data;

      set((state) => {
        const currentBookings = Array.isArray(state.bookings) ? state.bookings : [];
        return {
          bookings: currentBookings.map((b) => (b.id === id ? updated : b)),
          selectedBooking: state.selectedBooking?.id === id ? updated : state.selectedBooking,
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
            : "Failed to update booking";
      set({ error: message, loading: false });
      throw err;
    }
  },

  deleteBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      // Backend returns { success: true, data: { success: true, message: string } }
      await apiFetch<{
        success: boolean;
        data: { success: boolean; message: string };
      }>(`/bookings/${id}`, {
        method: "DELETE",
      });

      set((state) => {
        const currentBookings = Array.isArray(state.bookings) ? state.bookings : [];
        return {
          bookings: currentBookings.filter((b) => b.id !== id),
          selectedBooking: state.selectedBooking?.id === id ? null : state.selectedBooking,
          totalBookings: state.totalBookings - 1,
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
            : "Failed to delete booking";
      set({ error: message, loading: false });
      throw err;
    }
  },

  approvePayment: async (id) => {
    set({ loading: true, error: null });
    try {
      // Backend returns { success: true, data: StudentBooking, message: string }
      const response = await apiFetch<{
        success: boolean;
        data: StudentBooking;
        message?: string;
      }>(`/bookings/${id}/approve-payment`, {
        method: "POST",
      });

      const updated = response.data;

      set((state) => {
        const currentBookings = Array.isArray(state.bookings) ? state.bookings : [];
        return {
          bookings: currentBookings.map((b) => (b.id === id ? updated : b)),
          selectedBooking: state.selectedBooking?.id === id ? updated : state.selectedBooking,
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
            : "Failed to approve payment";
      set({ error: message, loading: false });
      throw err;
    }
  },

  assignRoom: async (id, roomNumber) => {
    set({ loading: true, error: null });
    try {
      // Backend returns { success: true, data: StudentBooking, message: string }
      // Note: Method is PATCH (not POST) as per backend update
      const response = await apiFetch<{
        success: boolean;
        data: StudentBooking;
        message?: string;
      }>(`/bookings/${id}/assign-room`, {
        method: "PATCH",
        body: JSON.stringify({ roomNumber }),
      });

      const updated = response.data;

      set((state) => {
        const currentBookings = Array.isArray(state.bookings) ? state.bookings : [];
        return {
          bookings: currentBookings.map((b) => (b.id === id ? updated : b)),
          selectedBooking: state.selectedBooking?.id === id ? updated : state.selectedBooking,
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
            : "Failed to assign room";
      set({ error: message, loading: false });
      throw err;
    }
  },

  completeOnboarding: async (id) => {
    set({ loading: true, error: null });
    try {
      // Backend returns { success: true, data: { success: true, message: string } }
      await apiFetch<{
        success: boolean;
        data: { success: boolean; message: string };
      }>(`/bookings/${id}/complete-onboarding`, {
        method: "POST",
      });

      set((state) => {
        const currentBookings = Array.isArray(state.bookings) ? state.bookings : [];
        return {
          bookings: currentBookings.filter((b) => b.id !== id),
          selectedBooking: state.selectedBooking?.id === id ? null : state.selectedBooking,
          totalBookings: state.totalBookings - 1,
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
            : "Failed to complete onboarding";
      set({ error: message, loading: false });
      throw err;
    }
  },
}));
