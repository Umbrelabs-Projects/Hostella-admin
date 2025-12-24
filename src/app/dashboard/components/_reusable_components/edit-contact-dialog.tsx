"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AssignRoomDialog from "./assign-room-dialog";
import { StudentBooking } from "@/types/booking";
import { toast } from "sonner";
import { useMembersStore } from "@/stores/useMembersStore";
import { apiFetch } from "@/lib/api";
import BookingDialogHeader from "./booking-dialog/BookingDialogHeader";
import PersonalInfoCard from "./booking-dialog/PersonalInfoCard";
import AccommodationCard from "./booking-dialog/AccommodationCard";
import PaymentReceiptCard from "./booking-dialog/PaymentReceiptCard";
import EmergencyContactCard from "./booking-dialog/EmergencyContactCard";
import BookingActionButtons from "./booking-dialog/BookingActionButtons";
import ReceiptModal from "./booking-dialog/ReceiptModal";
import {
  normalizeStatus,
  getDisplayStatus,
  getDisplayVariant,
} from "./booking-dialog/utils";

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
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const handleAssign = () => setOpenAssign(true);

  const copyBookingId = async () => {
    try {
      await navigator.clipboard.writeText(local.bookingId ?? local.id);
      toast.success("Booking ID copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const normalizedStatus = normalizeStatus(local.status);
  const explicitMembers = useMembersStore((s) => s.members);
  const isMember = explicitMembers.some((m) => m.id === local.id);
  const displayStatus = getDisplayStatus(normalizedStatus, isMember);
  const displayVariant = getDisplayVariant(displayStatus, local.status);

  useEffect(() => {
    // reset assignedNow when switching bookings
    setAssignedNow(false);
    setReceiptUrl(null);
    setShowReceiptModal(false);
    setUserAvatar(null);
  }, [local.id]);

  // Fetch user avatar - API returns avatar directly in booking response per API docs
  useEffect(() => {
    // According to API docs: "The booking response includes the student's 'avatar' field"
    // Check if booking has avatar directly (should be in API response)
    if (local.avatar) {
      setUserAvatar(local.avatar);
      return;
    }
    
    // Legacy support: check imageUrl
    if (local.imageUrl) {
      setUserAvatar(local.imageUrl);
      return;
    }

    // Check original booking object (might have avatar from initial API call)
    if (booking.avatar) {
      setUserAvatar(booking.avatar);
      return;
    }

    // If not in local state, fetch booking detail (API includes avatar in response)
    const fetchBookingDetail = async () => {
      try {
        type BookingDetailResponse = {
          success?: boolean;
          data?: StudentBooking;
        };
        
        const response = await apiFetch<BookingDetailResponse>(`/bookings/${local.id}`);
        
        // API returns avatar directly in booking object: { data: { avatar: "...", ... } }
        const bookingData = response.data || (response as unknown as StudentBooking);
        const avatar = (bookingData as StudentBooking).avatar;
          
        if (avatar) {
          if (process.env.NODE_ENV === "development") {
            console.log("[BookingDialog] Found avatar from booking detail:", avatar);
          }
          setUserAvatar(avatar);
          // Also update local state so we don't need to fetch again
          setLocal(prev => ({ ...prev, avatar }));
        } else {
          if (process.env.NODE_ENV === "development") {
            console.log("[BookingDialog] No avatar field in booking response - student may not have uploaded one");
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.log("[BookingDialog] Error fetching booking detail:", error);
        }
      }
    };

    fetchBookingDetail();
  }, [local.id, local.avatar, local.imageUrl, booking]);

  // Fetch payment receipt when booking is in PENDING_PAYMENT status
  useEffect(() => {
    const fetchReceipt = async () => {
      if (normalizedStatus === "PENDING_PAYMENT" || local.status.toLowerCase() === "pending payment") {
        setReceiptLoading(true);
        try {
          // Fetch pending receipts and find one matching this booking
          const response = await apiFetch<{
            success: boolean;
            data: Array<{
              id: string;
              bookingId: string;
              receiptUrl: string;
              status: string;
              booking?: { id: string; bookingId?: string };
            }>;
          }>("/payments/admin/pending-receipts?limit=100");
          
          if (response.success && response.data) {
            // Find receipt for this booking - match by booking ID or internal ID
            const bookingReceipt = response.data.find(
              (payment) => 
                payment.bookingId === local.id || 
                payment.bookingId === local.bookingId ||
                payment.booking?.id === local.id ||
                payment.booking?.bookingId === local.bookingId
            );
            if (bookingReceipt?.receiptUrl) {
              setReceiptUrl(bookingReceipt.receiptUrl);
            }
          }
        } catch {
          // Silently fail - receipt might not exist
          // Receipt might not exist for this booking
        } finally {
          setReceiptLoading(false);
        }
      }
    };

    fetchReceipt();
  }, [local.id, local.bookingId, normalizedStatus, local.status]);

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 gap-0 flex flex-col">
        <BookingDialogHeader
          booking={local}
          userAvatar={userAvatar}
          displayStatus={displayStatus}
          displayVariant={displayVariant}
          normalizedStatus={normalizedStatus}
          onCopyBookingId={copyBookingId}
        />

        <div className="p-6 space-y-5 bg-linear-to-b from-gray-50/50 to-white dark:from-gray-950/50 dark:to-gray-900 overflow-y-auto flex-1 min-h-0">
          <PersonalInfoCard booking={local} />
          <AccommodationCard booking={local} isMember={isMember} assignedNow={assignedNow} />

          {/* Payment Receipt Card - Show when receipt is available */}
          {(normalizedStatus === "PENDING_PAYMENT" || local.status.toLowerCase() === "pending payment") && (
            <PaymentReceiptCard
              receiptUrl={receiptUrl}
              receiptLoading={receiptLoading}
              onViewFullSize={() => setShowReceiptModal(true)}
            />
          )}

          {/* Emergency Contact Card */}
          {isMember && <EmergencyContactCard booking={local} />}

          {/* Action Buttons */}
          <BookingActionButtons
            booking={local}
            normalizedStatus={normalizedStatus}
            isMember={isMember}
            onClose={() => onOpenChange(false)}
            onApprovePayment={onApprovePayment}
            onApprove={onApprove}
            onAssignRoom={handleAssign}
            onCompleteOnboarding={onCompleteOnboarding}
            onCancel={onCancel}
          />
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

      {/* Receipt Modal */}
      {showReceiptModal && receiptUrl && (
        <ReceiptModal
          open={showReceiptModal}
          receiptUrl={receiptUrl}
          onClose={() => setShowReceiptModal(false)}
          onApprovePayment={() => {
            onApprovePayment?.(local.id);
            setShowReceiptModal(false);
          }}
        />
      )}
    </Dialog>
  );
}
