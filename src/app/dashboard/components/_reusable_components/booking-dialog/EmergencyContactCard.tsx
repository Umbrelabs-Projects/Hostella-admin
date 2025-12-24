"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Phone, User } from "lucide-react";
import { StudentBooking } from "@/types/booking";
import InfoField from "./InfoField";

interface EmergencyContactCardProps {
  booking: StudentBooking;
}

export default function EmergencyContactCard({ booking }: EmergencyContactCardProps) {
  return (
    <Card className="border-0 shadow-lg bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 backdrop-blur-sm">
      <CardHeader className="pb-5 border-b border-amber-200 dark:border-amber-800">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-50">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          Emergency Contact
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField
            label="Contact Name"
            icon={User}
            iconColor="amber"
            value={booking.emergencyContactName}
            className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-amber-200 dark:border-amber-800"
          />
          
          <InfoField
            label="Contact Number"
            icon={Phone}
            iconColor="amber"
            value={booking.emergencyContactNumber}
            href={`tel:${booking.emergencyContactNumber}`}
            className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-amber-200 dark:border-amber-800"
          />
        </div>
      </CardContent>
    </Card>
  );
}

