"use client";

import { ChatInfo } from "@/types/chat";

export default function ChatItem({
  chat,
  isActive,
  onSelect,
}: {
  chat: ChatInfo;
  isActive?: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`flex items-center p-4 cursor-pointer hover:bg-muted rounded-lg ${
        isActive ? "bg-primary/10" : ""
      }`}
      onClick={onSelect}
    >
      <div className="w-10 h-10 flex items-center justify-center bg-primary/20 rounded-full mr-3">
        {chat.avatar}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium">{chat.name}</h3>
        <p className="text-xs text-muted-foreground">{chat.roomInfo}</p>
      </div>
    </div>
  );
}
