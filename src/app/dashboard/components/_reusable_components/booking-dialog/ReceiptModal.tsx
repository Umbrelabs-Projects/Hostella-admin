"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, Check } from "lucide-react";
import Image from "next/image";

interface ReceiptModalProps {
  open: boolean;
  receiptUrl: string;
  onClose: () => void;
  onApprovePayment?: () => void;
}

export default function ReceiptModal({
  open,
  receiptUrl,
  onClose,
  onApprovePayment,
}: ReceiptModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-green-600" />
            Payment Receipt
          </DialogTitle>
          <DialogDescription>
            Review the payment receipt before approving payment
          </DialogDescription>
        </DialogHeader>
        <div className="relative w-full h-[70vh] rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
          <Image
            src={receiptUrl}
            alt="Payment Receipt"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            onClick={() => window.open(receiptUrl, "_blank")}
            variant="outline"
          >
            <Download className="size-4 mr-2" />
            Download
          </Button>
          {onApprovePayment && (
            <Button
              onClick={onApprovePayment}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Check className="size-4 mr-2" />
              Approve Payment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

