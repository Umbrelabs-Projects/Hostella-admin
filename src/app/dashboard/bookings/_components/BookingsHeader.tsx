"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Props = {
  onNew: () => void;
};

export default function BookingsHeader({ onNew }: Props) {
  return (
    <div className="mb-2 flex justify-end items-center">
      <Button
        onClick={onNew}
        size="lg"
        className="cursor-pointer bg-green-600 hover:bg-green-700"
      >
        <Plus className="h-4 w-4" />
        New Booking
      </Button>
    </div>
  );
}
