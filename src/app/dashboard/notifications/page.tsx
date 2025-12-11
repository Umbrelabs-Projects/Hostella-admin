"use client";

import React, { useEffect } from "react";
import { NotificationHeader } from "./components/NotificationHeader";
import { NotificationList } from "./components/NotificationList";
import { useNotificationsStore } from "@/stores/useNotificationsStore";

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

  useEffect(() => {
    fetchNotifications().catch(() => {
      // error is already captured in store
    });
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

      {loading && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          Loading notifications...
        </div>
      )}

      <NotificationList
        notifications={notifications}
        markAsRead={handleMarkAsRead}
        deleteNotification={handleDelete}
      />
    </div>
  );
};

export default NotificationsPage;
