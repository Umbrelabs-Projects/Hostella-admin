"use client";

import React from "react";
import { StudentBooking } from "@/types/booking";
import { Button } from "@/components/ui/button";
import AssignRoomDialog from "../../components/_reusable_components/assign-room-dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";

export default function StudentDetailDrawer({
  booking,
  open,
  onOpenChange,
  onApprovePayment,
  onAssignRoom,
  onCompleteOnboarding,
}: {
  booking: StudentBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprovePayment?: (id: string) => void;
  onAssignRoom?: (id: string, room: number) => void;
  onCompleteOnboarding?: (id: string) => void;
}) {
  const [openAssign, setOpenAssign] = React.useState(false);

  const handleAssign = () => setOpenAssign(true);

  if (!booking) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Booking — {booking.bookingId ?? booking.id}</DrawerTitle>
        </DrawerHeader>

        <div className="mt-2 space-y-4 overflow-auto p-4">
          <section>
            <h4 className="font-semibold">Student Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
              <div><strong>Email:</strong> {booking.email}</div>
              <div><strong>Student ID:</strong> {booking.studentId}</div>
              <div><strong>Name:</strong> {booking.firstName} {booking.lastName}</div>
              <div><strong>Phone:</strong> {booking.phone}</div>
              <div><strong>Gender:</strong> {booking.gender}</div>
              <div><strong>Level:</strong> {booking.level}</div>
              <div><strong>Room Type:</strong> {booking.roomTitle}</div>
              <div><strong>Hostel:</strong> {booking.hostelName}</div>
              <div><strong>Status:</strong> <Badge>{booking.status}</Badge></div>
              <div><strong>Booking Date:</strong> {booking.date}</div>
              <div><strong>Allocated Room:</strong> {booking.allocatedRoomNumber ?? "—"}</div>
            </div>
          </section>

          {/* Emergency details — only show when approved/member */}
          {booking.status === "approved" && (
            <section className="pt-2 border-t">
              <h4 className="font-semibold">Emergency Contact</h4>
              <div className="mt-2 text-sm">
                <div><strong>Name:</strong> {booking.emergencyContactName}</div>
                <div><strong>Phone:</strong> {booking.emergencyContactNumber}</div>
                <div><strong>Relation:</strong> {booking.relation}</div>
              </div>
            </section>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            {booking.status === "pending payment" && (
              <Button onClick={() => onApprovePayment?.(booking.id)}>Approve Payment</Button>
            )}
            {booking.status === "pending approval" && (
              <>
                <Button onClick={handleAssign}>Assign Room</Button>
                {booking.allocatedRoomNumber != null && (
                  <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => onCompleteOnboarding?.(booking.id)}>Complete Onboarding</Button>
                )}
              </>
            )}
          </div>
        </div>
      </DrawerContent>
      <AssignRoomDialog
        open={openAssign}
        bookingId={booking.bookingId ?? booking.id}
        onOpenChange={(o) => setOpenAssign(o)}
        onAssign={(id, room) => onAssignRoom?.(id, room)}
      />
    </Drawer>
  );
}

