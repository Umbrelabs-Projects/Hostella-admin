"use client";

import { CreditCard, Receipt } from "lucide-react";

interface PaymentsHeaderProps {
  totalCount: number;
  bankCount: number;
  paystackCount: number;
}

export default function PaymentsHeader({
  totalCount,
  bankCount,
  paystackCount,
}: PaymentsHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Payment Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review and verify student payment receipts and Paystack payments
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Pending
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">
                {totalCount}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
              <Receipt className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Bank Receipts
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">
                {bankCount}
              </p>
            </div>
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
              <Receipt className="size-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Paystack Payments
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">
                {paystackCount}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
              <CreditCard className="size-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

