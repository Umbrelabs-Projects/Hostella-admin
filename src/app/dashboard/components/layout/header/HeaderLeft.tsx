"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderLeftProps {
  title: string;
  onMenuClick?: () => void;
}

export default function HeaderLeft({ title, onMenuClick }: HeaderLeftProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </div>
  );
}
