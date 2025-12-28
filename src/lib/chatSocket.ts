// Alias for compatibility with useChatStore
export const sendChatSocket = sendMessageSocket;
// src/lib/chatSocket.ts
import { io, Socket } from "socket.io-client";
import type { Message } from "@/types/chat";

let socket: Socket | null = null;
let messageListeners: ((msg: Message) => void)[] = [];
let typingListeners: ((payload: { userId: string; firstName: string }) => void)[] = [];
let stopTypingListeners: ((payload: { userId: string }) => void)[] = [];

export function connectChatSocket(url: string) {
  if (socket) return;
  socket = io(url);

  socket.on("new_message", (msg: Message) => {
    messageListeners.forEach((cb) => cb(msg));
  });
  socket.on("user_typing", (payload) => {
    typingListeners.forEach((cb) => cb(payload));
  });
  socket.on("user_stop_typing", (payload) => {
    stopTypingListeners.forEach((cb) => cb(payload));
  });
}

export function joinRoom(roomId: string) {
  if (socket) {
    socket.emit("join_room", roomId);
  }
}

export function sendMessageSocket(msg: Message) {
  if (socket) {
    socket.emit("send_message", msg);
  }
}

export function emitTyping(roomId: string, userId: string, firstName: string) {
  if (socket) {
    socket.emit("typing", { roomId, userId, firstName });
  }
}

export function emitStopTyping(roomId: string, userId: string) {
  if (socket) {
    socket.emit("stop_typing", { roomId, userId });
  }
}

export function onChatSocketMessage(cb: (msg: Message) => void) {
  messageListeners.push(cb);
}

export function onUserTyping(cb: (payload: { userId: string; firstName: string }) => void) {
  typingListeners.push(cb);
}

export function onUserStopTyping(cb: (payload: { userId: string }) => void) {
  stopTypingListeners.push(cb);
}

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    messageListeners = [];
    typingListeners = [];
    stopTypingListeners = [];
  }
}
