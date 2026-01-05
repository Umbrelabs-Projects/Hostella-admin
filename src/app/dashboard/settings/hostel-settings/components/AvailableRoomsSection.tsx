"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Layout } from "lucide-react";

interface AvailableRoomsSectionProps {
  availableSingleRooms: number;
  availableDoubleRooms: number;
  availableTripleRooms: number;
}

export default function AvailableRoomsSection({
  availableSingleRooms,
  availableDoubleRooms,
  availableTripleRooms,
}: AvailableRoomsSectionProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <Label className="text-gray-700 font-semibold flex items-center gap-2">
        <Layout className="h-4 w-4 text-gray-400" />
        Available Rooms
      </Label>
      <div className="grid grid-cols-3 gap-4">
        {/* Single Rooms */}
        <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Label className="text-gray-700 font-semibold text-center">
            Single
          </Label>
          <div className="text-3xl font-bold text-blue-700 text-center">
            {availableSingleRooms}
          </div>
          <p className="text-xs text-gray-600 text-center">
            One-in-one rooms
          </p>
        </div>

        {/* Double Rooms */}
        <div className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
          <Label className="text-gray-700 font-semibold text-center">
            Double
          </Label>
          <div className="text-3xl font-bold text-green-700 text-center">
            {availableDoubleRooms}
          </div>
          <p className="text-xs text-gray-600 text-center">
            Two-in-one rooms
          </p>
        </div>

        {/* Triple Rooms */}
        <div className="space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <Label className="text-gray-700 font-semibold text-center">
            Triple
          </Label>
          <div className="text-3xl font-bold text-purple-700 text-center">
            {availableTripleRooms}
          </div>
          <p className="text-xs text-gray-600 text-center">
            Three-in-one rooms
          </p>
        </div>
      </div>
    </div>
  );
}
