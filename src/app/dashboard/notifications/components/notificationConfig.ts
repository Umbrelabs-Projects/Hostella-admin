"use client";

import { CheckCircle, CreditCard, Key, ToolCase } from "lucide-react";

export const typeConfig = {
  booking_approved: {
    icon: CheckCircle,
    color: "bg-green-100 text-green-600 border-green-500",
  },
  payment_received: {
    icon: CreditCard,
    color: "bg-indigo-100 text-indigo-600 border-indigo-500",
  },
  room_allocated: {
    icon: Key,
    color: "bg-blue-100 text-blue-600 border-blue-500",
  },
  maintenance_alert: {
    icon: ToolCase,
    color: "bg-red-100 text-red-600 border-red-500",
  },
};
