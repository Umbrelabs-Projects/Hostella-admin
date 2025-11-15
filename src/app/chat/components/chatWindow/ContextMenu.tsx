// components/chat/ChatWindow/ContextMenu.tsx
"use client";

import { useChatStore } from "@/stores/useChatStore";

export default function ContextMenu({
  x,
  y,
  messageId,
  chatId,
}: {
  x: number;
  y: number;
  messageId: string;
  chatId: string;
}) {
  const setContextMenu = useChatStore((s) => s.setContextMenu);
  const setReplying = useChatStore((s) => s.setReplying);
  const messages = useChatStore((s) => s.messages[chatId] ?? []);
  const deleteMessage = useChatStore((s) => s.deleteMessage);

  const msg = messages.find((m) => m.id === messageId);
  if (!msg) return null;

  const handleReply = () => {
    setReplying(msg);
    setContextMenu(null);
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.text);
    } catch {
      // ignore
    }
    setContextMenu(null);
  };
  const handleDelete = () => {
    deleteMessage(chatId, messageId);
    setContextMenu(null);
  };

  return (
    <div
      style={{ top: y, left: x }}
      className="fixed bg-card border border-border rounded-lg shadow-lg z-50"
    >
      <button
        onClick={handleReply}
        className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2"
      >
        ↩ Reply
      </button>
      <button
        onClick={handleCopy}
        className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2"
      >
        📋 Copy
      </button>
      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
      >
        🗑️ Delete
      </button>
    </div>
  );
}
