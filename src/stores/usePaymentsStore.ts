import { create } from "zustand";
import { apiFetch } from "@/lib/api";

export interface PaymentReceipt {
  id: string;
  bookingId: string;
  amount: number;
  provider: "BANK_TRANSFER" | "PAYSTACK";
  status: "INITIATED" | "AWAITING_VERIFICATION" | "CONFIRMED" | "FAILED" | "REFUNDED";
  receiptUrl?: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  payerPhone?: string;
  verificationData?: {
    status?: string;
    gateway_response?: string;
    channel?: string;
    authorization?: {
      channel?: string;
      mobile_money_number?: string;
    };
  };
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
  fetchPayments: (filters?: {
    provider?: "PAYSTACK" | "BANK_TRANSFER";
    status?: "INITIATED" | "AWAITING_VERIFICATION" | "CONFIRMED" | "FAILED";
    page?: number;
    limit?: number;
  }) => Promise<PaymentReceipt[]>;
  fetchPaymentByBookingId: (bookingId: string) => Promise<PaymentReceipt | null>;
  fetchPaymentDetails: (paymentId: string) => Promise<PaymentReceipt>;
  verifyPayment: (paymentId: string, status: "CONFIRMED" | "FAILED") => Promise<void>;
  verifyPaystackPayment: (reference: string) => Promise<{
    success: boolean;
    data: {
      paystackVerification: {
        status: boolean;
        data: {
          status: string;
          gateway_response?: string;
          channel?: string;
          reference?: string;
          amount?: number;
          authorization?: {
            channel: string;
            mobile_money_number?: string;
          };
        };
      };
      paymentUpdate?: {
        payment: {
          id: string;
          status: string;
          reference: string;
          amount: number;
          provider: string;
        };
        booking: {
          id: string;
          status: string;
        };
      };
    };
  }>;
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
      // Use new unified endpoint for bank transfers
      // Get bank transfers awaiting verification
      const bankResponse = await apiFetch<{
        success: boolean;
        data?: {
          items: PaymentReceipt[];
          pagination?: PaymentPagination;
        };
        items?: PaymentReceipt[];
        pagination?: PaymentPagination;
      }>(`/payments?provider=BANK_TRANSFER&status=AWAITING_VERIFICATION&page=${page}&limit=${limit}`);

      // Get Paystack payments that need verification (INITIATED and AWAITING_VERIFICATION)
      const paystackInitiatedResponse = await apiFetch<{
        success: boolean;
        data?: {
          items: PaymentReceipt[];
          pagination?: PaymentPagination;
        };
        items?: PaymentReceipt[];
        pagination?: PaymentPagination;
      }>(`/payments?provider=PAYSTACK&status=INITIATED&page=${page}&limit=${limit}`);

      const paystackAwaitingResponse = await apiFetch<{
        success: boolean;
        data?: {
          items: PaymentReceipt[];
          pagination?: PaymentPagination;
        };
        items?: PaymentReceipt[];
        pagination?: PaymentPagination;
      }>(`/payments?provider=PAYSTACK&status=AWAITING_VERIFICATION&page=${page}&limit=${limit}`);

