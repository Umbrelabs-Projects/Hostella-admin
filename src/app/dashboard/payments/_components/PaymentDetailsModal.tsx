import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentReceipt } from "@/stores/usePaymentsStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Check, X } from "lucide-react";

interface PaymentDetailsModalProps {
  open: boolean;
  payment: PaymentReceipt;
  studentName?: string;
  studentId?: string;
  bookingId?: string;
  hostelName?: string;
  roomType?: string;
  isBankTransfer: boolean;
  onClose: () => void;
  onViewReceipt?: () => void;
  onVerify?: () => Promise<void>;
  onReject?: () => Promise<void>;
  verifying?: boolean;
  verificationData?: PaymentReceipt["verificationData"];
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  open,
  payment,
  studentName,
  studentId,
  bookingId,
  hostelName,
  roomType,
  isBankTransfer,
  onClose,
  onViewReceipt,
  onVerify,
  onReject,
  verifying,
  verificationData,
}) => {
  const statusBadge = (status: PaymentReceipt["status"]) => {
    const base = "px-2.5 py-0.5 rounded-full text-xs font-semibold";
    if (status === "CONFIRMED") return `${base} bg-green-100 text-green-800`;
    if (status === "FAILED") return `${base} bg-red-100 text-red-800`;
    if (status === "INITIATED") return `${base} bg-orange-100 text-orange-800`;
    if (status === "AWAITING_VERIFICATION") return `${base} bg-blue-100 text-blue-800`;
    return `${base} bg-gray-100 text-gray-800`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span>Payment Details</span>
            <Badge className={statusBadge(payment.status)} variant="outline">
              {payment.status === "INITIATED"
                ? "Initiated"
                : payment.status === "AWAITING_VERIFICATION"
                ? "Pending Verification"
                : payment.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500">Amount</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                GHS {payment.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Provider: {payment.provider}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500">Reference</p>
              <p className="text-sm font-mono break-all text-gray-900 dark:text-gray-50">
                {payment.reference}
              </p>
              <p className="text-xs text-gray-500 mt-1">Created: {new Date(payment.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500">Student</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                {studentName || "Unknown"}
              </p>
              <p className="text-xs text-gray-500">ID: {studentId || "N/A"}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500">Booking</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                {bookingId || "N/A"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {hostelName || "Unknown Hostel"}
                {roomType ? ` • ${roomType}` : ""}
              </p>
            </div>
          </div>

          {payment.payerPhone && (
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30">
              <p className="text-xs text-purple-600 dark:text-purple-300 font-semibold uppercase tracking-wide mb-1">
                Payer Phone
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{payment.payerPhone}</p>
            </div>
          )}

          {verificationData && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 space-y-1">
              <p className="text-xs text-green-700 dark:text-green-300 font-semibold uppercase tracking-wide">
                Verification
              </p>
              {verificationData.channel && (
                <p className="text-sm text-gray-800 dark:text-gray-100">Channel: {verificationData.channel}</p>
              )}
              {verificationData.authorization?.channel && (
                <p className="text-sm text-gray-800 dark:text-gray-100">Provider: {verificationData.authorization.channel}</p>
              )}
              {verificationData.authorization?.mobile_money_number && (
                <p className="text-sm text-gray-800 dark:text-gray-100">Mobile Money: {verificationData.authorization.mobile_money_number}</p>
              )}
              {verificationData.gateway_response && (
                <p className="text-sm text-gray-800 dark:text-gray-100">Status: {verificationData.gateway_response}</p>
              )}
            </div>
          )}

          <div className="h-px w-full bg-gray-200 dark:bg-gray-800" />

          <div className="flex flex-wrap gap-2 justify-end">
            {isBankTransfer && onViewReceipt && payment.receiptUrl && (
              <Button variant="outline" size="sm" onClick={onViewReceipt} className="gap-1">
                <Eye className="size-4" /> View Receipt
              </Button>
            )}
            {onReject && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onReject}
                disabled={!!verifying}
                className="gap-1"
              >
                <X className="size-4" /> Reject
              </Button>
            )}
            {onVerify && (
              <Button
                size="sm"
                onClick={onVerify}
                disabled={!!verifying}
                className="gap-1"
              >
                <Check className="size-4" /> {verifying ? "Processing..." : "Verify & Approve"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailsModal;
