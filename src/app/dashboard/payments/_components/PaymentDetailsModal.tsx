import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentReceipt } from "@/stores/usePaymentsStore";

interface PaymentDetailsModalProps {
  open: boolean;
  payment: PaymentReceipt;
  onClose: () => void;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({ open, payment, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Amount:</span> GHS {payment.amount.toLocaleString()}
          </div>
          <div>
            <span className="font-semibold">Reference:</span> {payment.reference}
          </div>
          <div>
            <span className="font-semibold">Status:</span> {payment.status}
          </div>
          <div>
            <span className="font-semibold">Provider:</span> {payment.provider}
          </div>
          {payment.payerPhone && (
            <div>
              <span className="font-semibold">Payer Phone:</span> {payment.payerPhone}
            </div>
          )}
          {payment.verificationData && (
            <div>
              <span className="font-semibold">Verification Data:</span>
              <pre className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs mt-1 overflow-x-auto">
                {JSON.stringify(payment.verificationData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailsModal;
