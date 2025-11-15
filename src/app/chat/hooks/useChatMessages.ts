// /hooks/useChatMessages.ts
"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/stores/useChatStore";

export default function useChatMessages(chatId: string) {
  const messages = useChatStore((s) => s.messages[chatId] ?? []);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  return { messages, bottomRef };
}
