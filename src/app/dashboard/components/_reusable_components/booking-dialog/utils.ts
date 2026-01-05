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
  if (normalizedStatus === "APPROVED") return "from-slate-500 to-gray-600";
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

// Get card header colors based on status
export const getStatusCardColors = (normalizedStatus: string) => {
  if (normalizedStatus === "PENDING_PAYMENT") {
    return {
      bg: "from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30",
      border: "border-amber-200 dark:border-amber-800",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
    };
  }
  if (normalizedStatus === "PENDING_APPROVAL") {
    return {
      bg: "from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30",
      border: "border-blue-200 dark:border-blue-800",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    };
  }
  if (normalizedStatus === "APPROVED") {
    return {
      bg: "from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-green-950/30",
      border: "border-emerald-200 dark:border-emerald-800",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    };
  }
  if (normalizedStatus === "ROOM_ALLOCATED") {
    return {
      bg: "from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-rose-950/30",
      border: "border-purple-200 dark:border-purple-800",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    };
  }
  if (normalizedStatus === "COMPLETED") {
    return {
      bg: "from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30",
      border: "border-green-200 dark:border-green-800",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
    };
  }
  if (normalizedStatus === "CANCELLED" || normalizedStatus === "REJECTED") {
    return {
      bg: "from-red-50 via-rose-50 to-pink-50 dark:from-red-950/30 dark:via-rose-950/30 dark:to-pink-950/30",
      border: "border-red-200 dark:border-red-800",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
    };
  }
  // Default gray
  return {
    bg: "from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-950/30 dark:via-slate-950/30 dark:to-zinc-950/30",
    border: "border-gray-200 dark:border-gray-800",
    iconBg: "bg-gray-100 dark:bg-gray-900/30",
    iconColor: "text-gray-600 dark:text-gray-400",
  };
};

