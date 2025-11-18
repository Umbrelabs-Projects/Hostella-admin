// app/page.tsx
"use client";

import { useEffect } from "react";
import { connectChatSocket, onChatSocketMessage, disconnectChatSocket } from "@/lib/chatSocket";
import { apiFetch } from "@/lib/api";
import type { Message } from "@/types/chat";

import { useChatStore } from "@/stores/useChatStore";
import ChatSidebar from "./components/chatSidebar";
import ChatWindow from "./components/chatWindow/ChatWindow";
import EmptyState from "./components/empty-state";

export default function HomePage() {
  const currentChatId = useChatStore((s) => s.currentChatId);
  const setCurrentChat = useChatStore((s) => s.setCurrentChat);
  const setMessages = useChatStore((s) => s.setMessages);

  // Connect WebSocket and fetch chat history
  useEffect(() => {
    connectChatSocket("wss://your-chat-server.com/ws");
    onChatSocketMessage((msg: Message) => {
      if (msg && msg.id && msg.sender && typeof msg.chatId === "string") {
        setMessages(msg.chatId, msg);
      }
    });
    return () => {
      disconnectChatSocket();
    };
  }, [setMessages]);

  // Fetch chat history when chat changes
  useEffect(() => {
    if (currentChatId) {
      apiFetch<Message[]>(`/chat/${currentChatId}/messages`).then((msgs) => {
        setMessages(currentChatId, ...msgs);
      });
    }
  }, [currentChatId, setMessages]);

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
        {/* mobile header (e.g. hamburger) can go here */}
      </div>

      <div className="flex-1">
        {currentChatId ? (
          <ChatWindow chatId={currentChatId} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
