// src/lib/notificationSocket.ts
import { io, Socket } from "socket.io-client";

export type NotificationPayload = {
  id: string;
  type: string;
  title: string;
  description: string;
  relatedId?: string;
  createdAt?: string;
};


let socket: Socket | null = null;
let notificationListeners: ((notif: NotificationPayload) => void)[] = [];

export function connectNotificationSocket(url: string, room?: string) {
  if (socket) return;
  socket = io(url);
  // Join the admin's room if provided
  if (room) {
    socket.emit("join", room);
  }
  // Listen for the correct event name from backend
  socket.on("notification", (notif: NotificationPayload) => {
    notificationListeners.forEach((cb) => cb(notif));
  });
}

export function onNotification(cb: (notif: NotificationPayload) => void) {
  notificationListeners.push(cb);
}

export function disconnectNotificationSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    notificationListeners = [];
  }
}
