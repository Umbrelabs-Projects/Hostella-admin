"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download } from "lucide-react";
import Image from "next/image";

interface PaymentReceiptCardProps {
  receiptUrl: string | null;
  receiptLoading: boolean;
  onViewFullSize: () => void;
}

export default function PaymentReceiptCard({
  receiptUrl,
  receiptLoading,
  onViewFullSize,
}: PaymentReceiptCardProps) {
  if (!receiptUrl && !receiptLoading) return null;

  return (
    <Card className="border-0 shadow-lg bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 backdrop-blur-sm">
      <CardHeader className="pb-5 border-b border-green-200 dark:border-green-800">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-50">
          <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
            <FileText className="size-4 text-green-600 dark:text-green-400" />
          </div>
          Payment Receipt
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {receiptLoading ? (
          <div className="flex items-center justify-center py-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">Loading receipt...</div>
          </div>
        ) : receiptUrl ? (
          <div className="space-y-4">
            <div className="relative group">
              <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-green-200 dark:border-green-800 bg-gray-100 dark:bg-gray-800">
                <Image
                  src={receiptUrl}
                  alt="Payment Receipt"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  onClick={onViewFullSize}
                  className="bg-white/90 hover:bg-white text-gray-900 shadow-lg"
                >
                  <Eye className="size-4 mr-2" />
                  View Full Size
                </Button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(receiptUrl, "_blank")}
                className="flex-1"
              >
                <Download className="size-4 mr-2" />
                Download Receipt
              </Button>
              <Button
                variant="outline"
                onClick={onViewFullSize}
                className="flex-1"
              >
                <Eye className="size-4 mr-2" />
                View Full Size
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

