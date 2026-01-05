import { create } from "zustand";
import type { Message, ChatInfo, FileData } from "@/types/chat";
import { sendChatSocket } from "@/lib/chatSocket";

export interface ChatStore {
  currentChatId: string | null;
  chatsInfo: Record<string, ChatInfo>;
  messages: Record<string, Message[]>;

  setCurrentChat: (id: string | null) => void;
  setMessages: (chatId: string, ...msgs: Message[]) => void;
  loadChatMessages: (chatId: string, page?: number, limit?: number) => Promise<void>;
  closeChat: (chatId: string) => Promise<void>;

  // message operations
  sendMessage: (chatId: string, text: string, replyTo?: Message | null) => void;
  sendVoice: (chatId: string, duration: number, blob?: Blob | null) => void;
  sendFile: (
    chatId: string,
    type: Message["type"],
    fileData: FileData,
    text?: string
  ) => void;
  deleteMessage: (chatId: string, messageId: string) => void;

  // UI state
  replying: Message | null;
  setReplying: (msg: Message | null) => void;

  contextMenu: { x: number; y: number; messageId: string } | null;
  setContextMenu: (ctx: ChatStore["contextMenu"]) => void;

  isRecording: boolean;
  setRecording: (v: boolean) => void;

  showAttachmentMenu: boolean;
  setShowAttachmentMenu: (v: boolean) => void;

  playingVoiceId: string | null;
  setPlayingVoiceId: (id: string | null) => void;
}

// fallback empty array to stabilize selectors
export const EMPTY_MESSAGES: Message[] = [];


