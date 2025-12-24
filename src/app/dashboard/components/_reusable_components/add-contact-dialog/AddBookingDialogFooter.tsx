"use client";

import { X, Plus } from "lucide-react";
import ActionButton from "../booking-dialog/ActionButton";

interface AddBookingDialogFooterProps {
  onCancel: () => void;
  onCreate: () => void;
  loading?: boolean;
}

export default function AddBookingDialogFooter({ onCancel, onCreate, loading = false }: AddBookingDialogFooterProps) {
  return (
    <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0 mt-auto">
      <ActionButton
        icon={X}
        variant="outline"
        onClick={onCancel}
        disabled={loading}
      >
        Cancel
      </ActionButton>
      <ActionButton
        icon={Plus}
        variant="success"
        onClick={onCreate}
        loading={loading}
      >
        {loading ? "Creating..." : "Create Booking"}
      </ActionButton>
    </div>
  );
}

