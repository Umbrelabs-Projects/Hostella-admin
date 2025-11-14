export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  unread: number;
  roomInfo?: string;
}

export const MOCK_CHATS: Chat[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    lastMessage: "Is room 201 still available?",
    timestamp: "2:45 PM",
    avatar: "RS",
    unread: 2,
    roomInfo: "3-bed dorm",
  },
  {
    id: "2",
    name: "Priya Patel",
    lastMessage: "Thanks for confirming the booking",
    timestamp: "1:30 PM",
    avatar: "PP",
    unread: 0,
    roomInfo: "Single room",
  },
  {
    id: "3",
    name: "Aditya Kumar",
    lastMessage: "When can I check in?",
    timestamp: "Yesterday",
    avatar: "AK",
    unread: 1,
    roomInfo: "2-bed deluxe",
  },
  {
    id: "4",
    name: "Neha Singh",
    lastMessage: "Can you send me the amenities list?",
    timestamp: "Yesterday",
    avatar: "NS",
    unread: 0,
    roomInfo: "Shared apartment",
  },
  {
    id: "5",
    name: "Vikram Reddy",
    lastMessage: "What's the WiFi password?",
    timestamp: "2 days ago",
    avatar: "VR",
    unread: 0,
    roomInfo: "Studio",
  },
];
