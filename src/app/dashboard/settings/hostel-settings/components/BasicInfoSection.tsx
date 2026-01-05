"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, MapPin, Layout } from "lucide-react";

interface BasicInfoSectionProps {
  hostelName: string;
  location: string;
  campus: string;
  noOfFloors: string;
}

export default function BasicInfoSection({
  hostelName,
  location,
  campus,
  noOfFloors,
}: BasicInfoSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label
          htmlFor="name"
          className="text-gray-700 font-semibold flex items-center gap-2"
        >
          <Building className="h-4 w-4 text-gray-400" />
          Hostel Name
        </Label>
        <Input
          id="name"
          value={hostelName || ""}
          readOnly
          placeholder="Enter hostel name"
          className="border-gray-300 bg-gray-50 cursor-not-allowed"
          required
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="location"
          className="text-gray-700 font-semibold flex items-center gap-2"
        >
          <MapPin className="h-4 w-4 text-gray-400" />
          Location
        </Label>
        <Input
          id="location"
          value={location || ""}
          readOnly
          placeholder="e.g. Near West Gate"
          className="border-gray-300 bg-gray-50 cursor-not-allowed"
          required
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="campus"
          className="text-gray-700 font-semibold flex items-center gap-2"
        >
          <MapPin className="h-4 w-4 text-gray-400" />
          Campus
        </Label>
        <Input
          id="campus"
          value={campus || ""}
          readOnly
          placeholder="e.g. Main Campus"
          className="border-gray-300 bg-gray-50 cursor-not-allowed"
          required
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="noOfFloors"
          className="text-gray-700 font-semibold flex items-center gap-2"
        >
          <Layout className="h-4 w-4 text-gray-400" />
          Number of Floors
        </Label>
        <Input
          id="noOfFloors"
          value={noOfFloors || "0"}
          readOnly
          className="border-gray-300 bg-gray-50 cursor-not-allowed"
        />
      </div>
    </div>
  );
}
