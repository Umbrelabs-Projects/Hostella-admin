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
import { Copy, Home, User, Phone, Check, CreditCard, X, Key } from "lucide-react";
import { toast } from "sonner";
import { useMembersStore } from "@/stores/useMembersStore";

interface BookingDetailsDialogProps {
  booking: StudentBooking;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (b: StudentBooking) => void;
  onApprovePayment?: (id: string) => void;
  onAssignRoom?: (id: string, roomNumber: number) => void;
  onCompleteOnboarding?: (id: string) => void;
  onApprove?: (id: string) => void;
  onCancel?: (id: string, reason?: string) => void;
}

export default function EditContactDialog({
  booking,
  onOpenChange,
  
  onApprovePayment,
  onAssignRoom,
  onCompleteOnboarding,
  onApprove,
  onCancel,
}: BookingDetailsDialogProps) {
  const [local, setLocal] = useState<StudentBooking>(booking);

  useEffect(() => setLocal(booking), [booking]);

  const [openAssign, setOpenAssign] = useState(false);
  const [assignedNow, setAssignedNow] = useState(false);

  const handleAssign = () => setOpenAssign(true);

  const copyBookingId = async () => {
    try {
      await navigator.clipboard.writeText(local.bookingId ?? local.id);
      toast.success("Booking ID copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Normalize status for comparison (API returns lowercase with spaces/underscores, normalize to uppercase with underscores)
  const normalizeStatus = (status: string): string => {
    const normalized = status.toLowerCase().trim();
    const statusMap: Record<string, string> = {
      "pending payment": "PENDING_PAYMENT",
      "pending approval": "PENDING_APPROVAL",
      "approved": "APPROVED",
      "room_allocated": "ROOM_ALLOCATED",
      "room allocated": "ROOM_ALLOCATED",
      "completed": "COMPLETED",
      "cancelled": "CANCELLED",
      "rejected": "REJECTED",
      "expired": "EXPIRED",
    };
    return statusMap[normalized] || normalized.toUpperCase().replace(/\s+/g, "_");
  };

  const normalizedStatus = normalizeStatus(local.status);

  const statusVariant = (status: string) => {
    const norm = normalizeStatus(status);
    if (norm === "PENDING_PAYMENT") return "secondary";
    if (norm === "PENDING_APPROVAL") return "outline";
    if (norm === "APPROVED") return "default";
    if (norm === "ROOM_ALLOCATED") return "default";
    if (norm === "COMPLETED") return "default";
    if (norm === "CANCELLED") return "destructive";
    if (norm === "REJECTED") return "destructive";
    if (norm === "EXPIRED") return "secondary";
    return "default";
  };

  // derive display label: membership is explicit in members store
  const explicitMembers = useMembersStore((s) => s.members);
  const isMember = explicitMembers.some((m) => m.id === local.id);

  const displayStatus = (() => {
    if (isMember) {
      return normalizedStatus === "COMPLETED" ? "Member" : "Member";
    }
    if (normalizedStatus === "APPROVED") return "Approved (Unassigned)";
    if (normalizedStatus === "ROOM_ALLOCATED") return "Room Allocated";
    if (normalizedStatus === "COMPLETED") return "Completed";
    if (normalizedStatus === "CANCELLED") return "Cancelled";
    if (normalizedStatus === "REJECTED") return "Rejected";
    if (normalizedStatus === "EXPIRED") return "Expired";
    // Convert to readable format
    return normalizedStatus.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  })();

  const displayVariant = (() => {
    if (displayStatus === "unassigned") return "outline";
    if (displayStatus.startsWith("Member")) return "default";
    return statusVariant(local.status);
  })();

  const floorNumber = local.allocatedRoomNumber != null ? Math.floor((local.allocatedRoomNumber - 1) / 10) + 1 : null;

  useEffect(() => {
    // reset assignedNow when switching bookings
    setAssignedNow(false);
  }, [local.id]);

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
              <Badge variant={displayVariant} className="text-sm px-3">{displayStatus}</Badge>
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
              <div className="text-lg font-medium">{(isMember || assignedNow) ? (local.allocatedRoomNumber ?? "—") : "—"}</div>
            </div>
            {(isMember || assignedNow) && floorNumber != null && (
              <div className="space-y-1">
                <Label>Floor</Label>
                <div className="text-sm">{String(floorNumber)}</div>
              </div>
            )}
            <div />
          </div>

          {(isMember) && (
            <div className="space-y-2 pt-2 border-t">
              <Label>Emergency Contact</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>{local.emergencyContactName}</div>
                <div>{local.emergencyContactNumber}</div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="size-4 mr-2" />Close
            </Button>

            {/* Approve Payment - only for PENDING_PAYMENT */}
            {(normalizedStatus === "PENDING_PAYMENT" || local.status.toLowerCase() === "pending payment") && (
              <Button onClick={() => onApprovePayment?.(local.id)}>
                <CreditCard className="size-4 mr-2" />Approve Payment
              </Button>
            )}

            {/* Approve Booking - only for PENDING_APPROVAL */}
            {(normalizedStatus === "PENDING_APPROVAL" || local.status.toLowerCase() === "pending approval") && (
              <Button onClick={() => onApprove?.(local.id)}>
                <Check className="size-4 mr-2" />Approve Booking
              </Button>
            )}

            {/* Assign Room - only for APPROVED status */}
            {(normalizedStatus === "APPROVED" || local.status.toLowerCase() === "approved") && !isMember && (
              <Button onClick={handleAssign}><Key className="size-4 mr-2" />Assign Room</Button>
            )}

            {/* Complete Onboarding - only for ROOM_ALLOCATED status */}
            {normalizedStatus === "ROOM_ALLOCATED" && !isMember && (
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => onCompleteOnboarding?.(local.id)}>
                <Check className="size-4 mr-2" />Complete Onboarding
              </Button>
            )}

            {/* Cancel Booking - available for all statuses except COMPLETED */}
            {normalizedStatus !== "COMPLETED" && onCancel && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  const reason = prompt("Reason for cancellation (optional):");
                  onCancel(local.id, reason || undefined);
                }}
              >
                <X className="size-4 mr-2" />Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
      <AssignRoomDialog
        open={openAssign}
        bookingId={local.bookingId ?? local.id}
        onOpenChange={(o) => setOpenAssign(o)}
        onAssign={(id, room) => {
          onAssignRoom?.(id, room);
          setAssignedNow(true);
        }}
      />
    </Dialog>
  );
}