      // Helper function to extract items from response
      const extractItems = (response: any): PaymentReceipt[] => {
        if (!response.success) return [];
        if (response.data && typeof response.data === "object" && "items" in response.data) {
          return Array.isArray(response.data.items) ? response.data.items : [];
        }
        if (Array.isArray(response.items)) {
          return response.items;
        }
        if (Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      };

      // Combine all pending payments
      const bankReceipts = extractItems(bankResponse);
      const paystackInitiated = extractItems(paystackInitiatedResponse);
      const paystackAwaiting = extractItems(paystackAwaitingResponse);
      
      const allReceipts = [...bankReceipts, ...paystackInitiated, ...paystackAwaiting];

      // Get pagination from the first response (or combine if needed)
      let paginationData: PaymentPagination | null = null;
      if (bankResponse.data && typeof bankResponse.data === "object" && "pagination" in bankResponse.data) {
        paginationData = bankResponse.data.pagination || null;
      } else if (bankResponse.pagination) {
        paginationData = bankResponse.pagination;
      }

      set({
        pendingReceipts: allReceipts,
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

  fetchPayments: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.provider) params.append("provider", filters.provider);
      if (filters.status) params.append("status", filters.status);
      params.append("page", (filters.page || 1).toString());
      params.append("limit", (filters.limit || 50).toString());

      const response = await apiFetch<{
        success: boolean;
        data?: {
          items: PaymentReceipt[];
          pagination?: PaymentPagination;
        };
        items?: PaymentReceipt[];
        pagination?: PaymentPagination;
      }>(`/payments?${params.toString()}`);

      let payments: PaymentReceipt[] = [];

      if (response.success) {
        if (response.data && typeof response.data === "object" && "items" in response.data) {
          payments = Array.isArray(response.data.items) ? response.data.items : [];
        } else if (Array.isArray(response.items)) {
          payments = response.items;
        } else if (Array.isArray(response.data)) {
          payments = response.data;
        }
      }

      set({ loading: false });
      return payments;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch payments";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  fetchPaymentByBookingId: async (bookingId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiFetch<{
        success: boolean;
        data?: {
          payment: PaymentReceipt;
        };
        payment?: PaymentReceipt;
      }>(`/payments/booking/${bookingId}`);

      if (response.success) {
        const payment = response.data?.payment || response.payment;
        set({ loading: false });
        return payment || null;
      } else {
        set({ loading: false });
        return null;
      }
    } catch (err) {
      // If payment not found, return null (not an error)
      set({ loading: false });
      return null;
    }
  },

  fetchPaymentDetails: async (paymentId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiFetch<{
        success: boolean;
        data: {
          payment: PaymentReceipt;
        };
      }>(`/payments/${paymentId}`);

      if (response.success) {
        set({ loading: false });
        return response.data.payment;
      } else {
        throw new Error("Failed to fetch payment details");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch payment details";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  verifyPaystackPayment: async (reference: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiFetch<{
        success: boolean;
        data: {
          paystackVerification: {
            status: boolean;
            data: {
              status: string;
              gateway_response?: string;
              channel?: string;
              reference?: string;
              amount?: number;
              authorization?: {
                channel: string;
                mobile_money_number?: string;
              };
            };
          };
          paymentUpdate?: {
            payment: {
              id: string;
              status: string;
              reference: string;
              amount: number;
              provider: string;
            };
            booking: {
              id: string;
              status: string;
            };
          };
        };
      }>(`/payments/verify/paystack/${reference}`);

      set({ loading: false });
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to verify Paystack payment";
      set({ error: errorMessage, loading: false });
      throw err;
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

        // If payment was confirmed, refresh bookings to reflect status change
        // According to the guide: When payment status is updated to "CONFIRMED", 
        // booking status automatically changes to "pending approval" (backend handles this)
        // 
        // Note: "Verify & Approve" (PATCH /payments/:id/status) and "Approve Payment" 
        // (POST /bookings/:id/approve-payment) perform similar functions:
        // - Both confirm the payment if it's AWAITING_VERIFICATION
        // - Both update booking status to "pending approval"
        // - They use different endpoints but achieve the same result
        if (status === "CONFIRMED" && typeof window !== "undefined") {
          try {
            // Dynamically import to avoid circular dependency
            const { useBookingsStore } = await import("./useBookingsStore");
            const { fetchBookings } = useBookingsStore.getState();
            
            // Refresh bookings list to reflect the automatic status change
            // The backend automatically updates booking status to "pending approval" when payment is confirmed
            // This ensures the booking dialog will show the updated status (polling will also catch it)
            await fetchBookings();
          } catch (err) {
            // Log but don't fail payment verification
            console.warn("Failed to refresh bookings after payment confirmation:", err);
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

