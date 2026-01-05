"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Key, MapPin } from "lucide-react";
import { StudentBooking } from "@/types/booking";
import InfoField from "./InfoField";
import AssignedRoomField from "./AssignedRoomField";

interface AccommodationCardProps {
  booking: StudentBooking;
  isMember: boolean;
  assignedNow: boolean;
}

export default function AccommodationCard({
  booking,
  isMember,
  assignedNow,
}: AccommodationCardProps) {
  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader className="pb-5 border-b border-gray-200 dark:border-gray-800">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-50">
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Building2 className="size-4 text-purple-600 dark:text-purple-400" />
          </div>
          Accommodation Details
        </CardTitle>
      </CardHeader>
      <CardContent className="">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField
            label="Room Type"
            icon={Key}
            iconColor="purple"
            value={
              ["Three-in-one", "Triple", "TP"].includes(booking.roomTitle)
                ? "Triple"
                : booking.roomTitle
            }
          />

          <InfoField
            label="Hostel"
            icon={MapPin}
            iconColor="orange"
            value={booking.hostelName}
          />

          <AssignedRoomField
            booking={booking}
            isMember={isMember}
            assignedNow={assignedNow}
          />
        </div>
      </CardContent>
    </Card>
  );
}
