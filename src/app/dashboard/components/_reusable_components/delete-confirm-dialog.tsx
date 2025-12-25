"use client";

import ConfirmDialog from "@/components/ui/confirm-dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  title = "Delete Contact",
  description = "Are you sure you want to delete this contact? This action cannot be undone.",
  confirmLabel = "Delete",
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}
