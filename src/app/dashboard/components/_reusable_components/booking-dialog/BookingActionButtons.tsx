"use client";

import { Check, CreditCard, X, Key, UserMinus } from "lucide-react";
import { StudentBooking } from "@/types/booking";
import ActionButton from "./ActionButton";

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
}: BookingActionButtonsProps) {
  // Check payment status to determine if Approve Payment button should be shown
  // According to guide: Show "Approve Payment" if booking.status === "PENDING_PAYMENT" AND payment.status === "CONFIRMED"
  const paymentStatus = (booking as any)?.payment?.status;
  const showApprovePayment = 
    (normalizedStatus === "PENDING_PAYMENT" || booking.status.toLowerCase() === "pending payment") &&
    (paymentStatus === "CONFIRMED" || paymentStatus === "AWAITING_VERIFICATION");

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
        >
          Remove Student
        </ActionButton>
      )}

      {/* Cancel Booking - available for all statuses except COMPLETED */}
      {normalizedStatus !== "COMPLETED" && onCancel && (
        <ActionButton
          icon={X}
          variant="destructive"
          onClick={() => {
            const reason = prompt("Reason for cancellation (optional):");
            onCancel(booking.id, reason || undefined);
          }}
        >
          Cancel Booking
        </ActionButton>
      )}
    </div>
  );
}

