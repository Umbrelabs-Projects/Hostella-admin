// components/chat/ChatSidebar/ChatItem.tsx
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChatStore } from "@/stores/useChatStore";
import type { ChatInfo } from "@/types/chat";

export default function ChatItem({ chat }: { chat: ChatInfo }) {
  const currentChatId = useChatStore((s) => s.currentChatId);
  const setCurrentChat = useChatStore((s) => s.setCurrentChat);

  const isActive = currentChatId === chat.id;

  return (
    <button
      onClick={() => setCurrentChat(chat.id)}
      className={`w-full p-3 text-left transition-colors hover:bg-muted ${
        isActive ? "bg-primary/10 border-l-4 border-primary" : ""
      }`}
    >
      <div className="flex gap-3 items-start">
        <Avatar className="h-12 w-12 mt-1">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {chat.avatar}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {chat.name}
            </h3>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {/* timestamp elided for mocks */}
            </span>
          </div>

          <p className="text-sm text-muted-foreground bg-muted/50 rounded px-2 py-0.5 w-fit mb-1">
            {chat.roomInfo}
          </p>

          <p className="text-sm text-muted-foreground truncate">Last message</p>
        </div>
      </div>
    </button>
  );
}
