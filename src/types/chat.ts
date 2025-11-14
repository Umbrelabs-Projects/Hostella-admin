// /types/chat.ts
export type Sender = "student" | "admin";

export type MessageType = "text" | "voice" | "file";

export interface ChatMessageType {
  id: string; // unique string id
  sender: Sender;
  content: string; // text placeholder or filename
  timestamp: string; // display timestamp
  type: MessageType;
  audio?: Blob; // client-only; for sending to server convert to FormData/url
  fileName?: string;
  repliedToId?: string | null;
}
