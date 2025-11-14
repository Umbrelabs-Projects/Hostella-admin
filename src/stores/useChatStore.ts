// stores/useChatStore.ts
import { create } from "zustand";

export type Sender = "admin" | "student";

export interface FileData {
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  fileBlob?: Blob | null;
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  replyTo?: { id: string; text: string; senderName: string };
  type?:
    | "text"
    | "voice"
    | "file"
    | "photo"
    | "document"
    | "contact"
    | "poll"
    | "drawing";
  voiceDuration?: number;
  fileData?: FileData;
}

export interface ChatInfo {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  roomInfo: string;
  checkInDate?: string;
}

const MOCK_CHATS_INFO: Record<string, ChatInfo> = {
  "1": {
    id: "1",
    name: "Rahul Sharma",
    avatar: "RS",
    online: true,
    roomInfo: "3-bed dorm - Room 205",
    checkInDate: "Nov 15, 2025",
  },
  "2": {
    id: "2",
    name: "Priya Patel",
    avatar: "PP",
    online: false,
    roomInfo: "Single room - Room 102",
    checkInDate: "Nov 10, 2025",
  },
  "3": {
    id: "3",
    name: "Aditya Kumar",
    avatar: "AK",
    online: true,
    roomInfo: "2-bed deluxe - Room 301",
    checkInDate: "Nov 12, 2025",
  },
  "4": {
    id: "4",
    name: "Neha Singh",
    avatar: "NS",
    online: false,
    roomInfo: "Shared apartment - Room 401",
    checkInDate: "Nov 18, 2025",
  },
  "5": {
    id: "5",
    name: "Vikram Reddy",
    avatar: "VR",
    online: true,
    roomInfo: "Studio - Room 501",
    checkInDate: "Nov 8, 2025",
  },
};

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

interface ChatStore {
  currentChatId: string | null;
  chatsInfo: Record<string, ChatInfo>;
  messages: Record<string, Message[]>;
  setCurrentChat: (id: string | null) => void;

  // message ops
  sendMessage: (chatId: string, text: string, replyTo?: Message | null) => void;
  sendVoice: (chatId: string, duration: number, blob?: Blob | null) => void;
  sendFile: (
    chatId: string,
    type: Message["type"],
    fileData: FileData,
    text?: string
  ) => void;
  deleteMessage: (chatId: string, messageId: string) => void;

  // UI
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

export const useChatStore = create<ChatStore>((set, get) => ({
  currentChatId: null,
  chatsInfo: MOCK_CHATS_INFO,
  messages: MOCK_MESSAGES,

  setCurrentChat: (id) => set({ currentChatId: id }),

  sendMessage: (chatId, text, replyTo) => {
    const id = String((get().messages[chatId]?.length ?? 0) + 1);
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
              replyTo.text.substring(0, 50) +
              (replyTo.text.length > 50 ? "..." : ""),
            senderName: replyTo.sender === "admin" ? "You" : "Student",
          }
        : undefined,
    };
    set({
      messages: {
        ...get().messages,
        [chatId]: [...(get().messages[chatId] ?? []), newMessage],
      },
      replying: null,
    });
  },

  sendVoice: (chatId, duration, blob) => {
    const id = String((get().messages[chatId]?.length ?? 0) + 1);
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
        ...get().messages,
        [chatId]: [...(get().messages[chatId] ?? []), newMessage],
      },
      isRecording: false,
    });
  },

  sendFile: (chatId, type, fileData, text = "") => {
    const id = String((get().messages[chatId]?.length ?? 0) + 1);
    const newMessage: Message = {
      id,
      sender: "admin",
      text: text || (fileData.fileName ? fileData.fileName : ""),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type,
      fileData,
    };
    set({
      messages: {
        ...get().messages,
        [chatId]: [...(get().messages[chatId] ?? []), newMessage],
      },
    });
  },

  deleteMessage: (chatId, messageId) => {
    set({
      messages: {
        ...get().messages,
        [chatId]: (get().messages[chatId] ?? []).filter(
          (m) => m.id !== messageId
        ),
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
  setPlayingVoiceId: (v) => set({ playingVoiceId: v }),
}));
