// app/page.tsx (or components/Home.tsx)
"use client";

import { useEffect } from "react";
import { useChatStore } from "@/stores/useChatStore";
import ChatSidebar from "./components/chatSidebar";
import ChatWindow from "./components/chatWindow/ChatWindow";
import EmptyState from "./components/empty-state";

export default function HomePage() {
  const currentChatId = useChatStore((s) => s.currentChatId);
  const setCurrentChat = useChatStore((s) => s.setCurrentChat);

  // close chat with Escape (global)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCurrentChat(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCurrentChat]);

  return (
    <div className="flex h-screen w-full bg-background">
      <div className="hidden md:block md:w-80 border-r">
        <ChatSidebar />
      </div>

      <div className="md:hidden border-b">
        {/* small header with menu to open sidebar on mobile handled inside ChatHeader/Menu */}
      </div>

      <div className="flex-1">
        {currentChatId ? (
          <ChatWindow chatId={currentChatId} />
        ) : (
          <EmptyState/>
        )}
      </div>
    </div>
  );
}
