"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AssignRoomDialog from "./assign-room-dialog";
// Input removed (not used in this dialog)
import { Label } from "@/components/ui/label";
import { StudentBooking } from "@/types/booking";
import { Badge } from "@/components/ui/badge";

interface BookingDetailsDialogProps {
  booking: StudentBooking;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (b: StudentBooking) => void;
  onApprovePayment?: (id: string) => void;
  onAssignRoom?: (id: string, roomNumber: number) => void;
  onCompleteOnboarding?: (id: string) => void;
}

export default function EditContactDialog({
  booking,
  onOpenChange,
  
  onApprovePayment,
  onAssignRoom,
  onCompleteOnboarding,
}: BookingDetailsDialogProps) {
  const [local, setLocal] = useState<StudentBooking>(booking);

  useEffect(() => setLocal(booking), [booking]);

  const [openAssign, setOpenAssign] = useState(false);

  const handleAssign = () => setOpenAssign(true);

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{local.firstName} {local.lastName}</DialogTitle>
          <DialogDescription>
            Booking ID: <span className="font-mono">{local.bookingId}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <div className="font-semibold">{local.firstName} {local.lastName}</div>
            </div>
            <div>
              <Label>Student ID</Label>
              <div className="text-sm">{local.studentId}</div>
            </div>
            <div>
              <Label>Phone</Label>
              <div className="text-sm">{local.phone}</div>
            </div>
            <div>
              <Label>Gender</Label>
              <div className="text-sm">{local.gender}</div>
            </div>
            <div>
              <Label>Room Type</Label>
              <div className="text-sm">{local.roomTitle}</div>
            </div>
            <div>
              <Label>Hostel</Label>
              <div className="text-sm">{local.hostelName}</div>
            </div>
            <div>
              <Label>Status</Label>
              <div className="mt-1"><Badge>{local.status}</Badge></div>
            </div>
            <div>
              <Label>Assigned Room</Label>
              <div className="text-sm">{local.allocatedRoomNumber ?? "—"}</div>
            </div>
          </div>

          {/* Conditional emergency details: only show for approved/members view */}
          {(local.status === "approved") && (
            <div className="space-y-2 pt-2 border-t">
              <Label>Emergency Contact</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>{local.emergencyContactName}</div>
                <div>{local.emergencyContactNumber}</div>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            {local.status === "pending payment" && (
              <Button onClick={() => onApprovePayment?.(local.id)}>Approve Payment</Button>
            )}
            {local.status === "pending approval" && (
              <Button onClick={handleAssign}>Assign Room</Button>
            )}
            {local.status === "pending approval" && local.allocatedRoomNumber != null && (
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => onCompleteOnboarding?.(local.id)}>Complete Onboarding</Button>
            )}
          </div>
        </div>
      </DialogContent>
      <AssignRoomDialog
        open={openAssign}
        bookingId={local.bookingId ?? local.id}
        onOpenChange={(o) => setOpenAssign(o)}
        onAssign={(id, room) => onAssignRoom?.(id, room)}
      />
    </Dialog>
  );
}
