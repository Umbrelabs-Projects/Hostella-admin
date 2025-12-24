import { create } from "zustand";
import { apiFetch } from "@/lib/api";

export interface PaymentReceipt {
  id: string;
  bookingId: string;
  amount: number;
  provider: "BANK_TRANSFER" | "PAYSTACK";
  status: "AWAITING_VERIFICATION" | "CONFIRMED" | "FAILED" | "REFUNDED";
  receiptUrl?: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  booking?: {
    id: string;
    bookingId: string;
    status: string;
    hostelId?: string;
    roomTitle?: string;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      studentId?: string;
      studentRefNumber?: string;
    };
    hostel?: {
      id: string;
      name: string;
      location?: string;
      campus?: string;
    };
  };
}

export interface PaymentPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface PaymentsState {
  pendingReceipts: PaymentReceipt[];
  loading: boolean;
  error: string | null;
  pagination: PaymentPagination | null;
  currentPage: number;
  pageSize: number;
  
  // Actions
  fetchPendingReceipts: (page?: number, limit?: number) => Promise<void>;
  verifyPayment: (paymentId: string, status: "CONFIRMED" | "FAILED") => Promise<void>;
  clearError: () => void;
}

export const usePaymentsStore = create<PaymentsState>((set, get) => ({
  pendingReceipts: [],
  loading: false,
  error: null,
  pagination: null,
  currentPage: 1,
  pageSize: 10,

  fetchPendingReceipts: async (page = 1, limit = 10) => {
    set({ loading: true, error: null, currentPage: page, pageSize: limit });
    try {
      const response = await apiFetch<{
        success: boolean;
        data?: PaymentReceipt[] | { items: PaymentReceipt[]; pagination?: PaymentPagination };
        items?: PaymentReceipt[];
        pagination?: PaymentPagination;
      }>(`/payments/admin/pending-receipts?page=${page}&limit=${limit}`);

      // Handle different response formats
      let receipts: PaymentReceipt[] = [];
      let paginationData: PaymentPagination | null = null;

      if (response.success) {
        // Format 1: { success: true, data: { items: [...], pagination: {...} } }
        if (response.data && typeof response.data === "object" && "items" in response.data) {
          receipts = Array.isArray(response.data.items) ? response.data.items : [];
          paginationData = response.data.pagination || null;
        }
        // Format 2: { success: true, data: [...] }
        else if (Array.isArray(response.data)) {
          receipts = response.data;
          paginationData = response.pagination || null;
        }
        // Format 3: { success: true, items: [...], pagination: {...} }
        else if (Array.isArray(response.items)) {
          receipts = response.items;
          paginationData = response.pagination || null;
        }
      }

      set({
        pendingReceipts: Array.isArray(receipts) ? receipts : [],
        pagination: paginationData,
        loading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch pending receipts";
      set({ 
        error: errorMessage, 
        loading: false,
        pendingReceipts: [], // Ensure it's always an array
      });
    }
  },

  verifyPayment: async (paymentId: string, status: "CONFIRMED" | "FAILED") => {
    set({ loading: true, error: null });
    try {
      // Get the payment object to find the booking ID before API call
      const { pendingReceipts } = get();
      const paymentBefore = pendingReceipts.find((p) => p.id === paymentId);

      const response = await apiFetch<{
        success: boolean;
        data: {
          payment: PaymentReceipt;
        };
        message?: string;
      }>(`/payments/${paymentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      if (response.success) {
        // Get booking ID from response or original payment object
        const verifiedPayment = response.data.payment;
        // Try to get internal booking ID first, then fallback to display bookingId
        let bookingId = verifiedPayment?.booking?.id || paymentBefore?.booking?.id;
        const displayBookingId = verifiedPayment?.booking?.bookingId || verifiedPayment?.bookingId || paymentBefore?.booking?.bookingId || paymentBefore?.bookingId;

        // Remove verified payment from pending list
        set({
          pendingReceipts: pendingReceipts.filter((p) => p.id !== paymentId),
          loading: false,
        });

        // If payment was confirmed, also approve payment on the booking
        // This changes booking status from PENDING_PAYMENT to PENDING_APPROVAL
        if (status === "CONFIRMED" && typeof window !== "undefined") {
          try {
            // Dynamically import to avoid circular dependency
            const { useBookingsStore } = await import("./useBookingsStore");
            const { approvePayment, fetchBookings, bookings } = useBookingsStore.getState();
            
            // If we don't have the internal ID, try to find booking by display bookingId
            if (!bookingId && displayBookingId) {
              // First check if bookings are already loaded
              let foundBooking = bookings.find(
                (b) => b.bookingId === displayBookingId || b.id === displayBookingId
              );
              
              // If not found and bookings might not be loaded, fetch them first
              if (!foundBooking && bookings.length === 0) {
                await fetchBookings();
                const { bookings: refreshedBookings } = useBookingsStore.getState();
                foundBooking = refreshedBookings.find(
                  (b) => b.bookingId === displayBookingId || b.id === displayBookingId
                );
              }
              
              if (foundBooking) {
                bookingId = foundBooking.id;
              }
            }
            
            // If we have the booking ID, approve payment on the booking
            if (bookingId) {
              // Approve payment on the booking (changes status to PENDING_APPROVAL)
              await approvePayment(bookingId);
            } else {
              console.warn("Could not find booking ID for payment approval. Display ID:", displayBookingId);
            }
            
            // Always refresh bookings list to reflect any status changes
            fetchBookings().catch((err) => {
              console.warn("Failed to refresh bookings after payment approval:", err);
            });
          } catch (bookingErr) {
            // If booking approval fails, log but don't fail the payment verification
            console.warn("Failed to approve payment on booking after verification:", bookingErr);
            // Still refresh bookings to get latest state
            const { useBookingsStore } = await import("./useBookingsStore");
            const { fetchBookings } = useBookingsStore.getState();
            fetchBookings().catch((err) => {
              console.warn("Failed to refresh bookings:", err);
            });
          }
        }
      } else {
        set({ error: "Failed to verify payment", loading: false });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to verify payment";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

