import { create } from "zustand";
import { StudentBooking } from "@/types/booking";
import { apiFetch, APIException } from "@/lib/api";
import { BookingCreateRequest } from "@/app/dashboard/components/_reusable_components/add-contact-dialog/validation";

// Helper to normalize status (API returns lowercase with spaces/underscores, normalize to uppercase with underscores for internal use)
const normalizeStatus = (status: string): string => {
  if (!status || typeof status !== 'string') {
    return status || '';
  }
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
  createBooking: (booking: BookingCreateRequest | Partial<StudentBooking>) => Promise<StudentBooking>;
  updateBookingApi: (id: string, updates: Partial<StudentBooking>) => Promise<StudentBooking>;
  deleteBooking: (id: string) => Promise<void>;
  approvePayment: (id: string) => Promise<StudentBooking>;
  approveBooking: (id: string) => Promise<StudentBooking>;
  assignRoom: (id: string, roomNumber: number) => Promise<StudentBooking>;
  completeOnboarding: (id: string) => Promise<void>;
  cancelBooking: (id: string, reason?: string) => Promise<StudentBooking>;

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
      // API expects status in lowercase with spaces/underscores (e.g., "pending payment", "room_allocated")
      // Convert from internal format (uppercase with underscores) to API format
      const getApiStatusFormat = (status: string): string => {
        const statusMap: Record<string, string> = {
          "PENDING_PAYMENT": "pending payment",
          "PENDING_APPROVAL": "pending approval",
          "APPROVED": "approved",
          "ROOM_ALLOCATED": "room_allocated",
          "COMPLETED": "completed",
          "CANCELLED": "cancelled",
          "REJECTED": "rejected",
          "EXPIRED": "expired",
        };
        return statusMap[status] || status.toLowerCase().replace(/_/g, " ");
      };

      const apiStatus = filters.status !== "all" 
        ? getApiStatusFormat(filters.status)
        : filters.status;

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && filters.status !== "all" && { status: apiStatus }),
        ...(filters.gender && filters.gender !== "all" && { gender: filters.gender }),
        ...(filters.roomType && filters.roomType !== "all" && { roomType: filters.roomType }),
      });

      // Backend may return different formats:
      // 1. { success: true, data: [...], pagination: {...} }
      // 2. { bookings: [...], total, page, pageSize }
      // 3. Direct array [...]
      const response = await apiFetch<unknown>(`/bookings?${params}`, {
        method: "GET",
      });

      // Extract bookings from various possible response formats
      let bookings: StudentBooking[] = [];
      let pagination: { page: number; pageSize: number; total: number; totalPages: number };

      // Helper to normalize status (convert old format to new format)
      const normalizeStatus = (status: string): string => {
        const statusMap: Record<string, string> = {
          "pending payment": "PENDING_PAYMENT",
          "pending approval": "PENDING_APPROVAL",
          "approved": "APPROVED",
        };
        return statusMap[status.toLowerCase()] || status;
      };

      // Type guard helpers
      const isArray = (val: unknown): val is StudentBooking[] => Array.isArray(val);
      const hasBookings = (val: unknown): val is { bookings: StudentBooking[]; total?: number; page?: number; pageSize?: number; totalPages?: number } => {
        return typeof val === "object" && val !== null && "bookings" in val && Array.isArray((val as { bookings: unknown }).bookings);
      };
      const hasData = (val: unknown): val is { success?: boolean; data: StudentBooking[] | { bookings: StudentBooking[]; total?: number; page?: number; pageSize?: number }; pagination?: { page: number; pageSize: number; total: number; totalPages: number }; page?: number; pageSize?: number; total?: number; totalPages?: number } => {
        return typeof val === "object" && val !== null && "data" in val;
      };

      if (isArray(response)) {
        // Direct array response
        bookings = response;
        pagination = { page, pageSize, total: response.length, totalPages: Math.ceil(response.length / pageSize) };
      } else if (hasBookings(response)) {
        // Old format: { bookings: [...], total, page, pageSize }
        bookings = response.bookings;
        pagination = {
          page: response.page ?? page,
          pageSize: response.pageSize ?? pageSize,
          total: response.total ?? response.bookings.length,
          totalPages: response.totalPages ?? Math.ceil((response.total ?? response.bookings.length) / (response.pageSize ?? pageSize)),
        };
      } else if (hasData(response)) {
        // New format: { success: true, data: { bookings: [...], total, page, pageSize } } or { data: [...] }
        if (Array.isArray(response.data)) {
          bookings = response.data;
          pagination = response.pagination ?? {
            page: response.page ?? page,
            pageSize: response.pageSize ?? pageSize,
            total: response.total ?? bookings.length,
            totalPages: response.totalPages ?? Math.ceil((response.total ?? bookings.length) / (response.pageSize ?? pageSize)),
          };
        } else if (typeof response.data === "object" && response.data !== null && "bookings" in response.data) {
          // New backend format: { success: true, data: { bookings: [...], total, page, pageSize } }
          const dataWithBookings = response.data as { bookings: StudentBooking[]; total?: number; page?: number; pageSize?: number };
          if (Array.isArray(dataWithBookings.bookings)) {
            bookings = dataWithBookings.bookings;
            pagination = {
              page: dataWithBookings.page ?? response.page ?? page,
              pageSize: dataWithBookings.pageSize ?? response.pageSize ?? pageSize,
              total: dataWithBookings.total ?? dataWithBookings.bookings.length,
              totalPages: response.totalPages ?? Math.ceil((dataWithBookings.total ?? dataWithBookings.bookings.length) / (dataWithBookings.pageSize ?? response.pageSize ?? pageSize)),
            };
          } else {
            console.warn("[fetchBookings] Response.data.bookings is not an array:", response.data);
            bookings = [];
            pagination = { page, pageSize, total: 0, totalPages: 0 };
          }
        } else {
          console.warn("[fetchBookings] Response.data is not an array or object with bookings:", response.data);
          bookings = [];
          pagination = { page, pageSize, total: 0, totalPages: 0 };
        }
      } else {
        console.warn("[fetchBookings] Unexpected response format:", response);
        bookings = [];
        pagination = { page, pageSize, total: 0, totalPages: 0 };
      }

      // Normalize status values in bookings (convert old format to new format)
      bookings = bookings.map((booking) => ({
        ...booking,
        status: normalizeStatus(booking.status) as StudentBooking["status"],
      }));

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
      // Debug logging in development
      if (process.env.NODE_ENV === "development") {
        console.log("[createBooking] Sending booking data:", booking);
        // Check if it's the new format (BookingCreateRequest) or old format (StudentBooking)
        if ("preferredRoomType" in booking) {
          console.log("[createBooking] Preferred room type (API format):", booking.preferredRoomType);
        } else if ("roomTitle" in booking) {
          console.log("[createBooking] Room title (UI format):", booking.roomTitle);
        }
      }

      // Backend expects preferredRoomType: "SINGLE" | "DOUBLE" in the request
      // Backend returns roomTitle: "One-in-one" | "Two-in-one" in the response
      const response = await apiFetch<{
        success: boolean;
        data: StudentBooking;
        message?: string;
      }>("/bookings", {
        method: "POST",
        body: JSON.stringify(booking),
      });

      const newBooking = {
        ...response.data,
        status: normalizeStatus(response.data.status) as StudentBooking["status"],
      };

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
      // Check if booking can be deleted (only PENDING_PAYMENT status)
      const booking = get().bookings.find((b) => b.id === id);
      const normalizedStatus = booking ? normalizeStatus(booking.status) : "";
      
      if (normalizedStatus !== "PENDING_PAYMENT") {
        throw new Error("Only bookings with 'pending payment' status can be deleted");
      }

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

      const updated = {
        ...response.data,
        status: normalizeStatus(response.data.status) as StudentBooking["status"],
      };

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

  approveBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      // Backend returns { success: true, data: StudentBooking, message: string }
      const response = await apiFetch<{
        success: boolean;
        data: StudentBooking;
        message?: string;
      }>(`/bookings/${id}/approve`, {
        method: "POST",
      });

      const updated = {
        ...response.data,
        status: normalizeStatus(response.data.status) as StudentBooking["status"],
      };

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
            : "Failed to approve booking";
      set({ error: message, loading: false });
      throw err;
    }
  },

  assignRoom: async (id, roomNumber) => {
    set({ loading: true, error: null });
    try {
      // Backend returns { success: true, data: StudentBooking, message: string }
      // Status changes to ROOM_ALLOCATED after room assignment
      const response = await apiFetch<{
        success: boolean;
        data: StudentBooking;
        message?: string;
      }>(`/bookings/${id}/assign-room`, {
        method: "PATCH",
        body: JSON.stringify({ roomNumber }),
      });

      const updated = {
        ...response.data,
        status: normalizeStatus(response.data.status) as StudentBooking["status"],
      };

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
      // Check prerequisites: status must be ROOM_ALLOCATED and room must be assigned
      const booking = get().bookings.find((b) => b.id === id);
      if (!booking) {
        throw new Error("Booking not found");
      }
      
      const normalizedStatus = normalizeStatus(booking.status);
      if (normalizedStatus !== "ROOM_ALLOCATED") {
        throw new Error("Cannot complete onboarding. Booking status must be 'room_allocated'");
      }
      
      if (!booking.allocatedRoomNumber) {
        throw new Error("Cannot complete onboarding without an assigned room");
      }

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

  cancelBooking: async (id, reason) => {
    set({ loading: true, error: null });
    try {
      // Backend returns { success: true, data: { booking: StudentBooking } }
      const options: RequestInit = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      };
      
      if (reason) {
        options.body = JSON.stringify({ reason });
      }

      const response = await apiFetch<{
        success: boolean;
        data: { booking: StudentBooking };
      }>(`/bookings/${id}/cancel`, options);

      const updated = {
        ...response.data.booking,
        status: normalizeStatus(response.data.booking.status) as StudentBooking["status"],
      };

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
            : "Failed to cancel booking";
      set({ error: message, loading: false });
      throw err;
    }
  },
}));
