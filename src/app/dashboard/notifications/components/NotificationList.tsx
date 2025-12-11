"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import NotificationCard from "./NotificationCard";
import { Notification } from "@/types/notifications";

interface NotificationListProps {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  markAsRead,
  deleteNotification,
}) => {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">You&apos;re all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 50 }}
            layout
          >
            <NotificationCard
              notification={n}
              markAsRead={markAsRead}
              deleteNotification={deleteNotification}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
