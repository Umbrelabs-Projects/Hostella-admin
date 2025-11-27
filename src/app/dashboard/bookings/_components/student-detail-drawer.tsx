"use client";

import React, { useState } from "react";
import { StudentBooking } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function StudentDetailDrawer({
  booking,
  open,
  onOpenChange,
  onUpdate
}: {
  booking: StudentBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updated: StudentBooking) => void;
}) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [allocatedRoom, setAllocatedRoom] = useState<number | undefined>(booking?.allocatedRoomNumber ?? undefined);
  const [editingEmergencyNumber, setEditingEmergencyNumber] = useState<string | undefined>(booking?.emergencyContactNumber);

  React.useEffect(() => {
    setAllocatedRoom(booking?.allocatedRoomNumber ?? undefined);
    setEditingEmergencyNumber(booking?.emergencyContactNumber);
  }, [booking]);

  if (!booking) return null;

  const handleApprove = () => {
    const updated = { ...booking, status: "pending approval" as const };
    onUpdate(updated);
    setShowApproveDialog(false);
  };

  // (removed unused sync effect)

  const handleUpdateAllocation = () => {
    const updated: StudentBooking = {
      ...booking,
      allocatedRoomNumber: allocatedRoom ?? null,
      emergencyContactNumber: editingEmergencyNumber ?? booking.emergencyContactNumber
    };
    if (allocatedRoom != null && booking.status === "pending approval") {
      updated.status = "approved";
    }
    onUpdate(updated);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Booking — {booking.bookingId ?? booking.id}</DrawerTitle>
        </DrawerHeader>

        <div className="mt-2 space-y-4 overflow-auto">
          <section>
            <h4 className="font-semibold">Student Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
              <div><strong>Email:</strong> {booking.email}</div>
              <div><strong>First name:</strong> {booking.firstName}</div>
              <div><strong>Last name:</strong> {booking.lastName}</div>
              <div><strong>Gender:</strong> {booking.gender}</div>
              <div><strong>Level:</strong> {booking.level}</div>
              <div><strong>School:</strong> {booking.school}</div>
              <div><strong>Student ID:</strong> {booking.studentId}</div>
              <div><strong>Phone:</strong> {booking.phone}</div>
              <div><strong>Admission Letter:</strong> {booking.admissionLetterName ?? "—"}</div>
              <div><strong>Booking ID:</strong> {booking.bookingId ?? "—"}</div>
              <div><strong>Hostel:</strong> {booking.hostelName}</div>
              <div><strong>Room Type:</strong> {booking.roomTitle}</div>
              <div><strong>Price:</strong> {booking.price}</div>
              <div><strong>Emergency Contact:</strong> {booking.emergencyContactName}</div>
              <div><strong>Emergency Number:</strong>
                <div className="mt-1">
                  <Input value={editingEmergencyNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingEmergencyNumber(e.target.value)} />
                </div>
              </div>
              <div><strong>Relation:</strong> {booking.relation}</div>
              <div><strong>Has Medical Condition:</strong> {booking.hasMedicalCondition ? "Yes" : "No"}</div>
              {booking.hasMedicalCondition && (
                <div><strong>Medical Condition:</strong> {booking.medicalCondition}</div>
              )}
              <div><strong>Status:</strong> {booking.status}</div>
              <div><strong>Allocated Room #:</strong> {booking.allocatedRoomNumber ?? "—"}</div>
            </div>
          </section>

          <section className="flex flex-col items-end gap-3">
            {booking.status === "pending payment" && (
              <div className="flex gap-2">
                <Button onClick={() => setShowApproveDialog(true)}>Approve payment</Button>
              </div>
            )}

            {booking.status === "pending approval" && (
              <div className="w-full max-w-xs">
                <label className="block text-sm mb-1">Allocate room</label>
                <Select value={allocatedRoom?.toString() ?? ""} onValueChange={(v) => setAllocatedRoom(v ? Number(v) : undefined)}>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                      <SelectItem key={n} value={String(n)}>{`Room ${n}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="mt-2 flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
                  <Button onClick={handleUpdateAllocation}>Update</Button>
                </div>
              </div>
            )}

            {booking.status === "approved" && (
              <div className="text-sm text-green-700 font-medium">This booking is approved.</div>
            )}
          </section>

          {showApproveDialog && (
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve Payment</DialogTitle>
                </DialogHeader>
                <p className="mb-4">Are you sure you want to approve the student&apos;s payment? Approving will move the booking to <strong>pending approval</strong> so you can allocate a room.</p>
                <DialogFooter>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
                    <Button onClick={handleApprove}>Confirm Approve</Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
