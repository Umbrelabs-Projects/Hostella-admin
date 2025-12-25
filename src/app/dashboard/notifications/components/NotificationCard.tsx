"use client";

import React, { useMemo } from "react";
import { Notification } from "@/types/notifications";
import { Bell, CheckCheck, TrashIcon } from "lucide-react";
import { typeConfig } from "@/stores/useNotificationsStore";
import { useRouter } from "next/navigation";

interface NotificationCardProps {
  notification: Notification;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  onNavigate?: (notification: Notification) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  markAsRead,
  deleteNotification,
  onNavigate,
}) => {
  const router = useRouter();
  const config =
    typeConfig[notification.type as keyof typeof typeConfig] ?? typeConfig["system-alert"];

  const containerClass = useMemo(
    () =>
      `p-4 rounded-2xl border ${
        notification.read
          ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          : `border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/30`
      } shadow-sm transition-colors duration-200 ${onNavigate ? "cursor-pointer hover:shadow-md" : ""}`,
    [notification.read, onNavigate]
  );

  const Icon = config.icon ?? Bell;

  const handleClick = async () => {
    if (!onNavigate) return;
    
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    onNavigate(notification);
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

  return (
    <div className={containerClass} onClick={handleClick}>
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
          {notification.time ?? "Just now"}
        </span>
      </div>
    </div>
  );
};

export default NotificationCard;
