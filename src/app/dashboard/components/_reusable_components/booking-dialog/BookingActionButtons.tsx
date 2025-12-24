"use client";

import { Check, CreditCard, X, Key } from "lucide-react";
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
}: BookingActionButtonsProps) {
  return (
    <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-800 shrink-0 mt-auto">
      <ActionButton
        icon={X}
        variant="outline"
        onClick={onClose}
      >
        Close
      </ActionButton>

      {/* Approve Payment - only for PENDING_PAYMENT */}
      {(normalizedStatus === "PENDING_PAYMENT" || booking.status.toLowerCase() === "pending payment") && (
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

