"use client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";

interface VerificationType {
  verified: boolean;
  value: string;
}

interface VerificationItemProps {
  title: string;
  description: string;
  status: VerificationType;
  actionLabel?: string;
  onAction?: () => void;
}

export default function VerificationItem({
  title,
  description,
  status,
  actionLabel,
  onAction,
}: VerificationItemProps) {
  const renderStatus = () => {
    if (status.verified) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Verified</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-yellow-600">
        <Clock className="w-5 h-5" />
        <span className="text-sm font-medium">Pending</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-3">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        {renderStatus()}
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 w-full sm:w-auto text-sm"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
