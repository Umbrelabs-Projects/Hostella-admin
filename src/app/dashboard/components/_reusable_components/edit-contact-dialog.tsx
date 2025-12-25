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
  onRemoveStudent?: (id: string) => void;
  loadingActions?: Record<string, boolean>;
}

export default function EditContactDialog({
  booking,
  onOpenChange,
  
  onApprovePayment,
  onAssignRoom,
  onCompleteOnboarding,
  onApprove,
  onCancel,
  onRemoveStudent,
  loadingActions = {},
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
      toast.error("Failed to copy", { duration: 4000 });
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
  // Refresh booking data periodically when dialog is open to catch external updates
  useEffect(() => {
    const refreshBooking = async () => {
      if (!local.id) return;
      
      try {
        type BookingDetailResponse = {
          success?: boolean;
          data?: StudentBooking & {
            payment?: {
              id: string;
              status: string;
              provider?: string;
              receiptUrl?: string;
              reference?: string;
            };
          };
        };
        
        const response = await apiFetch<BookingDetailResponse>(`/bookings/${local.id}`);
        const bookingData = response.data || (response as unknown as StudentBooking);
        
        if (bookingData) {
          // Update local state with fresh booking data including payment info
          setLocal(prev => ({
            ...prev,
            ...bookingData,
            status: bookingData.status || prev.status,
            avatar: bookingData.avatar || prev.avatar,
            // Include payment data if available
            ...((bookingData as any).payment && { payment: (bookingData as any).payment }),
          }));
        }
      } catch (error) {
        // Silently fail - booking might not be accessible
      }
    };

    // Refresh immediately when dialog opens
    refreshBooking();
    
    // Refresh every 5 seconds while dialog is open to catch external updates
    const interval = setInterval(refreshBooking, 5000);
    
    return () => clearInterval(interval);
  }, [local.id]);

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

  // Fetch payment information and receipt when booking is in PENDING_PAYMENT or PENDING_APPROVAL status
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      const isPendingPayment = normalizedStatus === "PENDING_PAYMENT" || local.status.toLowerCase() === "pending payment";
      const isPendingApproval = normalizedStatus === "PENDING_APPROVAL" || local.status.toLowerCase() === "pending approval";
      
      if (isPendingPayment || isPendingApproval) {
        setReceiptLoading(true);
        try {
          // First, check if payment info is already in the booking object
          const bookingPayment = (local as any)?.payment || (booking as any)?.payment;
          if (bookingPayment?.receiptUrl) {
            setReceiptUrl(bookingPayment.receiptUrl);
            // Update local state with payment info if not already there
            if (bookingPayment && !(local as any)?.payment) {
              setLocal(prev => ({ ...prev, payment: bookingPayment } as any));
            }
            setReceiptLoading(false);
            return;
          }

          // Fetch pending receipts to get payment info and receipt URL
          const pendingResponse = await apiFetch<{
            success: boolean;
            data?: Array<{
              id: string;
              bookingId: string;
              receiptUrl?: string;
              status: string;
              provider?: string;
              booking?: { id: string; bookingId?: string };
            }>;
            items?: Array<{
              id: string;
              bookingId: string;
              receiptUrl?: string;
              status: string;
              provider?: string;
              booking?: { id: string; bookingId?: string };
            }>;
          }>("/payments/admin/pending-receipts?limit=100");
          
          let receipts: Array<{
            id: string;
            bookingId: string;
            receiptUrl?: string;
            status: string;
            provider?: string;
            booking?: { id: string; bookingId?: string };
          }> = [];

          if (pendingResponse.success) {
            if (Array.isArray(pendingResponse.data)) {
              receipts = pendingResponse.data;
            } else if (Array.isArray(pendingResponse.items)) {
              receipts = pendingResponse.items;
            } else if (pendingResponse.data && typeof pendingResponse.data === "object" && "items" in pendingResponse.data) {
              receipts = Array.isArray((pendingResponse.data as any).items) ? (pendingResponse.data as any).items : [];
            }
          }

          // Find receipt for this booking - match by booking ID or internal ID
          // Try multiple matching strategies
          const bookingReceipt = receipts.find(
            (payment) => {
              // Match by internal booking ID
              if (payment.booking?.id === local.id) return true;
              // Match by display booking ID
              if (payment.booking?.bookingId === local.bookingId) return true;
              // Match by payment.bookingId (could be internal ID or display ID)
              if (payment.bookingId === local.id || payment.bookingId === local.bookingId) return true;
              return false;
            }
          );

          if (bookingReceipt) {
            // Set receipt URL if available
            if (bookingReceipt.receiptUrl) {
              setReceiptUrl(bookingReceipt.receiptUrl);
            }
            
            // Update local state with payment info so Approve Payment button can show
            if (!(local as any)?.payment) {
              setLocal(prev => ({
                ...prev,
                payment: {
                  id: bookingReceipt.id,
                  status: bookingReceipt.status,
                  provider: bookingReceipt.provider,
                  receiptUrl: bookingReceipt.receiptUrl,
                }
              } as any));
            }
          }
        } catch (error) {
          // Silently fail - receipt might not exist
          console.warn("Failed to fetch payment info:", error);
        } finally {
          setReceiptLoading(false);
        }
      } else {
        // Clear receipt URL if status changed away from pending payment/approval
        setReceiptUrl(undefined);
      }
    };

    fetchPaymentInfo();
  }, [local.id, local.bookingId, normalizedStatus, local.status, (local as any)?.payment, (booking as any)?.payment]);

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

        {/* Scrollable Content Area */}
        <div className="p-6 space-y-5 bg-linear-to-b from-gray-50/50 to-white dark:from-gray-950/50 dark:to-gray-900 overflow-y-auto flex-1 min-h-0">
          <PersonalInfoCard booking={local} />
          <AccommodationCard booking={local} isMember={isMember} assignedNow={assignedNow} />

          {/* Payment Receipt Card - Show when receipt is available or loading for PENDING_PAYMENT or PENDING_APPROVAL */}
          {(normalizedStatus === "PENDING_PAYMENT" || local.status.toLowerCase() === "pending payment" ||
            normalizedStatus === "PENDING_APPROVAL" || local.status.toLowerCase() === "pending approval") && (
            <PaymentReceiptCard
              receiptUrl={receiptUrl}
              receiptLoading={receiptLoading}
              onViewFullSize={() => setShowReceiptModal(true)}
            />
          )}

          {/* Emergency Contact Card */}
          {isMember && <EmergencyContactCard booking={local} />}
        </div>

        {/* Fixed Footer with Action Buttons */}
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
          onRemoveStudent={onRemoveStudent}
          loadingActions={loadingActions}
        />
      </DialogContent>

      <AssignRoomDialog
        open={openAssign}
        bookingId={local.id} // Use internal ID for API calls
        onOpenChange={(o) => setOpenAssign(o)}
        onAssign={async (id, roomId) => {
          await onAssignRoom?.(id, roomId);
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
