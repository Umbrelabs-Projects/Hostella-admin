"use client";

import { useState } from "react";
import { Check, CreditCard, X, Key, UserMinus, LogOut, RefreshCw } from "lucide-react";
import { StudentBooking } from "@/types/booking";
import ActionButton from "./ActionButton";
import CancelBookingDialog from "./CancelBookingDialog";
import DeleteConfirmDialog from "../delete-confirm-dialog";

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
  onUnassignRoom?: (id: string) => void;
  onReassignRoom?: (id: string) => void;
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
  onUnassignRoom,
  onReassignRoom,
  loadingActions = {},
}: BookingActionButtonsProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  
  // Get loading states for each action
  const isApprovingPayment = loadingActions[`approvePayment-${booking.id}`] || false;
  const isApproving = loadingActions[`approve-${booking.id}`] || false;
  const isAssigningRoom = loadingActions[`assignRoom-${booking.id}`] || false;
  const isCompletingOnboarding = loadingActions[`completeOnboarding-${booking.id}`] || false;
  const isCancelling = loadingActions[`cancel-${booking.id}`] || false;
  const isRemovingStudent = loadingActions[`removeStudent-${booking.id}`] || false;
  const isUnassigningRoom = loadingActions[`unassign-${booking.id}`] || false;
  const isReassigningRoom = loadingActions[`reassign-${booking.id}`] || false;
  
  const hasRoom = booking.allocatedRoomNumber != null;
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
  // - Payment status is CONFIRMED or AWAITING_VERIFICATION or INITIATED (for Paystack)
  // - Payment status might not be loaded yet, but booking is still pending payment
  const showApprovePayment = isPendingPayment && !isPendingApproval && paymentId && (
    paymentStatus === "CONFIRMED" || 
    paymentStatus === "AWAITING_VERIFICATION" || 
    paymentStatus === "INITIATED" || // Allow for Paystack initial state
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

      {/* Approve Payment - for PENDING_PAYMENT with CONFIRMED, AWAITING_VERIFICATION, or INITIATED payment (Paystack or Bank) */}
      {showApprovePayment && (
        <ActionButton
          icon={CreditCard}
          variant="success"
          onClick={() => onApprovePayment?.(booking.id)}
          loading={isApprovingPayment}
        >
          Verify & Approve
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
      {normalizedStatus === "ROOM_ALLOCATED" && onRemoveStudent && !isMember && (
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

      {/* Unassign Room - for members with assigned room */}
      {isMember && hasRoom && onUnassignRoom && (
        <>
          <ActionButton
            icon={LogOut}
            variant="warning"
            onClick={() => setShowUnassignDialog(true)}
            loading={isUnassigningRoom}
          >
            Unassign Room
          </ActionButton>
          <DeleteConfirmDialog
            open={showUnassignDialog}
            onOpenChange={setShowUnassignDialog}
            onConfirm={() => onUnassignRoom(booking.id)}
            loading={isUnassigningRoom}
            title="Unassign Room"
            description="Are you sure you want to unassign this room? The member will remain active but without a room assignment."
            confirmLabel="Unassign"
          />
        </>
      )}

      {/* Reassign Room - for members */}
      {isMember && onReassignRoom && (
        <ActionButton
          icon={RefreshCw}
          variant="info"
          onClick={() => onReassignRoom(booking.id)}
          loading={isReassigningRoom}
        >
          {hasRoom ? "Reassign Room" : "Assign Room"}
        </ActionButton>
      )}

      {/* Cancel Booking - available for all statuses except COMPLETED and ROOM_ALLOCATED */}
      {normalizedStatus !== "COMPLETED" && normalizedStatus !== "ROOM_ALLOCATED" && onCancel && (
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

