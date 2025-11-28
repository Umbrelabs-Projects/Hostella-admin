"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import ChatItem from "./ChatItem";
import { useChatStore } from "@/stores/useChatStore";

export default function ChatList({ filter }: { filter: string }) {
  const chatsInfo = useChatStore((s) => s.chatsInfo);
  const currentChatId = useChatStore((s) => s.currentChatId);
  const setCurrentChat = useChatStore((s) => s.setCurrentChat);

  const list = Object.values(chatsInfo).filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y divide-border">
        {list.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isActive={currentChatId === chat.id}
            onSelect={() => setCurrentChat(chat.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
