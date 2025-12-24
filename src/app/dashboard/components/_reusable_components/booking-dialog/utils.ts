import { StudentBooking } from "@/types/booking";

// Normalize status for comparison (API returns lowercase with spaces/underscores, normalize to uppercase with underscores)
export const normalizeStatus = (status: string): string => {
  const normalized = status.toLowerCase().trim();
  const statusMap: Record<string, string> = {
    "pending payment": "PENDING_PAYMENT",
    "pending approval": "PENDING_APPROVAL",
    "approved": "APPROVED",
    "room_allocated": "ROOM_ALLOCATED",
    "room allocated": "ROOM_ALLOCATED",
    "completed": "COMPLETED",
    "cancelled": "CANCELLED",
    "rejected": "REJECTED",
    "expired": "EXPIRED",
  };
  return statusMap[normalized] || normalized.toUpperCase().replace(/\s+/g, "_");
};

export const statusVariant = (status: string) => {
  const norm = normalizeStatus(status);
  if (norm === "PENDING_PAYMENT") return "secondary";
  if (norm === "PENDING_APPROVAL") return "outline";
  if (norm === "APPROVED") return "default";
  if (norm === "ROOM_ALLOCATED") return "default";
  if (norm === "COMPLETED") return "default";
  if (norm === "CANCELLED") return "destructive";
  if (norm === "REJECTED") return "destructive";
  if (norm === "EXPIRED") return "secondary";
  return "default";
};

export const getStatusColor = (normalizedStatus: string) => {
  if (normalizedStatus === "PENDING_PAYMENT") return "from-amber-500 to-orange-500";
  if (normalizedStatus === "PENDING_APPROVAL") return "from-blue-500 to-indigo-500";
  if (normalizedStatus === "APPROVED") return "from-emerald-500 to-teal-500";
  if (normalizedStatus === "ROOM_ALLOCATED") return "from-purple-500 to-pink-500";
  if (normalizedStatus === "COMPLETED") return "from-green-500 to-emerald-500";
  if (normalizedStatus === "CANCELLED" || normalizedStatus === "REJECTED") return "from-red-500 to-rose-500";
  return "from-gray-500 to-slate-500";
};

export const getDisplayStatus = (normalizedStatus: string, isMember: boolean) => {
  if (isMember) {
    return "Member";
  }
  if (normalizedStatus === "APPROVED") return "Approved (Unassigned)";
  if (normalizedStatus === "ROOM_ALLOCATED") return "Room Allocated";
  if (normalizedStatus === "COMPLETED") return "Completed";
  if (normalizedStatus === "CANCELLED") return "Cancelled";
  if (normalizedStatus === "REJECTED") return "Rejected";
  if (normalizedStatus === "EXPIRED") return "Expired";
  // Convert to readable format
  return normalizedStatus.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

export const getDisplayVariant = (displayStatus: string, status: string) => {
  if (displayStatus === "unassigned") return "outline";
  if (displayStatus.startsWith("Member")) return "default";
  return statusVariant(status);
};

