"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface FacilitiesSectionProps {
  facilities: string[];
}

export default function FacilitiesSection({
  facilities,
}: FacilitiesSectionProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <Label className="text-gray-700 font-semibold">
        Facilities & Amenities
      </Label>
      <div className="flex flex-wrap gap-2 mb-4">
        {facilities.map((facility, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="px-3 py-1 flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-100"
          >
            {facility}
          </Badge>
        ))}
        {facilities.length === 0 && (
          <p className="text-sm text-gray-400 italic">
            No facilities added yet.
          </p>
        )}
      </div>
    </div>
  );
}
