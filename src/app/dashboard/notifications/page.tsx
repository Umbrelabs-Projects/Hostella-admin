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
