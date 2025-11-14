// components/chat/ChatWindow/MessageList.tsx
"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import { useChatStore } from "@/stores/useChatStore";
import MessageBubble from "./MessageBubble";
import ContextMenu from "./ContextMenu";

export default function MessageList({ chatId }: { chatId: string }) {
  const messages = useChatStore((s) => s.messages[chatId] ?? []);
  const contextMenu = useChatStore((s) => s.contextMenu);
  const setContextMenu = useChatStore((s) => s.setContextMenu);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const handleContext = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, messageId });
  };

  return (
    <>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2 flex flex-col">
          {messages.map((message) => (
            <div key={message.id} onContextMenu={(e) => handleContext(e, message.id)}>
              <MessageBubble key={message.id} message={message} chatId={chatId} />
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </ScrollArea>

      {contextMenu && contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} messageId={contextMenu.messageId} chatId={chatId} />}
    </>
  );
}
