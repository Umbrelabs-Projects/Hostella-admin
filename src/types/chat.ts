// /types/chat.ts
export type Sender = "admin" | "student";

export type MessageType =
  | "text"
  | "voice"
  | "file"
  | "photo"
  | "document"
  | "contact"
  | "poll"
  | "drawing";

export interface FileData {
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  fileBlob?: Blob | null; // client-only
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  replyTo?: { id: string; text: string; senderName: string };
  type?: MessageType;
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
