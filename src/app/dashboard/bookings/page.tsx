"use client";

import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DataTable from "./_components/data-table";
import { StudentBooking, BookingStatus } from "@/types/booking";
import { useBookingsStore, BookingsState } from "@/stores/useBookingsStore";
import StudentDetailDrawer from "./_components/student-detail-drawer";

export default function BookingsPage() {
  const bookings = useBookingsStore((s: BookingsState) => s.bookings);
  const selectedBooking = useBookingsStore((s: BookingsState) => s.selectedBooking);
  const setSelectedBooking = useBookingsStore((s: BookingsState) => s.setSelectedBooking);
  const updateBookingStore = useBookingsStore((s: BookingsState) => s.updateBooking);
  const [filterStatus, setFilterStatus] = React.useState<BookingStatus | "all">("all");

  const filtered = useMemo(() => {
    if (filterStatus === "all") return bookings;
    return bookings.filter((b) => b.status === filterStatus);
  }, [bookings, filterStatus]);

  const openDetails = (id: string) => {
    const b = bookings.find((x) => x.id === id) || null;
    setSelectedBooking(b);
  };

  const closeDetails = () => setSelectedBooking(null);

  const updateBooking = (updated: StudentBooking) => {
    updateBookingStore(updated);
  };

  return (
    <main className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Booking Requests</h1>
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as BookingStatus | "all") }>
              <SelectTrigger size="sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending payment">Pending payment</SelectItem>
                <SelectItem value="pending approval">Pending approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <DataTable data={filtered} onRowClick={openDetails} />
        </Card>
      </div>

      <StudentDetailDrawer
        booking={selectedBooking}
        open={!!selectedBooking}
        onOpenChange={(open: boolean) => !open && closeDetails()}
        onUpdate={updateBooking}
      />
    </main>
  );
}
