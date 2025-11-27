"use client";

import { useState } from "react";

import DataTable from "../components/_reusable_components/data-table";
import { columns } from "../components/_reusable_components/columns";
import EditContactDialog from "../components/_reusable_components/edit-contact-dialog";
import { useBookingsStore } from "@/stores/useBookingsStore";
import { useMembersStore } from "@/stores/useMembersStore";
import { StudentBooking } from "@/types/booking";
import TableFilters from "../components/_reusable_components/table-filters";

export default function MembersPage() {
  const { bookings } = useBookingsStore();
  const { members } = useMembersStore();
  const [viewingBooking, setViewingBooking] = useState<StudentBooking | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");

  const resetFilters = () => {
    setSearch("");
    setGenderFilter("all");
    setRoomFilter("all");
  };

  // Members are tracked explicitly in the members store (after Complete Onboarding)
  const genderOptions = Array.from(new Set((members || []).map((b) => b.gender).filter(Boolean)));
  const roomOptions = Array.from(new Set((members || []).map((b) => b.roomTitle).filter(Boolean)));

  const filteredMembers = (members || []).filter((b) => {
    if (genderFilter !== "all" && b.gender !== genderFilter) return false;
    if (roomFilter !== "all" && b.roomTitle !== roomFilter) return false;
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
    <main className="p-3 md:px-6">
      <div className=" mx-auto">
        <TableFilters
          search={search}
          onSearch={setSearch}
          gender={genderFilter}
          onGender={setGenderFilter}
          genderOptions={genderOptions}
          room={roomFilter}
          onRoom={setRoomFilter}
          roomOptions={roomOptions}
          onReset={resetFilters}
        />

        <DataTable columns={columns({ onView: setViewingBooking, showStatus: false, showAssigned: true, showFloor: true })} data={filteredMembers} />
      </div>

      {viewingBooking && (
        <EditContactDialog booking={viewingBooking} onOpenChange={(open) => !open && setViewingBooking(null)} />
      )}
    </main>
  );
}
