"use client";

import { MessageCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import UserDropdown from "./UserDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { useNotificationsStore } from "@/stores/useNotificationsStore";
import { useEffect, useState, useRef } from "react";
import { connectNotificationSocket, onNotification, disconnectNotificationSocket } from "@/lib/notificationSocket";
import { useAuthStore } from "@/stores/useAuthStore";

export default function HeaderRight() {
  const notifications = useNotificationsStore((state) => state.notifications);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  // Check if there are any unread notifications
  const hasUnread = notifications.some((n) => !n.read) || unreadCount > 0;

  // Real-time polling: Fetch notifications every 30 seconds to update badge
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    // Connect to notification socket for real-time updates, joining the admin's room
    if (user && user.id) {
      connectNotificationSocket(
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
        `user_${user.id}`
      );
    } else {
      connectNotificationSocket(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");
    }
    const handleNewNotification = (notif: {
      id: string;
      type: string;
      title: string;
      description: string;
      relatedId?: string;
      createdAt?: string;
    }) => {
      // Add to store instantly
      useNotificationsStore.getState().addNotification({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        description: notif.description,
        relatedId: notif.relatedId,
        createdAt: notif.createdAt,
        read: false,
        time: "Just now",
      });
    };
    onNotification(handleNewNotification);

    // Fallback polling for missed notifications (every 5 min)
    const POLL_INTERVAL = 300000;
    let intervalId: NodeJS.Timeout | null = null;
    const pollNotifications = async () => {
      try {
        await fetchNotifications({ page: 1, pageSize: 10, unreadOnly: false });
      } catch {}
    };
    intervalId = setInterval(pollNotifications, POLL_INTERVAL);

    return () => {
      disconnectNotificationSocket();
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchNotifications, user]);

  return (
    <div className="flex items-center gap-4">
      {/* Chats */}
      <Link href="/chat" aria-label="Chats">
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <MessageCircle className="h-5 w-5 text-gray-600" />
        </Button>
      </Link>

      {/* Notifications */}
      <div className="relative">
        <Button
          ref={notificationButtonRef}
          variant="ghost"
          size="icon"
          className="cursor-pointer relative"
          onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-600" />

          {/* Badge showing unread count */}
          {hasUnread && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold animate-pulse">
              {unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : ""}
            </span>
          )}
        </Button>
        {isNotificationDropdownOpen && (
          <NotificationDropdown onClose={() => setIsNotificationDropdownOpen(false)} />
        )}
      </div>

      <UserDropdown />
    </div>
  );
}
