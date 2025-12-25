"use client";

import { useState } from "react";
import { Check, CreditCard, X, Key, UserMinus } from "lucide-react";
import { StudentBooking } from "@/types/booking";
import ActionButton from "./ActionButton";
import CancelBookingDialog from "./CancelBookingDialog";

interface BookingActionButtonsProps {
  booking: StudentBooking;
  normalizedStatus: string;
  isMember: boolean;
  onClose: () => void;
  onApprovePayment?: (id: string) => void;
  onApprove?: (id: string) => void;
  onAssignRoom: () => void;
  onCompleteOnboarding?: (id: string) => void;
  onCancel?: (id: string, reason?: string) => void;
  onRemoveStudent?: (id: string) => void;
  loadingActions?: Record<string, boolean>;
}

export default function BookingActionButtons({
  booking,
  normalizedStatus,
  isMember,
  onClose,
  onApprovePayment,
  onApprove,
  onAssignRoom,
  onCompleteOnboarding,
  onCancel,
  onRemoveStudent,
  loadingActions = {},
}: BookingActionButtonsProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // Get loading states for each action
  const isApprovingPayment = loadingActions[`approvePayment-${booking.id}`] || false;
  const isApproving = loadingActions[`approve-${booking.id}`] || false;
  const isAssigningRoom = loadingActions[`assignRoom-${booking.id}`] || false;
  const isCompletingOnboarding = loadingActions[`completeOnboarding-${booking.id}`] || false;
  const isCancelling = loadingActions[`cancel-${booking.id}`] || false;
  const isRemovingStudent = loadingActions[`removeStudent-${booking.id}`] || false;
  // Check payment status to determine if Approve Payment button should be shown
  // UNIFIED IMPLEMENTATION: Both "Verify & Approve" and "Approve Payment" now use
  // the same endpoint: PATCH /payments/:id/status
  // 
  // The button should only show if:
  // 1. Booking is PENDING_PAYMENT (not already PENDING_APPROVAL - that means payment was already verified)
  // 2. Payment exists and is CONFIRMED or AWAITING_VERIFICATION
  const paymentStatus = (booking as any)?.payment?.status;
  const paymentId = (booking as any)?.payment?.id;
  const isPendingPayment = normalizedStatus === "PENDING_PAYMENT" || booking.status.toLowerCase() === "pending payment";
  const isPendingApproval = normalizedStatus === "PENDING_APPROVAL" || booking.status.toLowerCase() === "pending approval";
  
  // Show button ONLY if:
  // - Booking is still PENDING_PAYMENT (not already moved to PENDING_APPROVAL by "Verify & Approve")
  // - Payment exists (has payment ID)
  // - Payment status is CONFIRMED or AWAITING_VERIFICATION
  // - Payment status might not be loaded yet, but booking is still pending payment
  const showApprovePayment = isPendingPayment && !isPendingApproval && paymentId && (
    paymentStatus === "CONFIRMED" || 
    paymentStatus === "AWAITING_VERIFICATION" || 
    paymentStatus === undefined // Show if payment status not loaded yet (will be fetched)
  );

  return (
    <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0 mt-auto bg-white dark:bg-gray-900">
      <ActionButton
        icon={X}
        variant="outline"
        onClick={onClose}
      >
        Close
      </ActionButton>

      {/* Approve Payment - for PENDING_PAYMENT with CONFIRMED or AWAITING_VERIFICATION payment */}
      {showApprovePayment && (
        <ActionButton
          icon={CreditCard}
          variant="success"
          onClick={() => onApprovePayment?.(booking.id)}
          loading={isApprovingPayment}
        >
          Approve Payment
        </ActionButton>
      )}

      {/* Approve Booking - only for PENDING_APPROVAL */}
      {(normalizedStatus === "PENDING_APPROVAL" || booking.status.toLowerCase() === "pending approval") && (
        <ActionButton
          icon={Check}
          variant="primary"
          onClick={() => onApprove?.(booking.id)}
          loading={isApproving}
        >
          Approve Booking
        </ActionButton>
      )}

      {/* Assign Room - only for APPROVED status */}
      {(normalizedStatus === "APPROVED" || booking.status.toLowerCase() === "approved") && !isMember && (
        <ActionButton
          icon={Key}
          variant="info"
          onClick={onAssignRoom}
          loading={isAssigningRoom}
        >
          Assign Room
        </ActionButton>
      )}

      {/* Complete Onboarding - only for ROOM_ALLOCATED status */}
      {normalizedStatus === "ROOM_ALLOCATED" && !isMember && (
        <ActionButton
          icon={Check}
          variant="teal"
          onClick={() => onCompleteOnboarding?.(booking.id)}
          loading={isCompletingOnboarding}
        >
          Complete Onboarding
        </ActionButton>
      )}

      {/* Remove Student from Room - only for ROOM_ALLOCATED status */}
      {normalizedStatus === "ROOM_ALLOCATED" && onRemoveStudent && (
        <ActionButton
          icon={UserMinus}
          variant="destructive"
          onClick={() => {
            if (confirm("Are you sure you want to remove this student from their room? This will cancel the booking.")) {
              onRemoveStudent(booking.id);
            }
          }}
          loading={isRemovingStudent}
        >
          Remove Student
        </ActionButton>
      )}

      {/* Cancel Booking - available for all statuses except COMPLETED */}
      {normalizedStatus !== "COMPLETED" && onCancel && (
        <>
          <ActionButton
            icon={X}
            variant="destructive"
            onClick={() => setShowCancelDialog(true)}
            loading={isCancelling}
          >
            Cancel Booking
          </ActionButton>
          <CancelBookingDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
            onConfirm={(reason) => onCancel(booking.id, reason)}
            bookingId={booking.bookingId}
          />
        </>
      )}
    </div>
  );
}

