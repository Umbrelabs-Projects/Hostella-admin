"use client";

import { Search, Plus, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  unread: number;
  roomInfo?: string;
}

const MOCK_CHATS: Chat[] = [
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

export default function ChatSidebar({
  selectedChat,
  onSelectChat,
}: {
  selectedChat: string | null;
  onSelectChat: (id: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = MOCK_CHATS.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Chats</h1>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-9 bg-muted"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full p-3 text-left transition-colors hover:bg-muted ${
                selectedChat === chat.id
                  ? "bg-primary/10 border-l-4 border-primary"
                  : ""
              }`}
            >
              <div className="flex gap-3 items-start">
                <Avatar className="h-12 w-12 mt-1">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {chat.avatar}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {chat.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded px-2 py-0.5 mb-1 w-fit">
                    {chat.roomInfo}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                </div>

                {chat.unread > 0 && (
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {chat.unread}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
