"use client";
import VerificationItem from "./components/VerificationItem";
import { useAuthStore } from "@/stores/useAuthStore";

export default function VerificationSettings() {
  const user = useAuthStore((s) => s.user);

  const verificationStatus = {
    email: {
      verified: !!user?.emailVerified,
      value: user?.email || "Not provided",
    },
    phone: {
      verified: !!user?.phoneVerified,
      value: user?.phone || "Not provided",
    },
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Account Verification
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Verify your account information for enhanced security
        </p>
      </div>

      <div className="space-y-4">
        <VerificationItem
          title="Email Address"
          description={verificationStatus.email.value}
          status={verificationStatus.email}
        />
        <VerificationItem
          title="Phone Number"
          description={verificationStatus.phone.value}
          status={verificationStatus.phone}
        />
      </div>
    </div>
  );
}
