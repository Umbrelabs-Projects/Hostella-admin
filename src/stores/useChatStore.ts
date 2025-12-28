import { create } from "zustand";
import type { Message, ChatInfo, FileData } from "@/types/chat";
import { sendChatSocket } from "@/lib/chatSocket";

export interface ChatStore {
  currentChatId: string | null;
  chatsInfo: Record<string, ChatInfo>;
  messages: Record<string, Message[]>;

  setCurrentChat: (id: string | null) => void;
  setMessages: (chatId: string, ...msgs: Message[]) => void;

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


// chatsInfo will be loaded from API

const MOCK_MESSAGES: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      sender: "student",
      text: "Hi, I wanted to ask about room 201",
      timestamp: "2:30 PM",
      type: "text",
    },
    {
      id: "2",
      sender: "admin",
      text: "Hi Rahul! Room 201 is available. Would you like to book it?",
      timestamp: "2:32 PM",
      type: "text",
    },
  ],
  "2": [
    {
      id: "1",
      sender: "student",
      text: "Thank you for the confirmation!",
      timestamp: "1:25 PM",
      type: "text",
    },
  ],
};


export const useChatStore = create<ChatStore & {
  loadChatsInfo: () => Promise<void>;
}>((set, get) => ({
  currentChatId: null,
  chatsInfo: {},
  messages: MOCK_MESSAGES,

  // Fetch chat members connected to the admin
  loadChatsInfo: async () => {
    try {
      const res = await (await import("@/lib/api")).apiFetch<{ success: boolean; data: Record<string, ChatInfo> }>("/chat/members");
      set({ chatsInfo: res.data });
    } catch (e) {
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
    // Send via WebSocket
    sendChatSocket({ ...newMessage, chatId });
    // Optionally, send to API
    // apiFetch(`/chat/${chatId}/send`, { method: "POST", body: JSON.stringify(newMessage) });
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
    } catch (e) {
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
