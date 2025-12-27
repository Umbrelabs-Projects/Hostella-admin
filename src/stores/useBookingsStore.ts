import { create } from "zustand";
import { StudentBooking } from "@/types/booking";
import { apiFetch, APIException } from "@/lib/api";
import { BookingCreateRequest } from "@/app/dashboard/components/_reusable_components/add-contact-dialog/validation";
import { transformBooking, transformBookings } from "@/lib/transformBooking";

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
  assignRoom: (id: string, roomId: string) => Promise<StudentBooking>;
  completeOnboarding: (id: string) => Promise<void>;
  cancelBooking: (id: string, reason?: string) => Promise<void>;
  getPendingAssignments: (page?: number, limit?: number, hostelId?: string, preferredRoomType?: string) => Promise<{ items: StudentBooking[]; pagination: { total: number; page: number; limit: number; pages: number } }>;
  getSuitableRooms: (bookingId: string) => Promise<Array<{
    id: string;
    roomNumber: string;
    floorNumber: number;
    capacity: number;
    price: number;
    status: string;
    genderType: string | null;
    type: string | null;
    currentOccupants: number;
    availableSpots: number;
    occupancyStatus: "available" | "partially_available" | "full";
    colorCode: "default" | "green" | "red";
    allocatedBookings: Array<{
      id: string;
      bookingId: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        gender: string;
        studentRefNumber: string;
      };
    }>;
    images: string[];
  }>>;
  removeStudentFromRoom: (bookingId: string) => Promise<StudentBooking>;
  getBookingStats: (hostelId?: string) => Promise<{ total: number; pendingPayment: number; pendingApproval: number; approved: number; roomAllocated: number; completed: number; cancelled: number }>;

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
        limit: pageSize.toString(), // API uses 'limit' not 'pageSize'
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
        // Direct array response (legacy format)
        bookings = response;
        pagination = { page, pageSize, total: response.length, totalPages: Math.ceil(response.length / pageSize) };
      } else if (hasData(response) && typeof response.data === "object" && response.data !== null && "pagination" in response.data && "bookings" in response.data) {
        // New format: { success: true, data: { bookings: [...], pagination: {...} } }
        const dataObj = response.data as { bookings: StudentBooking[]; pagination: { page: number; limit: number; total: number; pages: number } };
        bookings = dataObj.bookings;
        pagination = {
          page: dataObj.pagination.page,
          pageSize: dataObj.pagination.limit,
          total: dataObj.pagination.total,
          totalPages: dataObj.pagination.pages,
        };
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
          // New backend format: { success: true, data: { bookings: [...], pagination: {...} } }
          const dataWithBookings = response.data as { 
            bookings: StudentBooking[]; 
            pagination?: { page: number; limit: number; total: number; pages: number };
            total?: number; 
            page?: number; 
            limit?: number;
            pages?: number;
          };
          if (Array.isArray(dataWithBookings.bookings)) {
            bookings = dataWithBookings.bookings;
            // Use pagination object if available, otherwise construct from individual fields
            if (dataWithBookings.pagination) {
              pagination = {
                page: dataWithBookings.pagination.page,
                pageSize: dataWithBookings.pagination.limit,
                total: dataWithBookings.pagination.total,
                totalPages: dataWithBookings.pagination.pages,
              };
            } else {
              pagination = {
                page: dataWithBookings.page ?? response.page ?? page,
                pageSize: dataWithBookings.limit ?? response.pageSize ?? pageSize,
                total: dataWithBookings.total ?? dataWithBookings.bookings.length,
                totalPages: dataWithBookings.pages ?? response.totalPages ?? Math.ceil((dataWithBookings.total ?? dataWithBookings.bookings.length) / (dataWithBookings.limit ?? response.pageSize ?? pageSize)),
              };
            }
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

      // Transform nested API response to flat structure and normalize status
      bookings = transformBookings(bookings).map((booking) => ({
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

      const transformed = transformBooking(response.data as any);
      const newBooking = {
        ...transformed,
        status: normalizeStatus(transformed.status) as StudentBooking["status"],
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

      const transformed = transformBooking(response.data as any);
      const updated = {
        ...transformed,
        status: normalizeStatus(transformed.status) as StudentBooking["status"],
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
            : "Failed to update booking";
      set({ error: message, loading: false });
      throw err;
    }
  },

  deleteBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      // Check if booking can be deleted (PENDING_PAYMENT or CANCELLED status)
      const booking = get().bookings.find((b) => b.id === id);
      const normalizedStatus = booking ? normalizeStatus(booking.status) : "";
      
      if (normalizedStatus !== "PENDING_PAYMENT" && normalizedStatus !== "CANCELLED") {
        throw new Error("Only bookings with 'pending payment' or 'cancelled' status can be deleted");
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
      // Try POST /bookings/:id/approve-payment first (as per docs)
      // Falls back to PATCH /payments/:id/status if POST fails
      try {
        const bookingResponse = await apiFetch<{
          success: boolean;
          data: {
            booking: {
              id: string;
              status: string;
            };
            payment: {
              id: string;
              status: string;
            };
          };
          message?: string;
        }>(`/bookings/${id}/approve-payment`, {
          method: "POST",
        });

        if (bookingResponse.success) {
          // Successfully approved using POST endpoint
          const bookingData = bookingResponse.data.booking;
          const transformed = transformBooking({
            ...(get().bookings.find((b) => b.id === id) || get().selectedBooking || {}),
            ...bookingData,
          } as any);
          const updated = {
            ...transformed,
            status: normalizeStatus(bookingData.status) as StudentBooking["status"],
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
        }
      } catch (postError) {
        // If POST endpoint doesn't exist or fails, fall back to PATCH endpoint
        console.warn("POST /bookings/:id/approve-payment failed, trying PATCH /payments/:id/status:", postError);
      }

      // Fallback: Use PATCH /payments/:id/status (unified implementation)
      // First, get the booking to find the payment ID
      let booking = get().bookings.find((b) => b.id === id) || get().selectedBooking;
      let paymentId = (booking as any)?.payment?.id;
      
      // If payment ID is not available, fetch booking details to get it
      if (!paymentId) {
        const bookingResponse = await apiFetch<{
          success?: boolean;
          data?: StudentBooking & {
            payment?: {
              id: string;
              status: string;
            };
          };
        }>(`/bookings/${id}`);
        
        const bookingData = bookingResponse.data || (bookingResponse as unknown as StudentBooking);
        paymentId = (bookingData as any)?.payment?.id;
        
        if (!paymentId) {
          throw new Error("No payment found for this booking. Payment must exist to approve it.");
        }
      }

      // Call the unified payment status endpoint (same as "Verify & Approve")
      // This confirms the payment and automatically updates booking status to "pending approval"
      const paymentResponse = await apiFetch<{
        success: boolean;
        data: {
          payment: {
            id: string;
            status: string;
            booking?: {
              id: string;
              status: string;
            };
          };
        };
        message?: string;
      }>(`/payments/${paymentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "CONFIRMED" }),
      });

      if (!paymentResponse.success) {
        throw new Error("Failed to confirm payment");
      }

      // After payment is confirmed, booking status automatically changes to "pending approval"
      // Refresh the booking to get the updated status
      const bookingResponse = await apiFetch<{
        success?: boolean;
        data?: StudentBooking;
      }>(`/bookings/${id}`);

      const bookingData = bookingResponse.data || (bookingResponse as unknown as StudentBooking);
      const transformed = transformBooking(bookingData as any);
      const updated = {
        ...transformed,
        status: normalizeStatus(transformed.status) as StudentBooking["status"],
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

      const transformed = transformBooking(response.data as any);
      const updated = {
        ...transformed,
        status: normalizeStatus(transformed.status) as StudentBooking["status"],
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

  assignRoom: async (id, roomId) => {
    set({ loading: true, error: null });
    try {
      // Backend returns { success: true, data: StudentBooking, message: string }
      // Status changes to ROOM_ALLOCATED after room assignment
      // Backend expects roomId (string) in the request body
      const response = await apiFetch<{
        success: boolean;
        data: StudentBooking;
        message?: string;
      }>(`/bookings/${id}/assign-room`, {
        method: "PATCH",
        body: JSON.stringify({ roomId }),
      });

      // Debug: Log the response to see what the backend returns
      console.log("[assignRoom] Backend response:", JSON.stringify(response, null, 2));
      console.log("[assignRoom] Response data:", response.data);
      console.log("[assignRoom] Response data keys:", Object.keys(response.data));

      // Transform nested API response to flat structure
      const transformed = transformBooking(response.data);
      
      const updated = {
        ...transformed,
        status: normalizeStatus(transformed.status) as StudentBooking["status"],
      };

      console.log("[assignRoom] Transformed booking:", {
        id: updated.id,
        allocatedRoomNumber: updated.allocatedRoomNumber,
        floorNumber: updated.floorNumber,
        status: updated.status
      });

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
      // Use the same endpoint and approach as deleteBooking
      // Backend returns { success: true, data: { success: true, message: string } }
      const options: RequestInit = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      };
      
      if (reason) {
        options.body = JSON.stringify({ reason });
      }

      await apiFetch<{
        success: boolean;
        data: { success: boolean; message: string };
      }>(`/bookings/${id}`, options);

      // Remove booking from list (same as deleteBooking)
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
            : "Failed to cancel booking";
      set({ error: message, loading: false });
      throw err;
    }
  },

  getPendingAssignments: async (page = 1, limit = 10, hostelId?, preferredRoomType?) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(hostelId && { hostelId }),
        ...(preferredRoomType && { preferredRoomType }),
      });

      const response = await apiFetch<{
        success: boolean;
        data: {
          items: StudentBooking[];
          pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
          };
        };
      }>(`/bookings/admin/pending-assignments?${params}`);

      if (response.success && response.data) {
        // Normalize status values
        const items = transformBookings(response.data.items).map((booking) => ({
          ...booking,
          status: normalizeStatus(booking.status) as StudentBooking["status"],
        }));

        set({ loading: false, error: null });
        return {
          items,
          pagination: response.data.pagination,
        };
      } else {
        throw new Error("Failed to fetch pending assignments");
      }
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to fetch pending assignments";
      set({ error: message, loading: false });
      throw err;
    }
  },

  getSuitableRooms: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      const response = await apiFetch<{
        success: boolean;
        data: {
          rooms: Array<{
            id: string;
            roomNumber: string;
            floorNumber: number;
            capacity: number;
            price: number;
            status: string;
            genderType: string | null;
            type: string | null;
            currentOccupants: number;
            availableSpots: number;
            occupancyStatus: "available" | "partially_available" | "full";
            colorCode: "default" | "green" | "red";
            allocatedBookings: Array<{
              id: string;
              bookingId: string;
              user: {
                id: string;
                firstName: string;
                lastName: string;
                gender: string;
                studentRefNumber: string;
              };
            }>;
            images: string[];
          }>;
        };
      }>(`/bookings/${bookingId}/suitable-rooms`);

      if (response.success && response.data) {
        set({ loading: false, error: null });
        return response.data.rooms;
      } else {
        throw new Error("Failed to fetch suitable rooms");
      }
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to fetch suitable rooms";
      set({ error: message, loading: false });
      throw err;
    }
  },

  removeStudentFromRoom: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      const response = await apiFetch<{
        success: boolean;
        data: {
          booking: StudentBooking;
        };
      }>(`/bookings/admin/remove-student/${bookingId}`, {
        method: "DELETE",
      });

      if (response.success && response.data) {
        const updated = {
          ...response.data.booking,
          status: normalizeStatus(response.data.booking.status) as StudentBooking["status"],
        };

        set((state) => {
          const currentBookings = Array.isArray(state.bookings) ? state.bookings : [];
          return {
            bookings: currentBookings.map((b) => (b.id === bookingId ? updated : b)),
            selectedBooking: state.selectedBooking?.id === bookingId ? updated : state.selectedBooking,
            loading: false,
            error: null,
          };
        });

        return updated;
      } else {
        throw new Error("Failed to remove student from room");
      }
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to remove student from room";
      set({ error: message, loading: false });
      throw err;
    }
  },

  getBookingStats: async (hostelId?) => {
    set({ loading: true, error: null });
    try {
      const params = hostelId ? `?hostelId=${hostelId}` : "";
      const response = await apiFetch<{
        success: boolean;
        data: {
          stats: {
            total: number;
            pendingPayment: number;
            pendingApproval: number;
            approved: number;
            roomAllocated: number;
            completed: number;
            cancelled: number;
          };
        };
      }>(`/bookings/stats/summary${params}`);

      if (response.success && response.data) {
        set({ loading: false, error: null });
        return response.data.stats;
      } else {
        throw new Error("Failed to fetch booking statistics");
      }
    } catch (err) {
      const message =
        err instanceof APIException
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to fetch booking statistics";
      set({ error: message, loading: false });
      throw err;
    }
  },
}));
