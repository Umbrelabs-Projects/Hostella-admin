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
  isLoading = false,
}: Props) {
  const filtered = (bookings || []).filter((b) => {
    // status filter
    if (statusFilter !== "all") {
      if (statusFilter === "approved") {
        if (b.status !== "approved") return false;
      } else {
        if (b.status !== statusFilter) return false;
      }
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
