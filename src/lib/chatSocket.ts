// src/lib/chatSocket.ts
// Simple WebSocket client for chat

let socket: WebSocket | null = null;
import type { Message } from "@/types/chat";
let listeners: ((msg: Message) => void)[] = [];

export function connectChatSocket(url: string) {
  if (socket) return;
  socket = new WebSocket(url);
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    listeners.forEach((cb) => cb(data));
  };
  socket.onclose = () => {
    socket = null;
  };
}

export function sendChatSocket(data: Message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

export function onChatSocketMessage(cb: (msg: Message) => void) {
  listeners.push(cb);
}

export function disconnectChatSocket() {
  if (socket) {
    socket.close();
    socket = null;
    listeners = [];
  }
}
