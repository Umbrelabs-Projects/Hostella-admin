"use client";

import { useEffect, useState } from "react";
import { usePaymentsStore } from "@/stores/usePaymentsStore";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentNotificationCard from "./_components/PaymentNotificationCard";
import PaymentsHeader from "./_components/PaymentsHeader";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useBookingsStore } from "@/stores/useBookingsStore";

export default function PaymentsPage() {
  const {
    pendingReceipts,
    loading,
    error,
    pagination,
    currentPage,
    pageSize,
    fetchPendingReceipts,
    verifyPayment,
    clearError,
  } = usePaymentsStore();

  const { fetchBookings } = useBookingsStore();
  const [activeTab, setActiveTab] = useState<"all" | "bank" | "paystack">("all");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load bookings when page loads so payment cards can access booking details
  useEffect(() => {
    fetchBookings().catch(() => {
      // Silently fail - bookings might not be available
    });
  }, [fetchBookings]);

  // Filter payments by type - ensure pendingReceipts is always an array
  const receiptsArray = Array.isArray(pendingReceipts) ? pendingReceipts : [];
  const bankReceipts = receiptsArray.filter(
    (p) => p.provider === "BANK_TRANSFER"
  );
  const paystackPayments = receiptsArray.filter(
    (p) => p.provider === "PAYSTACK"
  );

  const displayedPayments =
    activeTab === "bank"
      ? bankReceipts
      : activeTab === "paystack"
      ? paystackPayments
      : receiptsArray;

  useEffect(() => {
    const loadPayments = async () => {
      await fetchPendingReceipts(1, 20);
      setIsInitialized(true);
    };
    loadPayments();
  }, [fetchPendingReceipts]);

  const handleVerifyPayment = async (
    paymentId: string,
    status: "CONFIRMED" | "FAILED"
  ) => {
    try {
      await verifyPayment(paymentId, status);
      toast.success(
        status === "CONFIRMED"
          ? "Payment verified and approved successfully"
          : "Payment rejected",
        { duration: 4000 }
      );
      // Refresh bookings to update status
      await fetchBookings();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to verify payment",
        { duration: 4000 }
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchPendingReceipts(newPage, pageSize);
  };

  return (
    <main className="p-3 md:px-6" data-testid="payments-container">
      <div className="mx-auto">
        <h1 className="sr-only">Payment Notifications</h1>
        <PaymentsHeader
          totalCount={pagination?.total || 0}
          bankCount={bankReceipts.length}
          paystackCount={paystackPayments.length}
        />

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={clearError}
                className="text-sm font-medium text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mt-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">
              All ({receiptsArray.length})
            </TabsTrigger>
            <TabsTrigger value="bank">
              Bank Receipts ({bankReceipts.length})
            </TabsTrigger>
            <TabsTrigger value="paystack">
              Paystack ({paystackPayments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading && !isInitialized ? (
              <TableSkeleton rows={5} />
            ) : displayedPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-6 mb-4">
                  <svg
                    className="size-12 text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  No Payment Notifications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  {activeTab === "all"
                    ? "There are no pending payment notifications at this time."
                    : activeTab === "bank"
                    ? "No bank transfer receipts are awaiting verification."
                    : "No Paystack payments are awaiting verification."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedPayments.map((payment) => (
                  <PaymentNotificationCard
                    key={payment.id}
                    payment={payment}
                    onVerify={handleVerifyPayment}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, pagination.total)} of{" "}
              {pagination.total} payments
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  handlePageChange(
                    Math.min(pagination.pages, currentPage + 1)
                  )
                }
                disabled={currentPage >= pagination.pages || loading}
                className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

