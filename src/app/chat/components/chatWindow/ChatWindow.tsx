"use client";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({ chatId }: { chatId: string }) {
  return (
    <div className="h-full flex flex-col bg-linear-to-b from-card to-background">
      <ChatHeader chatId={chatId} />
      <MessageList chatId={chatId} />
      <MessageInput chatId={chatId} />
    </div>
  );
}
