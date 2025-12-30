"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  CreditCard,
  User,
  Calendar,
  Building2,
  Eye,
  Check,
  X,
  ExternalLink,
  Shield,
  Phone,
} from "lucide-react";
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
          setPaymentDetails({
            ...payment,
            ...updatedPayment,
            status: updatedPayment.status as PaymentReceipt["status"],
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

  return (
    <>
      <Card className={`border ${
        payment.status === "INITIATED" && !isBankTransfer
          ? "border-orange-300 dark:border-orange-700 bg-orange-50/30 dark:bg-orange-950/20"
          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      } hover:border-gray-300 dark:hover:border-gray-700 transition-all shadow-sm hover:shadow-md`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  isBankTransfer
                    ? "bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30"
                    : "bg-linear-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30"
                }`}
              >
                {isBankTransfer ? (
                  <Receipt
                    className={`size-5 ${
                      isBankTransfer
                        ? "text-green-600 dark:text-green-400"
                        : "text-purple-600 dark:text-purple-400"
                    }`}
                  />
                ) : (
                  <CreditCard
                    className={`size-5 ${
                      isBankTransfer
                        ? "text-green-600 dark:text-green-400"
                        : "text-purple-600 dark:text-purple-400"
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50 truncate">
                    {isBankTransfer
                      ? "Bank Receipt Uploaded"
                      : "Mobile Money Payment Received"}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                      payment.status === "AWAITING_VERIFICATION" || payment.status === "INITIATED"
                        ? payment.status === "INITIATED"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 animate-pulse"
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
                      ? "⚠️ Initiated - Verify Now"
                      : payment.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {timeAgo}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                GHS {payment.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Payment Amount
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Student & Booking Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 shrink-0">
                    <User className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">
                      Student
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate mb-0.5">
                      {studentName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Ref: <span className="font-medium">{studentIndex}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-linear-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 shrink-0">
                    <Building2 className="size-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">
                      Booking & Hostel
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate mb-0.5">
                      {displayBookingId}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {hostelName} • {roomType}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Reference & Method */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="size-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Payment Reference
                </span>
              </div>
              <p className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-50 break-all mb-2">
                {payment.reference}
              </p>
              {!isBankTransfer && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  {verificationData?.authorization?.channel ? (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Payment Method:</span>{" "}
                      <span className="uppercase font-semibold text-gray-900 dark:text-gray-50">
                        {verificationData.authorization.channel === "mtn" ? "MTN" :
                         verificationData.authorization.channel === "airtel" || verificationData.authorization.channel === "airteltigo" ? "AirtelTigo" :
                         verificationData.authorization.channel === "vodafone" || verificationData.authorization.channel === "telecel" ? "Telecel" :
                         verificationData.authorization.channel.toUpperCase()} Mobile Money
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      Mobile Money payment received. Please verify and approve payment.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Paystack Payment Details */}
            {!isBankTransfer && (
              <div className="space-y-2">
                {payerPhone && (
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="size-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                        Payer Phone
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                      {payerPhone}
                    </p>
                  </div>
                )}

                {verificationData && (
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="size-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                        Verification Details
                      </span>
                    </div>
                    <div className="space-y-1">
                      {verificationData.channel && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Channel:</span>{" "}
                          <span className="uppercase">{verificationData.channel}</span>
                        </p>
                      )}
                      {verificationData.authorization?.channel && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Provider:</span>{" "}
                          <span className="uppercase">{verificationData.authorization.channel}</span>
                        </p>
                      )}
                      {verificationData.authorization?.mobile_money_number && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Mobile Money:</span>{" "}
                          {verificationData.authorization.mobile_money_number}
                        </p>
                      )}
                      {verificationData.gateway_response && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Status:</span>{" "}
                          {verificationData.gateway_response}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Info Message for Paystack Payments */}
            {!isBankTransfer && payment.status === "INITIATED" && (
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30">
                <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                  ⚠️ Mobile Money payment received. Please verify with Paystack and approve payment.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              {isBankTransfer && payment.receiptUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReceiptModal(true)}
                  className="flex-1 md:flex-none border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Eye className="size-4 mr-2" />
                  View Receipt
                </Button>
              )}
              {/* Restore View Booking button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = `/dashboard/bookings?search=${displayBookingId}`;
                }}
                className="flex-1 md:flex-none border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ExternalLink className="size-4 mr-2" />
                View Booking
              </Button>
              {(payment.status === "INITIATED" || payment.status === "AWAITING_VERIFICATION" || payment.status === "CONFIRMED") && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={async () => {
                    if (!isBankTransfer) {
                      await handleVerifyPaystack();
                    } else {
                      await handleVerify("CONFIRMED");
                    }
                  }}
                  disabled={verifying || verifyingPaystack}
                  className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Check className="size-4 mr-2" />
                  {(verifying || verifyingPaystack) ? "Verifying..." : payment.status === "CONFIRMED" ? "Approve Payment" : "Verify & Approve"}
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleVerify("FAILED")}
                disabled={verifying || (payment.status !== "AWAITING_VERIFICATION" && payment.status !== "INITIATED")}
                className="flex-1 md:flex-none shadow-sm"
              >
                <X className="size-4 mr-2" />
                Reject
              </Button>
            </div>
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
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}

