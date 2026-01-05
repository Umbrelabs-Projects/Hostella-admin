"use client";

import React, { useEffect, useState } from "react";
import { NotificationList } from "./components/NotificationList";
import { useNotificationsStore } from "@/stores/useNotificationsStore";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Notification } from "@/types/notifications";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    deleteAll,
    fetchNotifications,
    loading,
    error,
  } = useNotificationsStore();

  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Initial load
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await fetchNotifications({ unreadOnly: filter === "unread" });
      } catch {
        // error is already captured in store
      } finally {
        setIsInitialized(true);
      }
    };
    loadNotifications();
  }, [fetchNotifications, filter]);

  // Real-time polling: Fetch notifications every 30 seconds
  useEffect(() => {
    const POLL_INTERVAL = 30000; // 30 seconds
    let intervalId: NodeJS.Timeout | null = null;

    const pollNotifications = async () => {
      try {
        await fetchNotifications();
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

    // Start polling initially
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


  const handleMarkAsRead = (id: string) => {
    markAsRead(id).catch(() => {});
  };

  const handleDelete = (id: string) => {
    deleteNotification(id).catch(() => {});
  };

  const handleMarkAll = () => markAllAsRead().catch(() => {});

  const handleFilterChange = (newFilter: "all" | "unread") => {
    setFilter(newFilter);
    fetchNotifications({ unreadOnly: newFilter === "unread" }).catch(() => {});
  };

  const handleNotificationNavigation = (notification: Notification) => {
    if (!notification.relatedId) return;

    const routes: Record<string, (id: string) => void> = {
      "payment-received": (id) => router.push(`/dashboard/payments`),
      "complaint-received": (id) => router.push(`/dashboard/complaints/${id}`),
      "new-booking": (id) => router.push(`/dashboard/bookings?search=${id}`),
      "broadcast": (id) => router.push(`/dashboard/broadcast`),
      "booking-approved": (id) => router.push(`/dashboard/bookings?search=${id}`),
      "booking-rejected": (id) => router.push(`/dashboard/bookings?search=${id}`),
      "booking-cancelled": (id) => router.push(`/dashboard/bookings?search=${id}`),
      "room-allocated": (id) => router.push(`/dashboard/bookings?search=${id}`),
      "complaint-resolved": (id) => router.push(`/dashboard/complaints/${id}`),
    };

    const handler = routes[notification.type];
    if (handler) {
      handler(notification.relatedId);
    }
  };

  const filteredNotifications = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 rounded-3xl space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => handleFilterChange("all")}
            className="px-4 py-2"
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => handleFilterChange("unread")}
            className="px-4 py-2"
          >
            Unread ({unreadCount})
          </Button>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAll}
              variant="outline"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white border-green-600"
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {(loading && !isInitialized) && notifications.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <NotificationList
          notifications={filteredNotifications}
          markAsRead={handleMarkAsRead}
          deleteNotification={handleDelete}
          onNavigate={handleNotificationNavigation}
        />
      )}
    </div>
  );
};

export default NotificationsPage;
