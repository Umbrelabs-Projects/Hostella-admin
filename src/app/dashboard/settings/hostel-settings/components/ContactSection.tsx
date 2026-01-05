"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";

interface ContactSectionProps {
  phoneNumber: string;
}

export default function ContactSection({ phoneNumber }: ContactSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="phoneNumber"
          className="text-gray-700 font-semibold flex items-center gap-2"
        >
          <Phone className="h-4 w-4 text-gray-400" />
          Phone Number
        </Label>
        <Input
          id="phoneNumber"
          value={phoneNumber || ""}
          readOnly
          placeholder="+233..."
          className="border-gray-300 bg-gray-50 cursor-not-allowed"
          required
        />
        <p className="text-[10px] text-gray-500 italic">
          Official contact number for students
        </p>
      </div>
    </div>
  );
}
