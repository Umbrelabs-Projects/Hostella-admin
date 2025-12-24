"use client";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";

export default function AddBookingDialogHeader() {
  return (
    <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg">
          <UserPlus className="size-5 text-white" />
        </div>
        <div>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-50">
            Add New Booking
          </DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter student booking details to create a new reservation
          </p>
        </div>
      </div>
    </DialogHeader>
  );
}

