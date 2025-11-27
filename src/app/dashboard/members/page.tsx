"use client";

import { useState } from "react";

import DataTable from "../components/_reusable_components/data-table";
import { columns } from "../components/_reusable_components/columns";
import EditContactDialog from "../components/_reusable_components/edit-contact-dialog";
import { useBookingsStore } from "@/stores/useBookingsStore";
import { StudentBooking } from "@/types/booking";

export default function MembersPage() {
  const { bookings } = useBookingsStore();
  const [viewingBooking, setViewingBooking] = useState<StudentBooking | null>(null);

  const members = bookings.filter((b) => b.status === "approved");

  return (
    <main className="p-3 md:px-6">
      <div className=" mx-auto">
        <DataTable columns={columns({ onView: setViewingBooking })} data={members} />
      </div>

      {viewingBooking && (
        <EditContactDialog booking={viewingBooking} onOpenChange={(open) => !open && setViewingBooking(null)} />
      )}
    </main>
  );
}
