"use client";

import { MessageCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import UserDropdown from "./UserDropdown";
import { useNotificationsStore } from "@/stores/useNotificationsStore";

export default function HeaderRight() {
  const notifications = useNotificationsStore((state) => state.notifications);

  // Check if there are any unread notifications
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="flex items-center gap-4">
      {/* Chats */}
      <Link href="/chat" aria-label="Chats">
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <MessageCircle className="h-5 w-5 text-gray-600" />
        </Button>
      </Link>

      {/* Notifications */}
      <Link href="/dashboard/notifications" aria-label="Notifications">
        <Button variant="ghost" size="icon" className="cursor-pointer relative">
          <Bell className="h-5 w-5 text-gray-600" />

          {/* Red dot for unread notifications */}
          {hasUnread && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </Button>
      </Link>

      <UserDropdown />
    </div>
  );
}
