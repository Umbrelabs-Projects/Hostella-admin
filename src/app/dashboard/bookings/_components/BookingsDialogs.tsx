"use client";

import AddContactDialog from "../../components/_reusable_components/add-contact-dialog";
import EditContactDialog from "../../components/_reusable_components/edit-contact-dialog";
import DeleteConfirmDialog from "../../components/_reusable_components/delete-confirm-dialog";
import { StudentBooking } from "@/types/booking";

type Props = {
  showAddDialog: boolean;
  setShowAddDialog: (v: boolean) => void;
  viewingBooking: StudentBooking | null;
  setViewingBooking: (v: StudentBooking | null) => void;
  deletingBookingId: string | null;
  setDeletingBookingId: (v: string | null) => void;
  onAdd: (input: Partial<StudentBooking>) => void;
  onApprovePayment: (id: string) => void;
  onAssignRoom: (id: string, roomNumber: number) => void;
  onCompleteOnboarding: (id: string) => Promise<void>;
  onApprove: (id: string) => void;
  onDeleteConfirm: (id: string) => void;
};

export default function BookingsDialogs({
  showAddDialog,
  setShowAddDialog,
  viewingBooking,
  setViewingBooking,
  deletingBookingId,
  setDeletingBookingId,
  onAdd,
  onApprovePayment,
  onAssignRoom,
  onCompleteOnboarding,
  onApprove,
  onDeleteConfirm,
}: Props) {
  return (
    <>
      <AddContactDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={onAdd} />

      {viewingBooking && (
        <EditContactDialog
          booking={viewingBooking}
          onOpenChange={(open) => !open && setViewingBooking(null)}
          onApprovePayment={onApprovePayment}
          onAssignRoom={onAssignRoom}
          onCompleteOnboarding={onCompleteOnboarding}
          onApprove={onApprove}
        />
      )}

      {deletingBookingId && (
        <DeleteConfirmDialog
          open={!!deletingBookingId}
          onOpenChange={(open) => !open && setDeletingBookingId(null)}
          onConfirm={() => deletingBookingId && onDeleteConfirm(deletingBookingId)}
        />
      )}
    </>
  );
}
