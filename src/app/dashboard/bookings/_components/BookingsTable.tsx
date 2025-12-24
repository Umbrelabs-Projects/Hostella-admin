"use client";

import DataTable from "../../components/_reusable_components/data-table";
import { columns } from "../../components/_reusable_components/columns";
import { StudentBooking } from "@/types/booking";

type Props = {
  bookings?: StudentBooking[];
  search: string;
  statusFilter: string;
  genderFilter: string;
  roomFilter: string;
  onView: (b: StudentBooking | null) => void;
  onDelete: (id: string | null) => void;
  isLoading?: boolean;
};

export default function BookingsTable({
  bookings,
  search,
  statusFilter,
  genderFilter,
  roomFilter,
  onView,
  onDelete,
}: Props) {
  const normalized = (bookings || []).map((b) => {
    const studentName =
      "studentName" in b ? (b as StudentBooking & { studentName?: string }).studentName : undefined;
    if ((!b.firstName && !b.lastName) && studentName) {
      const [first = "", ...rest] = studentName.split(" ");
      const last = rest.join(" ");
      return { ...b, firstName: first, lastName: last } as StudentBooking;
    }
    return b;
  });

  // Helper to normalize status for comparison (API returns lowercase with spaces/underscores)
  const normalizeStatusForComparison = (status: string): string => {
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

  const filtered = normalized.filter((b) => {
    // status filter - normalize both filter and booking status for comparison
    if (statusFilter !== "all") {
      const normalizedFilter = normalizeStatusForComparison(statusFilter);
      const normalizedBookingStatus = normalizeStatusForComparison(b.status);
      if (normalizedFilter !== normalizedBookingStatus) return false;
    }
    // gender filter
    if (genderFilter !== "all" && b.gender !== genderFilter) return false;
    // room filter
    if (roomFilter !== "all" && b.roomTitle !== roomFilter) return false;
    // search filter
    if (!search) return true;
    const s = search.toLowerCase();
    const fullName = `${b.firstName} ${b.lastName}`.toLowerCase();
    return (
      fullName.includes(s) ||
      (b.bookingId || "").toLowerCase().includes(s) ||
      (b.studentId || "").toLowerCase().includes(s) ||
      (b.email || "").toLowerCase().includes(s)
    );
  });

  return (
    <DataTable
      columns={columns({ onView, onDelete, showStatus: true, showAssigned: false })}
      data={filtered || []}
    />
  );
}
