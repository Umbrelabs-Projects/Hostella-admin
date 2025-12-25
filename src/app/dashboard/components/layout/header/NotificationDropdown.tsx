"use client";

import React, { useEffect, useRef } from "react";
import { useNotificationsStore } from "@/stores/useNotificationsStore";
import { Notification } from "@/types/notifications";
import { typeConfig } from "@/stores/useNotificationsStore";
// Using existing time formatting from store instead of date-fns
import { Bell, CheckCheck, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotificationsStore();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch notifications when dropdown opens
  useEffect(() => {
    fetchNotifications({ page: 1, pageSize: 10, unreadOnly: false }).catch(() => {
      // Error already captured in store
    });
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id).catch(() => {});
    }
    handleNotificationNavigation(notification);
    onClose();
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

  const getNotificationIcon = (type: string) => {
    const config = typeConfig[type as keyof typeof typeConfig] ?? typeConfig["system-alert"];
    const Icon = config.icon ?? Bell;
    return <Icon className="h-5 w-5" />;
  };

  if (loading && notifications.length === 0) {
    return (
      <div
        ref={dropdownRef}
        className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
      >
        <div className="p-4 text-center text-gray-500">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
        {notifications.length > 0 && unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              markAllAsRead().catch(() => {});
            }}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No notifications</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.slice(0, 10).map((notification) => {
            const config = typeConfig[notification.type as keyof typeof typeConfig] ?? typeConfig["system-alert"];
            const Icon = config.icon ?? Bell;

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                  !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${config.color} flex-shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-medium ${
                          !notification.read
                            ? "text-gray-900 dark:text-gray-100"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="ml-2 h-2 w-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {notification.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {notification.time ?? "Just now"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id).catch(() => {});
                    }}
                    className="ml-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0"
                    aria-label="Delete notification"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {notifications.length > 10 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center sticky bottom-0 bg-white dark:bg-gray-800">
          <Link
            href="/dashboard/notifications"
            onClick={onClose}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

