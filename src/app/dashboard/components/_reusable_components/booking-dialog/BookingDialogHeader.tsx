"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, IdCard, User } from "lucide-react";
import Image from "next/image";
import { StudentBooking } from "@/types/booking";
import { getStatusColor, getDisplayVariant } from "./utils";

interface BookingDialogHeaderProps {
  booking: StudentBooking;
  userAvatar: string | null;
  displayStatus: string;
  displayVariant: ReturnType<typeof getDisplayVariant>;
  normalizedStatus: string;
  onCopyBookingId: () => void;
}

export default function BookingDialogHeader({
  booking,
  userAvatar,
  displayStatus,
  displayVariant,
  normalizedStatus,
  onCopyBookingId,
}: BookingDialogHeaderProps) {
  return (
    <div
      className={`relative bg-linear-to-br ${getStatusColor(
        normalizedStatus
      )} px-8 pt-8 pb-6 overflow-hidden shrink-0`}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
      </div>

      <DialogHeader className="relative z-10 space-y-5">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden">
                  {booking.avatar || booking.imageUrl || userAvatar ? (
                    <Image
                      src={
                        booking.avatar || booking.imageUrl || userAvatar || ""
                      }
                      alt={`${booking.firstName} ${booking.lastName}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="size-7 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold text-white mb-2 tracking-tight">
                  {booking.firstName} {booking.lastName}
                </DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 px-2 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                    <IdCard className="size-4 text-white/90" />
                    <span className="text-xs font-medium text-white/90">
                      Booking ID
                    </span>
                    <span className="font-mono font-bold text-white text-xs ml-1">
                      {booking.bookingId}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-1 hover:bg-white/20 text-white"
                      onClick={onCopyBookingId}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={displayVariant}
              className="text-sm px-5 py-2 font-semibold bg-white/20 backdrop-blur-md border-white/30 text-white shadow-lg"
            >
              {displayStatus}
            </Badge>
          </div>
        </div>
      </DialogHeader>
    </div>
  );
}
