"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, IdCard, Phone, Users } from "lucide-react";
import { StudentBooking } from "@/types/booking";
import InfoField from "./InfoField";

interface PersonalInfoCardProps {
  booking: StudentBooking;
}

export default function PersonalInfoCard({ booking }: PersonalInfoCardProps) {
  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader className="pb-5 border-b border-gray-200 dark:border-gray-800">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-50">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <User className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField
            label="Full Name"
            icon={User}
            iconColor="blue"
            value={`${booking.firstName} ${booking.lastName}`}
            valueClassName="font-semibold"
          />
          
          <InfoField
            label="Student ID"
            icon={IdCard}
            iconColor="indigo"
            value={booking.studentId}
            valueClassName="font-mono"
          />
          
          <InfoField
            label="Phone Number"
            icon={Phone}
            iconColor="green"
            value={booking.phone}
            href={`tel:${booking.phone}`}
          />
          
          <InfoField
            label="Gender"
            icon={Users}
            iconColor="pink"
            value={booking.gender}
            valueClassName="capitalize"
          />
        </div>
      </CardContent>
    </Card>
  );
}

