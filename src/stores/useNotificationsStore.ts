"use client";

import { create } from "zustand";
import { Notification } from "@/types/notifications";
import {
  UserPlus,
  Receipt,
  ClipboardList,
  Wrench,
  Bell,
} from "lucide-react";

interface NotificationsState {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  deleteAll: () => void;
}

// *** REAL ADMIN NOTIFICATIONS ***
const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "new_booking",
    title: "New Booking Submitted",
    description: "Student John Doe submitted a booking request for Room B-203.",
    time: "3 min ago",
    read: false,
  },
  {
    id: 2,
    type: "payment_made",
    title: "Payment Made",
    description: "Ama Agyeman paid GHS 1,200 for her accommodation fee.",
    time: "20 min ago",
    read: false,
  },
  {
    id: 3,
    type: "maintenance_request",
    title: "New Maintenance Request",
    description: "Room A-110 reported a faulty socket.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 4,
    type: "new_user",
    title: "New User Account Created",
    description: "A new student account was registered.",
    time: "5 hours ago",
    read: true,
  },
  {
    id: 5,
    type: "system_alert",
    title: "System Alert",
    description: "Database backup completed successfully.",
    time: "1 day ago",
    read: true,
  },
];

// *** ADMIN NOTIFICATION ICONS + COLORS ***
export const typeConfig = {
  new_booking: {
    icon: ClipboardList,
    color: "bg-blue-100 text-blue-600 border-blue-500",
  },
  payment_made: {
    icon: Receipt,
    color: "bg-green-100 text-green-600 border-green-500",
  },
  maintenance_request: {
    icon: Wrench,
    color: "bg-orange-100 text-orange-600 border-orange-500",
  },
  new_user: {
    icon: UserPlus,
    color: "bg-purple-100 text-purple-600 border-purple-500",
  },
  system_alert: {
    icon: Bell,
    color: "bg-gray-100 text-gray-600 border-gray-500",
  },
};

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: initialNotifications,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  deleteAll: () => set({ notifications: [] }),
}));