export const useChatStore = create<ChatStore & {
  loadChatsInfo: () => Promise<void>;
}>((set, get) => ({
  currentChatId: null,
  chatsInfo: {},
  messages: {}, // Start with empty messages, load from API on demand

  // Fetch active chats for the admin
  loadChatsInfo: async () => {
    try {
      const res = await (await import("@/lib/api")).apiFetch<{ 
        success: boolean; 
        data?: { chats: ChatInfo[] } | Record<string, ChatInfo>;
        chats?: ChatInfo[];
      }>("/chat/admin/active-chats");
      
      // Handle different response formats from backend
      let chatsRecord: Record<string, ChatInfo> = {};
      
      if (res.data) {
        if (Array.isArray(res.data)) {
          // Direct array response
          chatsRecord = res.data.reduce((acc, chat) => {
            acc[chat.id] = chat;
            return acc;
          }, {} as Record<string, ChatInfo>);
        } else if ('chats' in res.data && Array.isArray(res.data.chats)) {
          // { chats: [...] } format
          chatsRecord = res.data.chats.reduce((acc, chat) => {
            acc[chat.id] = chat;
            return acc;
          }, {} as Record<string, ChatInfo>);
        } else if (typeof res.data === 'object') {
          // Already a record format
          chatsRecord = res.data as Record<string, ChatInfo>;
        }
      } else if (Array.isArray(res.chats)) {
        // Top-level chats array
        chatsRecord = res.chats.reduce((acc, chat) => {
          acc[chat.id] = chat;
          return acc;
        }, {} as Record<string, ChatInfo>);
      }
      
      set({ chatsInfo: chatsRecord });
    } catch (e) {
      console.warn("Failed to load chats:", e);
      // fallback to empty or keep previous
      set((state) => ({ chatsInfo: state.chatsInfo || {} }));
    }
  },

  setCurrentChat: (id) => set({ currentChatId: id }),
  setMessages: (chatId, ...msgs) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] ?? []), ...msgs],
      },
    }));
  },

  loadChatMessages: async (chatId, page = 1, limit = 50) => {
    try {
      const res = await (await import("@/lib/api")).apiFetch<{
        success: boolean;
        data?: { messages: Message[] } | Message[];
        messages?: Message[];
      }>(`/chat/${chatId}/messages?page=${page}&limit=${limit}`);

      let messagesArray: Message[] = [];

      if (res.data) {
        if (Array.isArray(res.data)) {
          messagesArray = res.data;
        } else if ('messages' in res.data && Array.isArray(res.data.messages)) {
          messagesArray = res.data.messages;
        }
      } else if (Array.isArray(res.messages)) {
        messagesArray = res.messages;
      }

      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: messagesArray,
        },
      }));
    } catch (e) {
      console.warn("Failed to load chat messages:", e);
      // Keep existing messages if API fails
    }
  },

  sendMessage: (chatId, text, replyTo) => {
    const messages = get().messages;
    const id = String((messages[chatId]?.length ?? 0) + 1);
    const newMessage: Message = {
      id,
      sender: "admin",
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "text",
      replyTo: replyTo
        ? {
            id: replyTo.id,
            text:
              replyTo.text.length > 50
                ? replyTo.text.substring(0, 50) + "..."
                : replyTo.text,
            senderName: replyTo.sender === "admin" ? "You" : "Student",
          }
        : undefined,
    };

    set({
      messages: {
        ...messages,
        [chatId]: [...(messages[chatId] ?? []), newMessage],
      },
      replying: null,
    });
    
    // Send via API
    (async () => {
      try {
        await (await import("@/lib/api")).apiFetch(`/chat/${chatId}/messages`, {
          method: "POST",
          body: JSON.stringify({ message: text }),
        });
      } catch (e) {
        console.warn("Failed to send message via API:", e);
        // Message is still added locally for better UX
      }
    })();

    // Also send via WebSocket
    sendChatSocket({ ...newMessage, chatId });
  },

  sendVoice: (chatId, duration, blob) => {
    const messages = get().messages;
    const id = String((messages[chatId]?.length ?? 0) + 1);
    const newMessage: Message = {
      id,
      sender: "admin",
      text: "Voice message",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "voice",
      voiceDuration: duration,
      fileData: {
        fileName: `voice-${id}.webm`,
        fileSize: blob ? `${Math.round(blob.size / 1024)} KB` : undefined,
        fileType: "audio/webm",
        fileBlob: blob ?? null,
      },
    };

    set({
      messages: {
        ...messages,
        [chatId]: [...(messages[chatId] ?? []), newMessage],
      },
      isRecording: false,
    });
    sendChatSocket({ ...newMessage, chatId });
    // Optionally, send to API
    // apiFetch(`/chat/${chatId}/send`, { method: "POST", body: JSON.stringify(newMessage) });
  },

  sendFile: async (chatId, type, fileData, text = "") => {
    // Upload file to backend
    try {
      const form = new FormData();
      if (fileData.fileBlob) {
        form.append("attachment", fileData.fileBlob, fileData.fileName || "file");
      }
      if (text) form.append("message", text);
      const { apiFetch } = await import("@/lib/api");
      const res = await apiFetch<{ success: boolean; data: { message: Message } }>(`/chat/${chatId}/attachments`, {
        method: "POST",
        body: form,
      });
      if (res.success && res.data?.message) {
        const msg = res.data.message;
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] ?? []), msg],
          },
        }));
        // Optionally, send via socket for real-time update
        sendChatSocket({ ...msg, chatId });
      }
    } catch (_e) {
      // fallback: show locally if upload fails
      const messages = get().messages;
      const id = String((messages[chatId]?.length ?? 0) + 1);
      const newMessage: Message = {
        id,
        sender: "admin",
        text: text || (fileData.fileName ?? ""),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type,
        fileData,
      };
      set({
        messages: {
          ...messages,
          [chatId]: [...(messages[chatId] ?? []), newMessage],
        },
      });
      sendChatSocket({ ...newMessage, chatId });
    }
  },

  deleteMessage: (chatId, messageId) => {
    const messages = get().messages;
    set({
      messages: {
        ...messages,
        [chatId]: (messages[chatId] ?? []).filter((m) => m.id !== messageId),
      },
    });
  },

  closeChat: async (chatId) => {
    try {
      await (await import("@/lib/api")).apiFetch(`/chat/${chatId}/close`, {
        method: "PATCH",
      });
      // Remove closed chat from chatsInfo
      set((state) => {
        const updatedChats = { ...state.chatsInfo };
        delete updatedChats[chatId];
        return {
          chatsInfo: updatedChats,
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
        };
      });
    } catch (e) {
      console.warn("Failed to close chat:", e);
    }
  },

  replying: null,
  setReplying: (msg) => set({ replying: msg }),

  contextMenu: null,
  setContextMenu: (ctx) => set({ contextMenu: ctx }),

  isRecording: false,
  setRecording: (v) => set({ isRecording: v }),

  showAttachmentMenu: false,
  setShowAttachmentMenu: (v) => set({ showAttachmentMenu: v }),

  playingVoiceId: null,
  setPlayingVoiceId: (id) => set({ playingVoiceId: id }),
}));
