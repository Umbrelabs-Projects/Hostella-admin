// src/types/broadcast.ts

export type BroadcastRecipientType = "all-residents" | "all-members" | "specific-members";
export type BroadcastMessageStatus = "draft" | "sent" | "scheduled" | "failed";
export type BroadcastPriority = "low" | "medium" | "high" | "urgent";

export interface BroadcastRecipient {
  id: string;
  name: string;
  email: string;
  roomNumber?: string;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  content: string;
  recipientType: BroadcastRecipientType;
  recipients?: BroadcastRecipient[]; // For specific-members
  recipientCount: number;
  priority: BroadcastPriority;
  status: BroadcastMessageStatus;
  createdAt: string; // ISO date string
  updatedAt: string;
  sentAt?: string;
  scheduledFor?: string; // ISO date string for future messages
  attachments?: string[]; // URLs or file names
  tags?: string[];
  messageTemplate?: string; // Template ID if using templates
  readCount?: number;
  failedCount?: number;
}

export interface BroadcastComposer {
  title: string;
  content: string;
  recipientType: BroadcastRecipientType;
  selectedRecipients?: string[]; // IDs of selected recipients
  priority: BroadcastPriority;
  scheduledFor?: string; // Empty string or ISO date
}

export interface BroadcastAPIResponse {
  success: boolean;
  message: string;
  data?: BroadcastMessage;
}

export interface BroadcastListAPIResponse {
  success: boolean;
  messages: BroadcastMessage[];
  total: number;
  page: number;
  pageSize: number;
}
