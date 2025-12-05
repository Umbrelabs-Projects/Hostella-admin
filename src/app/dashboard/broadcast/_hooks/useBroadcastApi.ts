// src/app/dashboard/broadcast/_hooks/useBroadcastApi.ts

import { useCallback } from "react";
import { BroadcastMessage, BroadcastListAPIResponse } from "@/types/broadcast";
import { useBroadcastStore } from "@/stores/useBroadcastStore";
import { toast } from "sonner";

// Mock data for development
const generateMockMessages = (): BroadcastMessage[] => [
  {
    id: "msg_001",
    title: "Maintenance Schedule Update",
    content: "Water supply maintenance will be conducted on December 10th from 2 AM to 6 AM. Please store sufficient water beforehand.",
    recipientType: "all-residents",
    recipientCount: 150,
    priority: "high",
    status: "sent",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    readCount: 132,
  },
  {
    id: "msg_002",
    title: "Community Event - Year End Celebration",
    content: "Join us for the annual year-end celebration on December 20th at 6 PM in the main hall. Light refreshments will be provided.",
    recipientType: "all-residents",
    recipientCount: 150,
    priority: "medium",
    status: "sent",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    readCount: 98,
  },
];

export function useBroadcastApi() {
  const {
    setLoading,
    setError,
    setSuccess,
    addMessage,
    setMessages,
    updateMessage,
    removeMessage,
    setTotalMessages,
  } = useBroadcastStore();

  // Fetch all broadcast messages from localStorage
  const fetchMessages = useCallback(
    async (page = 1, pageSize = 10, search = "", statusFilter = "all", priorityFilter = "all") => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Get messages from localStorage or use mock data
        const storedMessages = localStorage.getItem("broadcast_messages");
        const allMessages: BroadcastMessage[] = storedMessages
          ? JSON.parse(storedMessages)
          : generateMockMessages();

        // Apply filters
        let filtered = allMessages.filter((msg) => {
          if (search && !msg.title.toLowerCase().includes(search.toLowerCase())) {
            return false;
          }
          if (statusFilter !== "all" && msg.status !== statusFilter) {
            return false;
          }
          if (priorityFilter !== "all" && msg.priority !== priorityFilter) {
            return false;
          }
          return true;
        });

        // Sort by created date (newest first)
        filtered = filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Paginate
        const startIndex = (page - 1) * pageSize;
        const paginatedMessages = filtered.slice(startIndex, startIndex + pageSize);

        setMessages(paginatedMessages);
        setTotalMessages(filtered.length);
        setError(null);
        
        return {
          messages: paginatedMessages,
          total: filtered.length,
          page,
          pageSize,
        } as BroadcastListAPIResponse;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch messages";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setMessages, setTotalMessages]
  );

  // Send broadcast message immediately
  const sendMessage = useCallback(
    async (payload: {
      title: string;
      content: string;
      recipientType: "all-residents" | "all-members" | "specific-members";
      selectedRecipients?: string[];
      priority: "low" | "medium" | "high" | "urgent";
    }) => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newMessage: BroadcastMessage = {
          id: `msg_${Date.now()}`,
          title: payload.title,
          content: payload.content,
          recipientType: payload.recipientType,
          recipientCount: payload.recipientType === "specific-members" 
            ? payload.selectedRecipients?.length || 0 
            : 150,
          priority: payload.priority,
          status: "sent",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sentAt: new Date().toISOString(),
          readCount: 0,
          failedCount: 0,
        };

        // Save to localStorage
        const storedMessages = localStorage.getItem("broadcast_messages");
        const allMessages: BroadcastMessage[] = storedMessages ? JSON.parse(storedMessages) : [];
        allMessages.unshift(newMessage);
        localStorage.setItem("broadcast_messages", JSON.stringify(allMessages));

        addMessage(newMessage);
        setSuccess("Message sent successfully!");
        toast.success("Broadcast message sent to all recipients");
        return newMessage;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setSuccess, addMessage]
  );

  // Schedule broadcast message
  const scheduleMessage = useCallback(
    async (payload: {
      title: string;
      content: string;
      recipientType: "all-residents" | "all-members" | "specific-members";
      selectedRecipients?: string[];
      priority: "low" | "medium" | "high" | "urgent";
      scheduledFor: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newMessage: BroadcastMessage = {
          id: `msg_${Date.now()}`,
          title: payload.title,
          content: payload.content,
          recipientType: payload.recipientType,
          recipientCount: payload.recipientType === "specific-members" 
            ? payload.selectedRecipients?.length || 0 
            : 150,
          priority: payload.priority,
          status: "scheduled",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          scheduledFor: payload.scheduledFor,
          readCount: 0,
          failedCount: 0,
        };

        // Save to localStorage
        const storedMessages = localStorage.getItem("broadcast_messages");
        const allMessages: BroadcastMessage[] = storedMessages ? JSON.parse(storedMessages) : [];
        allMessages.unshift(newMessage);
        localStorage.setItem("broadcast_messages", JSON.stringify(allMessages));

        addMessage(newMessage);
        setSuccess("Message scheduled successfully!");
        toast.success("Broadcast message scheduled for later");
        return newMessage;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to schedule message";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setSuccess, addMessage]
  );

  // Get a single message
  const getMessage = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const storedMessages = localStorage.getItem("broadcast_messages");
        const allMessages: BroadcastMessage[] = storedMessages ? JSON.parse(storedMessages) : [];
        return allMessages.find((msg) => msg.id === id) || null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch message";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Resend a message
  const resendMessage = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const storedMessages = localStorage.getItem("broadcast_messages");
        const allMessages: BroadcastMessage[] = storedMessages ? JSON.parse(storedMessages) : [];
        const messageIndex = allMessages.findIndex((msg) => msg.id === id);

        if (messageIndex !== -1) {
          const updatedMessage = {
            ...allMessages[messageIndex],
            sentAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: "sent" as const,
            readCount: 0,
            failedCount: 0,
          };
          allMessages[messageIndex] = updatedMessage;
          localStorage.setItem("broadcast_messages", JSON.stringify(allMessages));

          updateMessage(updatedMessage);
          setSuccess("Message resent successfully!");
          toast.success("Broadcast message resent to recipients");
          return updatedMessage;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to resend message";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
      return null;
    },
    [setLoading, setError, setSuccess, updateMessage]
  );

  // Delete a message
  const deleteMessage = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const storedMessages = localStorage.getItem("broadcast_messages");
        const allMessages: BroadcastMessage[] = storedMessages ? JSON.parse(storedMessages) : [];
        const filteredMessages = allMessages.filter((msg) => msg.id !== id);
        localStorage.setItem("broadcast_messages", JSON.stringify(filteredMessages));

        removeMessage(id);
        setSuccess("Message deleted successfully!");
        toast.success("Broadcast message deleted");
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete message";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setSuccess, removeMessage]
  );

  return {
    fetchMessages,
    sendMessage,
    scheduleMessage,
    getMessage,
    resendMessage,
    deleteMessage,
  };
}
