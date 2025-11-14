// components/chat/ChatSidebar/SidebarHeader.tsx
"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SidebarHeader() {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Chats</h1>
        <Button size="icon" variant="ghost">
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
