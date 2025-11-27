"use client";

import ConfirmDialog from "@/components/ui/confirm-dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Contact"
      description="Are you sure you want to delete this contact? This action cannot be undone."
      confirmLabel="Delete"
      onConfirm={onConfirm}
    />
  );
}
