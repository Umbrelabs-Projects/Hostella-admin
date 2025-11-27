"use client"

import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm?: () => void;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "OK",
  onConfirm,
}: ConfirmDialogProps) {
  void confirmLabel;
  useEffect(() => {
    if (!open) return;
    const ok = window.confirm(`${title || "Confirm"}\n\n${description || "Are you sure?"}`);
    if (ok) {
      onConfirm?.();
    }
    onOpenChange(false);
  }, [open, onOpenChange, onConfirm, title, description]);

  return null;
}
