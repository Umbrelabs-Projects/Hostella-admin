"use client";

import { useState } from "react";

import BookingsHeader from "./_components/BookingsHeader";
import BookingsFilters from "./_components/BookingsFilters";
import BookingsTable from "./_components/BookingsTable";
import BookingsDialogs from "./_components/BookingsDialogs";

import { useBookingsStore } from "@/stores/useBookingsStore";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { StudentBooking, Gender, Level, RoomTitle, BookingStatus } from "@/types/booking";
import { useMembersStore } from "@/stores/useMembersStore";

export default function Bookings() {
  const { bookings, updateBooking, setBookings, removeBooking } = useBookingsStore();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setGenderFilter("all");
    setRoomFilter("all");
  };

  const genderOptions = Array.from(new Set((bookings || []).map((b) => b.gender).filter(Boolean)));
  const roomOptions = Array.from(new Set((bookings || []).map((b) => b.roomTitle).filter(Boolean)));
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewingBooking, setViewingBooking] = useState<StudentBooking | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);

  const handleAddBooking = (input: Partial<StudentBooking>) => {
    const id = Date.now().toString();
    const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: StudentBooking = {
      id,
      bookingId,
      email: input.email ?? "",
      firstName: input.firstName ?? "",
      lastName: input.lastName ?? "",
      gender: (input.gender as Gender) ?? "male",
      level: (input.level as Level) ?? "100",
      school: input.school ?? "",
      studentId: input.studentId ?? "",
      phone: input.phone ?? "",
      admissionLetterName: input.admissionLetterName ?? "",
      hostelName: input.hostelName ?? "",
      roomTitle: (input.roomTitle as RoomTitle) ?? "Two-in-two",
      price: input.price ?? "0",
      emergencyContactName: input.emergencyContactName ?? "",
      emergencyContactNumber: input.emergencyContactNumber ?? "",
      relation: input.relation ?? "",
      hasMedicalCondition: !!input.hasMedicalCondition,
      medicalCondition: input.medicalCondition,
      status: (input.status as BookingStatus) ?? "pending payment",
      allocatedRoomNumber: input.allocatedRoomNumber ?? null,
      date: input.date ?? new Date().toISOString().split("T")[0],
    };

    setBookings([...(bookings || []), newBooking]);
  };

  const handleApprovePayment = (id: string) => {
    const b = bookings.find((x) => x.id === id);
    if (!b) return;
    const updated: StudentBooking = { ...b, status: "pending approval" };
    updateBooking(updated);
    setViewingBooking(updated);
  };

  const handleAssignRoom = (id: string, roomNumber: number) => {
    const b = bookings.find((x) => x.id === id);
    if (!b) return;
    const updated: StudentBooking = { ...b, allocatedRoomNumber: roomNumber };
    updateBooking(updated);
    setViewingBooking(updated);
  };

  const handleCompleteOnboarding = async (id: string) => {
    const b = bookings.find((x) => x.id === id);
    if (!b) return;
    const updated: StudentBooking = { ...b, status: "approved" };
    // Optimistically update UI
    updateBooking(updated);
    setViewingBooking(updated);

    if (updated.allocatedRoomNumber == null) {
      toast.error("Cannot complete onboarding without an assigned room");
      return;
    }

    try {
      await apiFetch(`/members`, {
        method: "POST",
        body: JSON.stringify(updated),
      });

      removeBooking(id);
      setViewingBooking(null);
      toast.success("Onboarding completed; booking moved to members.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete onboarding. Please try again.");
    }
  };

  // Approve a booking (used for 'pending approval' -> mark approved/unassigned)
  const handleApprove = (id: string) => {
    const b = bookings.find((x) => x.id === id);
    if (!b) return;
    const updated: StudentBooking = { ...b, status: "approved" };
    updateBooking(updated);
    setViewingBooking(updated);
  };

  const handleDeleteBooking = (id: string) => {
    removeBooking(id);
    // also remove from members if present
    const { removeMember } = useMembersStore.getState();
    removeMember(id);
    setDeletingBookingId(null);
    toast.success("Booking deleted");
  };

  return (
    <main className="p-3 md:px-6">
      <div className=" mx-auto">
        <BookingsHeader onNew={() => setShowAddDialog(true)} />

        <BookingsFilters
          search={search}
          onSearch={setSearch}
          status={statusFilter}
          onStatus={setStatusFilter}
          statusOptions={["all", "pending payment", "pending approval", "unassigned"]}
          gender={genderFilter}
          onGender={setGenderFilter}
          genderOptions={genderOptions}
          room={roomFilter}
          onRoom={setRoomFilter}
          roomOptions={roomOptions}
          onReset={resetFilters}
        />

        <BookingsTable
          bookings={bookings}
          search={search}
          statusFilter={statusFilter}
          genderFilter={genderFilter}
          roomFilter={roomFilter}
          onView={setViewingBooking}
          onDelete={setDeletingBookingId}
        />
      </div>

      <BookingsDialogs
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
        viewingBooking={viewingBooking}
        setViewingBooking={setViewingBooking}
        deletingBookingId={deletingBookingId}
        setDeletingBookingId={setDeletingBookingId}
        onAdd={handleAddBooking}
        onApprovePayment={handleApprovePayment}
        onAssignRoom={handleAssignRoom}
        onCompleteOnboarding={handleCompleteOnboarding}
        onApprove={handleApprove}
        onDeleteConfirm={handleDeleteBooking}
      />
    </main>
  );
}
