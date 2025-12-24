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
} from "lucide-react";
import { PaymentReceipt } from "@/stores/usePaymentsStore";
import { useState, useEffect } from "react";
import { useBookingsStore } from "@/stores/useBookingsStore";
import ReceiptModal from "@/app/dashboard/components/_reusable_components/booking-dialog/ReceiptModal";
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
}

export default function PaymentNotificationCard({
  payment,
  onVerify,
}: PaymentNotificationCardProps) {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { bookings, fetchBookings } = useBookingsStore();

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

  const timeAgo = formatTimeAgo(payment.createdAt);

  return (
    <>
      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all shadow-sm hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className={`p-2.5 rounded-xl flex-shrink-0 ${
                  isBankTransfer
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30"
                    : "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30"
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
                      : "Paystack Payment Received"}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      payment.status === "AWAITING_VERIFICATION"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {payment.status === "AWAITING_VERIFICATION"
                      ? "Pending"
                      : payment.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {timeAgo}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
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
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex-shrink-0">
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

              <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex-shrink-0">
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

            {/* Payment Reference */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="size-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Payment Reference
                </span>
              </div>
              <p className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-50 break-all">
                {payment.reference}
              </p>
            </div>

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
              <Button
                variant="default"
                size="sm"
                onClick={() => handleVerify("CONFIRMED")}
                disabled={verifying || payment.status !== "AWAITING_VERIFICATION"}
                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Check className="size-4 mr-2" />
                {verifying ? "Verifying..." : "Verify & Approve"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleVerify("FAILED")}
                disabled={verifying || payment.status !== "AWAITING_VERIFICATION"}
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
          onClose={() => setShowReceiptModal(false)}
          onApprovePayment={async () => {
            await handleVerify("CONFIRMED");
            setShowReceiptModal(false);
          }}
        />
      )}
    </>
  );
}

