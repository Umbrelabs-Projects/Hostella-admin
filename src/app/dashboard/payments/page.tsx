"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePaymentsStore, PaymentReceipt } from "@/stores/usePaymentsStore";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentNotificationCard from "./_components/PaymentNotificationCard";
import PaymentsHeader from "./_components/PaymentsHeader";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useBookingsStore } from "@/stores/useBookingsStore";

export default function PaymentsPage() {
  const router = useRouter();
  const {
    pendingReceipts,
    loading,
    // error,
    pagination,
    currentPage,
    pageSize,
    fetchPendingReceipts,
    // fetchPayments,
    verifyPayment,
    // clearError,
  } = usePaymentsStore();

  const { fetchBookings } = useBookingsStore();
  const [activeTab, setActiveTab] = useState<"all" | "bank" | "paystack">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "INITIATED" | "AWAITING_VERIFICATION" | "CONFIRMED">("all");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load bookings when page loads so payment cards can access booking details
  useEffect(() => {
    fetchBookings().catch(() => {
      // Silently fail - bookings might not be available
    });
  }, [fetchBookings]);

  // Filter payments by type - ensure pendingReceipts is always an array
  // fetchPendingReceipts now uses the new /payments endpoint and includes all pending payments
  const receiptsArray = Array.isArray(pendingReceipts) ? pendingReceipts : [];
  const allPayments = receiptsArray;

  const bankReceipts = allPayments.filter(
    (p) => p.provider === "BANK_TRANSFER"
  );
  const paystackPayments = allPayments.filter(
    (p) => p.provider === "PAYSTACK"
  );

  // Filter by status if needed
  const filterByStatus = (payments: PaymentReceipt[]) => {
    if (statusFilter === "all") return payments;
    return payments.filter((p) => p.status === statusFilter);
  };

  // Get INITIATED payments count (urgent - need verification)
  const initiatedPayments = paystackPayments.filter((p) => p.status === "INITIATED");
  const initiatedCount = initiatedPayments.length;

  const displayedPayments = filterByStatus(
    activeTab === "bank"
      ? bankReceipts
      : activeTab === "paystack"
      ? paystackPayments
      : receiptsArray
  );

  useEffect(() => {
    const loadPayments = async () => {
      // Use the unified fetchPendingReceipts which now uses the new /payments endpoint
      // It fetches both bank transfers and Paystack payments (INITIATED and AWAITING_VERIFICATION)
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
      
      // Refresh payments list to remove verified payment
      // Use the new unified endpoint which fetches all pending payments
      await fetchPendingReceipts(currentPage, pageSize);
      
      // Navigate to bookings page after successful verification (only for CONFIRMED)
      if (status === "CONFIRMED") {
        // Small delay to let user see the toast
        setTimeout(() => {
          router.push("/dashboard/bookings");
        }, 500);
      }
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

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">
                All ({allPayments.length})
              </TabsTrigger>
              <TabsTrigger value="bank">
                Bank Receipts ({bankReceipts.length})
              </TabsTrigger>
              <TabsTrigger value="paystack">
                Paystack ({paystackPayments.length})
                {initiatedCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-red-500 text-white">
                    {initiatedCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Status Filter - Only show for Paystack tab */}
            {activeTab === "paystack" && (
              <div className="flex gap-2 items-center">
                <label className="text-sm text-gray-600 dark:text-gray-400">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Statuses</option>
                  <option value="INITIATED">
                    Initiated ({initiatedCount}) ⚠️
                  </option>
                  <option value="AWAITING_VERIFICATION">Awaiting Verification</option>
                  <option value="CONFIRMED">Confirmed</option>
                </select>
              </div>
            )}
          </div>

          <TabsContent value={activeTab} className="mt-6">
            {loading && !isInitialized ? (
              <TableSkeleton rows={5} />
            ) : displayedPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-6 mb-4">
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
                    onRefresh={async () => {
                      // Refresh all pending payments using the new unified endpoint
                      await fetchPendingReceipts(currentPage, pageSize);
                    }}
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

