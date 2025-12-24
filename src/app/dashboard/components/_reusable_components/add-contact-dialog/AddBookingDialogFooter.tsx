"use client";

import { X, Plus } from "lucide-react";
import ActionButton from "../booking-dialog/ActionButton";

interface AddBookingDialogFooterProps {
  onCancel: () => void;
  onCreate: () => void;
}

export default function AddBookingDialogFooter({ onCancel, onCreate }: AddBookingDialogFooterProps) {
  return (
    <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0 mt-auto">
      <ActionButton
        icon={X}
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </ActionButton>
      <ActionButton
        icon={Plus}
        variant="success"
        onClick={onCreate}
      >
        Create Booking
      </ActionButton>
    </div>
  );
}

