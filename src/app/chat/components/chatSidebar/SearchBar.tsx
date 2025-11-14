// components/chat/ChatSidebar/SearchBar.tsx
"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="p-4 border-b border-border relative">
      <Search className="absolute left-7 top-7 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Search students..."
        className="pl-9 bg-muted"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
