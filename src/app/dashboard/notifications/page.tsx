"use client";

import React from "react";
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
  } = useNotificationsStore();

  const allRead = notifications.every((n) => n.read);
  const allEmpty = notifications.length === 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12 rounded-3xl">
      <NotificationHeader
        markAllAsRead={markAllAsRead}
        deleteAll={deleteAll}
        allRead={allRead}
        allEmpty={allEmpty}
      />

      <NotificationList
        notifications={notifications}
        markAsRead={markAsRead}
        deleteNotification={deleteNotification}
      />
    </div>
  );
};

export default NotificationsPage;
