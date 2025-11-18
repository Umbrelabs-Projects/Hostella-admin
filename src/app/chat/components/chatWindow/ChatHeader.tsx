"use client";

import { useChatStore } from "@/stores/useChatStore";

export default function ChatHeader({ chatId }: { chatId: string }) {
  const chatInfo = useChatStore((s) => s.chatsInfo[chatId]);

  return (
    <div className="p-4 flex items-center border-b border-muted">
      <div className="avatar bg-primary/10 w-10 h-10 flex items-center justify-center rounded-full">{chatInfo?.avatar}</div>
      <div className="ml-3">
        <p className="font-medium">{chatInfo?.name}</p>
        <p className="text-sm text-muted-foreground">{chatInfo?.roomInfo}</p>
      </div>
    </div>
  );
}
