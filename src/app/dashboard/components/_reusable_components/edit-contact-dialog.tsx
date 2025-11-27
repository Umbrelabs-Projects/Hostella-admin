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
import { Label } from "@/components/ui/label";
import { StudentBooking } from "@/types/booking";
import { Badge } from "@/components/ui/badge";
import { Copy, Home, User, Phone, Check, CreditCard } from "lucide-react";
import { toast } from "sonner";

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

  const copyBookingId = async () => {
    try {
      await navigator.clipboard.writeText(local.bookingId ?? local.id);
      toast.success("Booking ID copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const statusVariant = (status: StudentBooking["status"]) =>
    status === "pending payment" ? "secondary" : status === "pending approval" ? "outline" : "default";

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-3">
                <User className="size-5 opacity-80" />
                <span>{local.firstName} {local.lastName}</span>
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm flex items-center gap-2">
                <span>Booking ID:</span>
                <span className="font-mono bg-muted/10 px-2 py-0.5 rounded">{local.bookingId}</span>
                <Button variant="ghost" size="sm" className="h-7" onClick={copyBookingId}>
                  <Copy className="size-4" />
                </Button>
              </DialogDescription>
            </div>
            <div className="text-right">
              <Badge variant={statusVariant(local.status)} className="text-sm px-3">{local.status}</Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-3">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label>Name</Label>
              <div className="font-semibold">{local.firstName} {local.lastName}</div>
            </div>
            <div className="space-y-1">
              <Label>Student ID</Label>
              <div className="text-sm">{local.studentId}</div>
            </div>

            <div className="space-y-1">
              <Label>Phone</Label>
              <div className="text-sm flex items-center gap-2"><Phone className="size-4 opacity-70" />{local.phone}</div>
            </div>
            <div className="space-y-1">
              <Label>Gender</Label>
              <div className="text-sm">{local.gender}</div>
            </div>

            <div className="space-y-1">
              <Label>Room Type</Label>
              <div className="text-sm">{local.roomTitle}</div>
            </div>
            <div className="space-y-1">
              <Label>Hostel</Label>
              <div className="text-sm flex items-center gap-2"><Home className="size-4 opacity-70" />{local.hostelName}</div>
            </div>

            <div className="space-y-1">
              <Label>Assigned Room</Label>
              <div className="text-lg font-medium">{local.allocatedRoomNumber ?? "—"}</div>
            </div>
            <div />
          </div>

          {(local.status === "approved") && (
            <div className="space-y-2 pt-2 border-t">
              <Label>Emergency Contact</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>{local.emergencyContactName}</div>
                <div>{local.emergencyContactNumber}</div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            {local.status === "pending payment" && (
              <Button onClick={() => onApprovePayment?.(local.id)}>
                <CreditCard className="size-4 mr-2" />Approve Payment
              </Button>
            )}
            {local.status === "pending approval" && (
              <Button onClick={handleAssign}>Assign Room</Button>
            )}
            {local.status === "pending approval" && local.allocatedRoomNumber != null && (
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => onCompleteOnboarding?.(local.id)}>
                <Check className="size-4 mr-2" />Complete Onboarding
              </Button>
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
