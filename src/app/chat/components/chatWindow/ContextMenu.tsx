"use client";

import { useChatStore } from "@/stores/useChatStore";

interface ContextMenuProps {
  x: number;
  y: number;
  messageId: string;
  chatId: string;
}

export default function ContextMenu({ x, y, messageId, chatId }: ContextMenuProps) {
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const setContextMenu = useChatStore((s) => s.setContextMenu);

  const handleDelete = () => {
    deleteMessage(chatId, messageId);
    setContextMenu(null);
  };

  return (
    <div
      className="absolute bg-white border rounded-lg shadow-lg z-50"
      style={{ top: y, left: x }}
    >
      <button
        className="px-4 py-2 hover:bg-red-100 text-red-600 w-full text-left"
        onClick={handleDelete}
      >
        Delete
      </button>
    </div>
  );
}
