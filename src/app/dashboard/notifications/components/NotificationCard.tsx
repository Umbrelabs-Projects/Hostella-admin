"use client";

import React, { useMemo } from "react";
import { Notification } from "@/types/notifications";
import { CheckCheck, TrashIcon } from "lucide-react";
import { typeConfig } from "@/stores/useNotificationsStore";

interface NotificationCardProps {
  notification: Notification;
  markAsRead: (id: number) => void;
  deleteNotification: (id: number) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  markAsRead,
  deleteNotification,
}) => {
  const config = typeConfig[notification.type as keyof typeof typeConfig];

  const containerClass = useMemo(
    () =>
      `p-4 rounded-2xl border ${
        notification.read
          ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          : `border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/30`
      } shadow-sm transition-colors duration-200`,
    [notification.read]
  );

  const Icon = config.icon;

  return (
    <div className={containerClass}>
      <div className="flex justify-center items-center">
        <div className="flex items-center justify-start gap-2 flex-1 pr-2">
          <div className={`p-1 rounded-full ${config.color}`}>
            <Icon size={20} />
          </div>
          <h3 className="text-xs md:text-base font-bold text-green-900 dark:text-green-300">
            {notification.title}
          </h3>
        </div>
        <div className="flex justify-end items-center gap-2">
          {!notification.read && (
            <button
              onClick={() => markAsRead(notification.id)}
              className="px-2 text-xs text-blue-500 rounded-md bg-blue-100 hover:bg-gray-200 transition md:text-sm font-semibold"
            >
              <CheckCheck className="w-4" />
            </button>
          )}
          <button
            onClick={() => deleteNotification(notification.id)}
            className="px-2 text-xs text-red-600 rounded-md bg-red-50 dark:bg-red-800 hover:bg-red-100 dark:hover:bg-red-700 transition md:text-sm font-semibold"
          >
            <TrashIcon className="w-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-700 text-xs md:text-base mt-1 dark:text-gray-300">
        {notification.description}
      </p>
      <div>
        <span className="text-gray-500 text-xs dark:text-gray-400">
          {notification.time}
        </span>
      </div>
    </div>
  );
};

export default NotificationCard;
