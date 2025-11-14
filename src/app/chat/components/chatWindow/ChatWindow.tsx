// components/chat/ChatWindow/ChatWindow.tsx
"use client";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChatStore } from "@/stores/useChatStore";

export default function ChatWindow({ chatId }: { chatId: string }) {
  // chatId is passed from page; in case page passes null, guard earlier.
  return (
    <div className="h-full flex flex-col bg-linear-to-b from-card to-background">
      <ChatHeader chatId={chatId} />
      <MessageList chatId={chatId} />
      <MessageInput chatId={chatId} />
    </div>
  );
}
