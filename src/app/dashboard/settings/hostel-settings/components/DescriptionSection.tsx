"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Layout } from "lucide-react";

interface DescriptionSectionProps {
  description: string;
}

export default function DescriptionSection({
  description,
}: DescriptionSectionProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="description"
        className="text-gray-700 font-semibold flex items-center gap-2"
      >
        <Layout className="h-4 w-4 text-gray-400" />
        Description
      </Label>
      <Textarea
        id="description"
        value={description || ""}
        readOnly
        placeholder="A brief description of your hostel..."
        className="min-h-[120px] border-gray-300 bg-gray-50 cursor-not-allowed"
      />
    </div>
  );
}
