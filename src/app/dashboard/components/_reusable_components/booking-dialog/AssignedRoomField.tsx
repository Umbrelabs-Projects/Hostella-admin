"use client";

import { Label } from "@/components/ui/label";
import { Home, Calendar } from "lucide-react";
import { StudentBooking } from "@/types/booking";
import { normalizeStatus } from "./utils";

interface AssignedRoomFieldProps {
  booking: StudentBooking;
  isMember: boolean;
  assignedNow: boolean;
}

export default function AssignedRoomField({ 
  booking, 
  isMember, 
  assignedNow 
}: AssignedRoomFieldProps) {
  // Use floorNumber from API if available (preferred), otherwise calculate from room number
  const floorNumber = booking.floorNumber != null 
    ? booking.floorNumber 
    : booking.allocatedRoomNumber != null
      ? (() => {
          const roomNum = typeof booking.allocatedRoomNumber === "string" 
            ? parseInt(booking.allocatedRoomNumber, 10) 
            : booking.allocatedRoomNumber;
          return isNaN(roomNum) ? null : Math.floor((roomNum - 1) / 10) + 1;
        })()
      : null;

  // Check if room is assigned: either has allocatedRoomNumber or status is ROOM_ALLOCATED
  const normalizedStatus = normalizeStatus(booking.status);
  const hasRoomAssigned = booking.allocatedRoomNumber != null || normalizedStatus === "ROOM_ALLOCATED";
  // Show room if: (is member OR just assigned OR status is ROOM_ALLOCATED) AND (has room number OR status is ROOM_ALLOCATED)
  // But only display room number if it actually exists
  const shouldShowRoom = (isMember || assignedNow || normalizedStatus === "ROOM_ALLOCATED") && hasRoomAssigned;
  const hasRoomNumber = booking.allocatedRoomNumber != null;

  return (
    <div className="md:col-span-2">
      <div className="group p-3 rounded-xl bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
        <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4 block">
          Assigned Room
        </Label>
        {shouldShowRoom && hasRoomNumber ? (
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-lg opacity-50"></div>
              <div className="relative px-6 py-4 bg-linear-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-xl border border-blue-400/50">
                <div className="flex items-center gap-3">
                  <Home className="size-6" />
                  <div>
                    <div className="text-xs font-medium opacity-90 mb-0.5">Room Number</div>
                    <div className="text-2xl font-bold tracking-tight">
                      {booking.allocatedRoomNumber}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {floorNumber != null && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
                <Calendar className="size-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Floor {floorNumber}
                </span>
              </div>
            )}
          </div>
        ) : shouldShowRoom && !hasRoomNumber ? (
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Home className="size-3" />
            </div>
            <span className="text-sm font-medium">Room assigned, details loading...</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Home className="size-3" />
            </div>
            <span className="text-sm font-medium italic">Room not yet assigned</span>
          </div>
        )}
      </div>
    </div>
  );
}

