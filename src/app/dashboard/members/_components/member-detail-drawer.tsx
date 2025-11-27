"use client";

import React, { useState } from "react";
import { StudentBooking } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function MemberDetailDrawer({
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
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [allocatedRoom, setAllocatedRoom] = useState<number | undefined>(booking?.allocatedRoomNumber ?? undefined);
  const [editingEmergencyNumber, setEditingEmergencyNumber] = useState<string | undefined>(booking?.emergencyContactNumber);

  React.useEffect(() => {
    setAllocatedRoom(booking?.allocatedRoomNumber ?? undefined);
    setEditingEmergencyNumber(booking?.emergencyContactNumber);
  }, [booking]);

  if (!booking) return null;

  const handleRelease = () => {
    const updated: StudentBooking = {
      ...booking,
      allocatedRoomNumber: null
    };
    onUpdate(updated);
    setShowReleaseDialog(false);
  };

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
          <DrawerTitle>Member — {booking.bookingId ?? booking.id}</DrawerTitle>
        </DrawerHeader>

        <div className="mt-2 space-y-4 overflow-auto">
          <section>
            <h4 className="font-semibold">Member Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
              <div><strong>Email:</strong> {booking.email}</div>
              <div><strong>First name:</strong> {booking.firstName}</div>
              <div><strong>Last name:</strong> {booking.lastName}</div>
              <div><strong>Phone:</strong> {booking.phone}</div>
              <div><strong>Hostel:</strong> {booking.hostelName}</div>
              <div><strong>Room Type:</strong> {booking.roomTitle}</div>
              <div><strong>Allocated Room #:</strong> {booking.allocatedRoomNumber ?? "—"}</div>
              <div><strong>Emergency Contact:</strong> {booking.emergencyContactName}</div>
              <div className="col-span-2">
                <label className="block text-sm mb-1">Emergency Number</label>
                <Input value={editingEmergencyNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingEmergencyNumber(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="flex flex-col items-end gap-3">
            <div className="w-full max-w-xs">
              <label className="block text-sm mb-1">Change allocated room</label>
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

            <div className="w-full max-w-xs flex justify-between">
              <div />
              <div className="flex gap-2">
                <Button variant="destructive" onClick={() => setShowReleaseDialog(true)}>Release Room</Button>
              </div>
            </div>
          </section>
        </div>

        {showReleaseDialog && (
          <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Release Room</DialogTitle>
              </DialogHeader>
              <p className="mb-4">Are you sure you want to release this member&apos;s room? This will unassign the room number.</p>
              <DialogFooter>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setShowReleaseDialog(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleRelease}>Confirm Release</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DrawerContent>
    </Drawer>
  );
}
