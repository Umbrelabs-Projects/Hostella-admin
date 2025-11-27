"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DataTable from "../components/_reusable_components/data-table";
import { columns } from "../components/_reusable_components/columns";
import AddContactDialog from "../components/_reusable_components/add-contact-dialog";
import EditContactDialog from "../components/_reusable_components/edit-contact-dialog";
import DeleteConfirmDialog from "../components/_reusable_components/delete-confirm-dialog";
import { useBookingsStore } from "@/stores/useBookingsStore";
import { useMembersStore } from "@/stores/useMembersStore";
import { StudentBooking } from "@/types/booking";

export default function Bookings() {
  
  const { bookings, updateBooking, setBookings } = useBookingsStore();
  const { members, setMembers } = useMembersStore();

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
      gender: (input.gender as any) ?? "male",
      level: (input.level as any) ?? "100",
      school: input.school ?? "",
      studentId: input.studentId ?? "",
      phone: input.phone ?? "",
      admissionLetterName: input.admissionLetterName ?? "",
      hostelName: input.hostelName ?? "",
      roomTitle: (input.roomTitle as any) ?? "Two-in-two",
      price: input.price ?? "0",
      emergencyContactName: input.emergencyContactName ?? "",
      emergencyContactNumber: input.emergencyContactNumber ?? "",
      relation: input.relation ?? "",
      hasMedicalCondition: !!input.hasMedicalCondition,
      medicalCondition: input.medicalCondition,
      status: (input.status as any) ?? "pending payment",
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

  const handleCompleteOnboarding = (id: string) => {
    const b = bookings.find((x) => x.id === id);
    if (!b) return;
    const updated: StudentBooking = { ...b, status: "approved" };
    updateBooking(updated);
    setViewingBooking(updated);
    // add or update member list
    const exists = members.find((m) => m.id === updated.id);
    if (exists) {
      setMembers(members.map((m) => (m.id === updated.id ? updated : m)));
    } else {
      setMembers([...(members || []), updated]);
    }
  };

  const handleDeleteBooking = (id: string) => {
    setBookings(bookings.filter((b) => b.id !== id));
    setDeletingBookingId(null);
  };

  return (
    <main className="p-3 md:px-6">
      <div className=" mx-auto">
        {/* Header with Add button */}
        <div className="mb-2 flex justify-end items-center">
          <Button
            onClick={() => setShowAddDialog(true)}
            size="lg"
            className="cursor-pointer bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </div>
        <DataTable
          columns={columns({ onView: setViewingBooking, onDelete: setDeletingBookingId })}
          data={bookings}
        />
      </div>

      <AddContactDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddBooking} />

      {viewingBooking && (
        <EditContactDialog
          booking={viewingBooking}
          onOpenChange={(open) => !open && setViewingBooking(null)}
          onApprovePayment={handleApprovePayment}
          onAssignRoom={handleAssignRoom}
          onCompleteOnboarding={handleCompleteOnboarding}
        />
      )}

      {deletingBookingId && (
        <DeleteConfirmDialog
          open={!!deletingBookingId}
          onOpenChange={(open) => !open && setDeletingBookingId(null)}
          onConfirm={() => handleDeleteBooking(deletingBookingId)}
        />
      )}
    </main>
  );
}
