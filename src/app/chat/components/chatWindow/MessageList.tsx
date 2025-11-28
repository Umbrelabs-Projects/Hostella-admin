"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import { useChatStore, EMPTY_MESSAGES } from "@/stores/useChatStore";
import MessageBubble from "./MessageBubble";

export default function MessageList({ chatId }: { chatId: string }) {
  const messages = useChatStore((s) => s.messages[chatId] ?? EMPTY_MESSAGES);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  // MessageBubble handles its own context menu (reply/delete)


  return (
    <>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2 flex flex-col">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full ${message.sender === "admin" ? "justify-end" : "justify-start"}`}
            >
              <MessageBubble message={message} chatId={chatId} />
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </ScrollArea>

      {/* individual MessageBubble components manage their own context menus */}
    </>
  );
}
