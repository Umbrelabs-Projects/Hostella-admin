"use client";

import { create } from "zustand";
import { Notification } from "@/types/notifications";
import { CheckCircle, CreditCard, Key, ToolCase } from "lucide-react";

interface NotificationsState {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  deleteAll: () => void;
}

// Initial dummy notifications
const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "booking_approved",
    title: "Booking Approved",
    description: "Your request for Room B-204 has been confirmed.",
    time: "1 min ago",
    read: false,
  },
  {
    id: 2,
    type: "payment_received",
    title: "Payment Received",
    description: "The payment of $800 for hostel fees was successful.",
    time: "15 min ago",
    read: false,
  },
  {
    id: 3,
    type: "room_allocated",
    title: "Room Allocated",
    description: "You have been assigned to Room A-312.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 4,
    type: "maintenance_alert",
    title: "Maintenance Alert",
    description: "Water will be shut off for 2 hours tomorrow.",
    time: "1 day ago",
    read: true,
  },
];

export const typeConfig = {
  booking_approved: {
    icon: CheckCircle,
    color: "bg-green-100 text-green-600 border-green-500",
  },
  payment_received: {
    icon: CreditCard,
    color: "bg-indigo-100 text-indigo-600 border-indigo-500",
  },
  room_allocated: {
    icon: Key,
    color: "bg-blue-100 text-blue-600 border-blue-500",
  },
  maintenance_alert: {
    icon: ToolCase,
    color: "bg-red-100 text-red-600 border-red-500",
  },
};

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: initialNotifications,
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
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
  deleteAll: () =>
    set(() => ({
      notifications: [],
    })),
}));
