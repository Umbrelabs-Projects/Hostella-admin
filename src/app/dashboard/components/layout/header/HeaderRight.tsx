"use client";

import { MessageCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import UserDropdown from "./UserDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { useNotificationsStore } from "@/stores/useNotificationsStore";
import { useEffect, useState, useRef } from "react";

export default function HeaderRight() {
  const notifications = useNotificationsStore((state) => state.notifications);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  // Check if there are any unread notifications
  const hasUnread = notifications.some((n) => !n.read) || unreadCount > 0;

  // Real-time polling: Fetch notifications every 30 seconds to update badge
  useEffect(() => {
    const POLL_INTERVAL = 30000; // 30 seconds
    let intervalId: NodeJS.Timeout | null = null;

    const pollNotifications = async () => {
      try {
        // Fetch with minimal data for badge update (first page, small page size)
        await fetchNotifications({ page: 1, pageSize: 10, unreadOnly: false });
      } catch {
        // Silently fail - error is already captured in store
      }
    };

    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(pollNotifications, POLL_INTERVAL);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Initial fetch
    pollNotifications();

    // Start polling
    startPolling();

    // Pause polling when tab is not visible (Page Visibility API)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // Resume polling when tab becomes visible
        pollNotifications(); // Fetch immediately when tab becomes visible
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchNotifications]);

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
