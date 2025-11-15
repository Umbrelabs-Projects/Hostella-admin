// components/chat/ChatWindow/ChatHeader.tsx
"use client";

import { Menu, Phone, Video, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChatStore } from "@/stores/useChatStore";

export default function ChatHeader({ chatId }: { chatId: string }) {
  const chatInfo = useChatStore((s) => s.chatsInfo[chatId]);

  return (
    <div className="border-b border-border p-4 flex items-center justify-between bg-card">
      <div className="flex items-center gap-3 flex-1">
        <Button size="icon" variant="ghost" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>

        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {chatInfo?.avatar}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground">{chatInfo?.name}</h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                chatInfo?.online ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <p className="text-xs text-muted-foreground">
              {chatInfo?.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="icon" variant="ghost">
          <Phone className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="ghost">
          <Video className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="ghost">
          <Search className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="ghost">
          <Info className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
