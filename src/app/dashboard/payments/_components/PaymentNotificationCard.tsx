"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, CreditCard, Eye, ExternalLink } from "lucide-react";
import { PaymentReceipt, usePaymentsStore } from "@/stores/usePaymentsStore";
import { useState, useEffect } from "react";
import { useBookingsStore } from "@/stores/useBookingsStore";
import ReceiptModal from "@/app/dashboard/components/_reusable_components/booking-dialog/ReceiptModal";
import PaymentDetailsModal from "./PaymentDetailsModal";
import { useNotificationsStore } from "@/stores/useNotificationsStore";
import { toast } from "sonner";
// Simple date formatting function
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

interface PaymentNotificationCardProps {
  payment: PaymentReceipt;
  onVerify: (paymentId: string, status: "CONFIRMED" | "FAILED") => Promise<void>;
  onRefresh?: () => void;
}

export default function PaymentNotificationCard({
  payment,
  onVerify,
  onRefresh,
}: PaymentNotificationCardProps) {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyingPaystack, setVerifyingPaystack] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentReceipt | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { bookings, fetchBookings } = useBookingsStore();
  const { verifyPaystackPayment, fetchPaymentDetails } = usePaymentsStore();
  const { fetchNotifications } = useNotificationsStore();

  // Find the booking from the bookings store using the payment's bookingId (which is the internal ID)
  // payment.bookingId could be either the internal ID or display ID, so we check both
  const bookingId = payment.booking?.id || payment.bookingId;
  const booking = bookingId 
    ? bookings.find((b) => b.id === bookingId || b.bookingId === bookingId)
    : null;

  // Fetch bookings if not loaded or if booking is not found and we have a bookingId
  useEffect(() => {
    if (bookingId && (!booking && bookings.length === 0)) {
      fetchBookings().catch(() => {
        // Silently fail - bookings might not be available
      });
    }
  }, [bookingId, booking, bookings.length, fetchBookings]);

  const isBankTransfer = payment.provider === "BANK_TRANSFER";
  const studentName = payment.booking?.user
    ? `${payment.booking.user.firstName} ${payment.booking.user.lastName}`
    : booking
    ? `${booking.firstName} ${booking.lastName}`
    : "Unknown Student";
  
  // Use student reference number from booking or payment
  const studentIndex = booking?.studentId || 
                       payment.booking?.user?.studentRefNumber || 
                       payment.booking?.user?.studentId || 
                       "N/A";
  
  // Use display bookingId (e.g., BK-OXL8) from booking or payment
  // Don't use payment.bookingId as fallback since it's likely the internal ID
  const displayBookingId = booking?.bookingId || 
                          payment.booking?.bookingId || 
                          (payment.bookingId?.startsWith("BK-") ? payment.bookingId : null) ||
                          "N/A";
  
  const hostelName = booking?.hostelName || 
                    payment.booking?.hostel?.name || 
                    "Unknown Hostel";
  
  const roomType = booking?.roomTitle || 
                  payment.booking?.roomTitle || 
                  "N/A";

  const handleVerify = async (status: "CONFIRMED" | "FAILED") => {
    setVerifying(true);
    try {
      await onVerify(payment.id, status);
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyPaystack = async () => {
    if (!payment.reference) {
      toast.error("Payment reference not found");
      return;
    }

    setVerifyingPaystack(true);
    try {
      const verificationResult = await verifyPaystackPayment(payment.reference);
      
      if (verificationResult.success && 
          verificationResult.data.paystackVerification?.data?.status === "success") {
        toast.success("Payment verified successfully! Notifications sent to admins.");
        
        // Update payment details from response if available
        if (verificationResult.data.paymentUpdate?.payment) {
          const updatedPayment = verificationResult.data.paymentUpdate.payment;
          const paymentStatus = updatedPayment.status as "INITIATED" | "AWAITING_VERIFICATION" | "CONFIRMED" | "FAILED" | "REFUNDED";
          const provider = (updatedPayment.provider as "BANK_TRANSFER" | "PAYSTACK" | undefined) || payment.provider;
          setPaymentDetails({
            ...payment,
            ...updatedPayment,
            status: paymentStatus,
            provider: provider,
          });
        } else {
          // Fallback: Refresh payment details to get updated verification data
          const updatedPayment = await fetchPaymentDetails(payment.id);
          setPaymentDetails(updatedPayment);
        }
        
        // Refresh bookings to reflect status changes
        await fetchBookings();
        
        // Refresh notifications immediately (backend automatically created them)
        // Call multiple times to ensure we catch the new notifications
        try {
          // Immediate refresh
          await fetchNotifications({ page: 1, pageSize: 50, unreadOnly: false });
          // Also refresh unread count specifically
          await fetchNotifications({ page: 1, pageSize: 10, unreadOnly: true });
          // Final refresh to ensure badge updates
          await fetchNotifications({ page: 1, pageSize: 10, unreadOnly: false });
        } catch (err) {
          // Silently fail - notifications will be picked up on next poll
          console.warn("Failed to refresh notifications:", err);
        }
        
        // Refresh payments list to show updated status
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error("Payment verification failed. Please check the reference number.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to verify payment with Paystack"
      );
    } finally {
      setVerifyingPaystack(false);
    }
  };

  // Load payment details if not already loaded
  useEffect(() => {
    if (payment.provider === "PAYSTACK" && !paymentDetails && payment.id) {
      fetchPaymentDetails(payment.id)
        .then(setPaymentDetails)
        .catch(() => {
          // Silently fail - payment details might not be available
        });
    }
  }, [payment.provider, payment.id, paymentDetails, fetchPaymentDetails]);

  // Use payment details if available, otherwise use payment prop
  const displayPayment = paymentDetails || payment;
  const verificationData = displayPayment.verificationData;
  const payerPhone = displayPayment.payerPhone || payment.booking?.user?.phone;

  const timeAgo = formatTimeAgo(payment.createdAt);

  const statusPill = (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
        payment.status === "AWAITING_VERIFICATION" || payment.status === "INITIATED"
          ? payment.status === "INITIATED"
            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          : payment.status === "CONFIRMED"
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : payment.status === "FAILED"
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {payment.status === "AWAITING_VERIFICATION"
        ? "Pending"
        : payment.status === "INITIATED"
        ? "Initiated"
        : payment.status}
    </span>
  );

  const providerIcon = isBankTransfer ? (
    <Receipt className="size-4 text-green-600" />
  ) : (
    <CreditCard className="size-4 text-purple-600" />
  );

  return (
    <>
      <Card className={`border ${
        payment.status === "INITIATED" && !isBankTransfer
          ? "border-orange-300 dark:border-orange-700 bg-orange-50/30 dark:bg-orange-950/20"
          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      } hover:border-gray-300 dark:hover:border-gray-700 transition-all shadow-sm hover:shadow-md`}>
        <CardHeader className="">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`p-2.5 rounded-xl shrink-0 ${isBankTransfer ? "bg-green-50" : "bg-purple-50"}`}>
                {providerIcon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50 truncate">
                    {isBankTransfer ? "Bank Receipt" : "Paystack Payment"}
                  </h3>
                  {statusPill}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                GHS {payment.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Amount</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-2">
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1 min-w-40">
              <span className="font-semibold text-gray-900 dark:text-gray-50">{studentName}</span>
              <span className="text-[11px] text-gray-500">({studentIndex})</span>
            </div>
            <div className="flex items-center gap-1 min-w-[140px]">
              <span className="font-semibold text-gray-900 dark:text-gray-50">{displayBookingId}</span>
              <span className="text-[11px] text-gray-500 truncate">• {hostelName} • {roomType}</span>
            </div>
            <div className="flex-1 min-w-[180px]">
              <span className="font-mono text-[11px] text-gray-700 dark:text-gray-200 truncate block">
                {payment.reference}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isBankTransfer && payment.receiptUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReceiptModal(true)}
                className="gap-1 border-gray-300 dark:border-gray-700"
              >
                <Eye className="size-4" /> Receipt
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = `/dashboard/bookings?search=${displayBookingId}`;
              }}
              className="gap-1 border-gray-300 dark:border-gray-700"
            >
              <ExternalLink className="size-4" /> Booking
            </Button>
            <Button size="sm" onClick={() => setShowDetailsModal(true)} className="gap-1">
              Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {showReceiptModal && payment.receiptUrl && (
        <ReceiptModal
          open={showReceiptModal}
          receiptUrl={payment.receiptUrl}
          paymentProvider={payment.provider}
          onClose={() => setShowReceiptModal(false)}
          onApprovePayment={async () => {
            await handleVerify("CONFIRMED");
            setShowReceiptModal(false);
          }}
        />
      )}
      {/* Payment Details Modal for Paystack/MoMo */}
      {showDetailsModal && (
        <PaymentDetailsModal
          open={showDetailsModal}
          payment={displayPayment}
          studentName={studentName}
          studentId={studentIndex}
          bookingId={displayBookingId}
          hostelName={hostelName}
          roomType={roomType}
          isBankTransfer={isBankTransfer}
          onClose={() => setShowDetailsModal(false)}
          onViewReceipt={isBankTransfer && payment.receiptUrl ? () => setShowReceiptModal(true) : undefined}
          onVerify={async () => {
            if (!isBankTransfer) {
              await handleVerifyPaystack();
            } else {
              await handleVerify("CONFIRMED");
            }
          }}
          onReject={payment.status === "AWAITING_VERIFICATION" || payment.status === "INITIATED" ? () => handleVerify("FAILED") : undefined}
          verifying={verifying || verifyingPaystack}
          verificationData={verificationData}
        />
      )}
    </>
  );
}

