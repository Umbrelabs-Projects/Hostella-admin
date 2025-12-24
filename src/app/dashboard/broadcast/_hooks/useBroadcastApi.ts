// src/app/dashboard/broadcast/_hooks/useBroadcastApi.ts

import { useCallback } from "react";
import { BroadcastComposer } from "@/types/broadcast";
import { useBroadcastStore } from "@/stores/useBroadcastStore";
import { toast } from "sonner";

export function useBroadcastApi() {
  const {
    fetchMessages,
    sendMessage,
    deleteMessageApi,
    resendMessage,
  } = useBroadcastStore();

  const handleFetchMessages = useCallback(
    async (page = 1, pageSize = 10) => {
      try {
        await fetchMessages(page, pageSize);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch messages";
        toast.error(message, { duration: 4000 });
      }
    },
    [fetchMessages]
  );

  const handleSendMessage = useCallback(
    async (message: BroadcastComposer) => {
      try {
        const newMessage = await sendMessage(message);
        toast.success("Message sent successfully!");
        return newMessage;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send message";
        toast.error(message, { duration: 4000 });
        throw err;
      }
    },
    [sendMessage]
  );

  const handleDeleteMessage = useCallback(
    async (id: string) => {
      try {
        await deleteMessageApi(id);
        toast.success("Message deleted successfully");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete message";
        toast.error(message, { duration: 4000 });
        throw err;
      }
    },
    [deleteMessageApi]
  );

  const handleResendMessage = useCallback(
    async (id: string) => {
      try {
        const updated = await resendMessage(id);
        toast.success("Message resent successfully");
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to resend message";
        toast.error(message, { duration: 4000 });
        throw err;
      }
    },
    [resendMessage]
  );

  return {
    fetchMessages: handleFetchMessages,
    sendMessage: handleSendMessage,
    deleteMessage: handleDeleteMessage,
    resendMessage: handleResendMessage,
  };
}
