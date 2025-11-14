export interface Chat {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    avatar: string;
    unread: number;
    roomInfo?: string;
  }
  