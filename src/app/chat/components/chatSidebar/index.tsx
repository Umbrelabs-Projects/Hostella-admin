// components/chat/ChatSidebar/ChatSidebar.tsx
"use client";

import { useState } from "react";
import SidebarHeader from "./SidebarHeader";
import SearchBar from "./SearchBar";
import ChatList from "./ChatList";

export default function ChatSidebar() {
  const [query, setQuery] = useState("");

  return (
    <div className="h-full flex flex-col bg-background w-full max-w-sm">
      <SidebarHeader />
      <SearchBar value={query} onChange={setQuery} />
      <ChatList filter={query} />
    </div>
  );
}
