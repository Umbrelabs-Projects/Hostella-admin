"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AssignRoomDialog from "./assign-room-dialog";
import { StudentBooking, PaymentInfo } from "@/types/booking";
import { toast } from "sonner";
import { useMembersStore } from "@/stores/useMembersStore";
import { apiFetch } from "@/lib/api";
import BookingDialogHeader from "./booking-dialog/BookingDialogHeader";
import PersonalInfoCard from "./booking-dialog/PersonalInfoCard";
import AccommodationCard from "./booking-dialog/AccommodationCard";
import PaymentReceiptCard from "./booking-dialog/PaymentReceiptCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
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
  onAssignRoom?: (id: string, roomId: string) => Promise<StudentBooking> | void;
  onCompleteOnboarding?: (id: string) => void;
  onApprove?: (id: string) => void;
  onCancel?: (id: string, reason?: string) => void;
  onRemoveStudent?: (id: string) => void;
  onUnassignRoom?: (id: string) => void | Promise<void>;
  onReassignRoom?: (id: string, roomId?: string) => Promise<StudentBooking | undefined> | void;
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
  onUnassignRoom,
  onReassignRoom,
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
          setLocal(prev => {
            const bookingWithPayment = bookingData as StudentBooking;
            return {
              ...prev,
              ...bookingData,
              status: bookingData.status || prev.status,
              avatar: bookingData.avatar || prev.avatar,
              // Include payment data if available
              ...(bookingWithPayment.payment && { payment: bookingWithPayment.payment }),
            };
          });
        }
      } catch (_error) {
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
          const localWithPayment = local as StudentBooking;
          const bookingWithPayment = booking as StudentBooking;
          const bookingPayment = localWithPayment.payment || bookingWithPayment.payment;
          if (bookingPayment?.receiptUrl) {
            setReceiptUrl(bookingPayment.receiptUrl);
            // Update local state with payment info if not already there
            if (bookingPayment && !localWithPayment.payment) {
              setLocal(prev => ({ ...prev, payment: bookingPayment }));
            }
            setReceiptLoading(false);
            return;
          }

          // Fetch payment for this booking using the new unified endpoint
          // Use the booking-specific endpoint first (more efficient)
          let bookingReceipt: {
            id: string;
            bookingId: string;
            receiptUrl?: string;
            status: string;
            provider?: string;
            booking?: { id: string; bookingId?: string };
          } | null = null;
          try {
            const paymentResponse = await apiFetch<{
              success: boolean;
              data?: {
                payment: {
                  id: string;
                  bookingId: string;
                  receiptUrl?: string;
                  status: string;
                  provider?: string;
                  booking?: { id: string; bookingId?: string };
                };
              };
              payment?: {
                id: string;
                bookingId: string;
                receiptUrl?: string;
                status: string;
                provider?: string;
                booking?: { id: string; bookingId?: string };
              };
            }>(`/payments/booking/${local.id}`);
            
            if (paymentResponse.success) {
              const payment = paymentResponse.data?.payment || paymentResponse.payment;
              if (payment) {
                bookingReceipt = payment;
              }
            }
          } catch (_error) {
            // If booking-specific endpoint fails, try fetching all payments and filter
            // This is a fallback for edge cases
            try {
              const allPaymentsResponse = await apiFetch<{
                success: boolean;
                data?: {
                  items: Array<{
                    id: string;
                    bookingId: string;
                    receiptUrl?: string;
                    status: string;
                    provider?: string;
                    booking?: { id: string; bookingId?: string };
                  }>;
                };
                items?: Array<{
                  id: string;
                  bookingId: string;
                  receiptUrl?: string;
                  status: string;
                  provider?: string;
                  booking?: { id: string; bookingId?: string };
                }>;
              }>("/payments?limit=100");
              
              if (allPaymentsResponse.success) {
                const receipts: Array<{
                  id: string;
                  bookingId: string;
                  receiptUrl?: string;
                  status: string;
                  provider?: string;
                  booking?: { id: string; bookingId?: string };
                }> = [];
                
                if (allPaymentsResponse.data && typeof allPaymentsResponse.data === "object" && "items" in allPaymentsResponse.data) {
                  receipts.push(...(Array.isArray(allPaymentsResponse.data.items) ? allPaymentsResponse.data.items : []));
                } else if (Array.isArray(allPaymentsResponse.items)) {
                  receipts.push(...allPaymentsResponse.items);
                }
                
                // Find receipt for this booking
                const foundReceipt = receipts.find(
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
                if (foundReceipt) {
                  bookingReceipt = foundReceipt;
                }
              }
            } catch (fallbackError) {
              // Silently fail - payment might not exist
              console.warn("Failed to fetch payment info:", fallbackError);
            }
          }
          if (bookingReceipt) {
            // Set receipt URL if available
            if (bookingReceipt.receiptUrl) {
              setReceiptUrl(bookingReceipt.receiptUrl);
            }
            
            // Update local state with payment info so Approve Payment button can show
            const localTyped = local as StudentBooking;
            if (!localTyped.payment) {
              setLocal(prev => ({
                ...prev,
                payment: {
                  id: bookingReceipt.id,
                  status: bookingReceipt.status as PaymentInfo['status'],
                  provider: bookingReceipt.provider ? (bookingReceipt.provider as "BANK_TRANSFER" | "PAYSTACK") : undefined,
                  receiptUrl: bookingReceipt.receiptUrl,
                }
              }));
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
        setReceiptUrl(null);
      }
    };

    fetchPaymentInfo();
  }, [local.id, local.bookingId, normalizedStatus, local.status, (local as StudentBooking).payment, (booking as StudentBooking).payment]);

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

          {/* Show Payment Receipt Card for Bank Transfer, or Paystack if receipt exists */}
          {(normalizedStatus === "PENDING_PAYMENT" || local.status.toLowerCase() === "pending payment" ||
            normalizedStatus === "PENDING_APPROVAL" || local.status.toLowerCase() === "pending approval") && (
            (local.payment?.provider === "BANK_TRANSFER" || receiptUrl || local.payment?.provider === "PAYSTACK") ? (
              <>
                {local.payment?.provider === "BANK_TRANSFER" || receiptUrl ? (
                  <PaymentReceiptCard
                    receiptUrl={receiptUrl}
                    receiptLoading={receiptLoading}
                    onViewFullSize={() => setShowReceiptModal(true)}
                  />
                ) : null}
                {local.payment?.provider === "PAYSTACK" && !receiptUrl ? (
                  <Card className="border-0 shadow-lg bg-linear-to-br from-purple-50 via-indigo-50 to-violet-50 dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-violet-950/30 backdrop-blur-sm">
                    <CardHeader className="pb-5 border-b border-purple-200 dark:border-purple-800">
                      <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-50">
                        <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <CreditCard className="size-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        Paystack Payment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 space-y-2">
                      <div><span className="font-semibold">Reference:</span> {local.payment?.reference}</div>
                      <div><span className="font-semibold">Status:</span> {local.payment?.status}</div>
                      <div><span className="font-semibold">Provider:</span> {local.payment?.provider}</div>
                      {local.payment?.payerPhone && (
                        <div><span className="font-semibold">Payer Phone:</span> {local.payment.payerPhone}</div>
                      )}
                    </CardContent>
                  </Card>
                ) : null}
              </>
            ) : null
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
          onUnassignRoom={onUnassignRoom}
          onReassignRoom={onReassignRoom ? () => setOpenAssign(true) : undefined}
          loadingActions={loadingActions}
        />
      </DialogContent>

      <AssignRoomDialog
        open={openAssign}
        bookingId={local.id} // Always use internal ID for both bookings and members (API expects internal ID)
        isMember={isMember} // Pass isMember prop to use correct API endpoint
        onOpenChange={(o) => {
          setOpenAssign(o);
          if (!o) {
            // Reset state when dialog closes
            setAssignedNow(false);
          }
        }}
        onAssign={async (bookingId, roomId) => {
          try {
            // If onReassignRoom is provided (for members), use it; otherwise use onAssignRoom
            if (isMember && onReassignRoom) {
              const updated = await onReassignRoom(local.id, roomId);
              // Update local state if updated booking is returned
              if (updated) {
                setLocal(updated);
              }
              setOpenAssign(false);
            } else {
              const updated = await onAssignRoom?.(local.id, roomId);
              // Update local state immediately with the updated booking
              if (updated) {
                setLocal(updated);
              }
              setAssignedNow(true);
            }
          } catch (error) {
            // Error handling is done by the parent component
            throw error;
          }
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
