"use client"

import * as React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm?: () => void | Promise<void>;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirm",
  description,
  confirmLabel = "OK",
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  // Reset internal loading state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setIsLoading(false);
    }
  }, [open]);

  const handleConfirm = React.useCallback(async () => {
    if (loading || isLoading) return;
    setIsLoading(true);
    try {
      await onConfirm?.();
      // Always close dialog after successful confirm
      onOpenChange(false);
    } catch {
      // Keep dialog open on error for retry
    } finally {
      setIsLoading(false);
    }
  }, [onConfirm, onOpenChange, loading, isLoading]);

  const handleCancel = React.useCallback(() => {
    if (loading || isLoading) return;
    onOpenChange(false);
  }, [onOpenChange, loading, isLoading]);

  const isButtonLoading = loading || isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isButtonLoading}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isButtonLoading}>
            {isButtonLoading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                {confirmLabel.includes("...") ? confirmLabel : `${confirmLabel}...`}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
