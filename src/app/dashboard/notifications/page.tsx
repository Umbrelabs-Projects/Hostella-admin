"use client";

import React, { useEffect, useState } from "react";
import { NotificationHeader } from "./components/NotificationHeader";
import { NotificationList } from "./components/NotificationList";
import { useNotificationsStore } from "@/stores/useNotificationsStore";
import { CardSkeleton } from "@/components/ui/skeleton";

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    deleteAll,
    fetchNotifications,
    loading,
    error,
  } = useNotificationsStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initial load
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await fetchNotifications();
      } catch {
        // error is already captured in store
      } finally {
        setIsInitialized(true);
      }
    };
    loadNotifications();
  }, [fetchNotifications]);

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

  const allRead = notifications.length > 0 && notifications.every((n) => n.read);
  const allEmpty = notifications.length === 0;

  const handleMarkAsRead = (id: string) => {
    markAsRead(id).catch(() => {});
  };

  const handleDelete = (id: string) => {
    deleteNotification(id).catch(() => {});
  };

  const handleMarkAll = () => markAllAsRead().catch(() => {});
  const handleDeleteAll = () => deleteAll().catch(() => {});

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 rounded-3xl space-y-4">
      <NotificationHeader
        markAllAsRead={handleMarkAll}
        deleteAll={handleDeleteAll}
        allRead={allRead}
        allEmpty={allEmpty}
      />

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
          notifications={notifications}
          markAsRead={handleMarkAsRead}
          deleteNotification={handleDelete}
        />
      )}
    </div>
  );
};

export default NotificationsPage;
