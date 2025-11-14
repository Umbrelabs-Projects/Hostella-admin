"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Phone,
  Video,
  Search,
  Info,
  Menu,
  Paperclip,
  Mic,
  Smile,
  Trash2,
  ChevronUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  sender: "admin" | "student";
  text: string;
  timestamp: string;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  type?:
    | "text"
    | "voice"
    | "file"
    | "photo"
    | "document"
    | "contact"
    | "poll"
    | "drawing";
  voiceDuration?: number;
  isPlaying?: boolean;
  fileData?: {
    fileName?: string;
    fileSize?: string;
    fileType?: string;
  };
}

interface ChatInfo {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  roomInfo: string;
  checkInDate?: string;
}

const MOCK_CHATS_INFO: Record<string, ChatInfo> = {
  "1": {
    id: "1",
    name: "Rahul Sharma",
    avatar: "RS",
    online: true,
    roomInfo: "3-bed dorm - Room 205",
    checkInDate: "Nov 15, 2025",
  },
  "2": {
    id: "2",
    name: "Priya Patel",
    avatar: "PP",
    online: false,
    roomInfo: "Single room - Room 102",
    checkInDate: "Nov 10, 2025",
  },
  "3": {
    id: "3",
    name: "Aditya Kumar",
    avatar: "AK",
    online: true,
    roomInfo: "2-bed deluxe - Room 301",
    checkInDate: "Nov 12, 2025",
  },
  "4": {
    id: "4",
    name: "Neha Singh",
    avatar: "NS",
    online: false,
    roomInfo: "Shared apartment - Room 401",
    checkInDate: "Nov 18, 2025",
  },
  "5": {
    id: "5",
    name: "Vikram Reddy",
    avatar: "VR",
    online: true,
    roomInfo: "Studio - Room 501",
    checkInDate: "Nov 8, 2025",
  },
};

const MOCK_MESSAGES: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      sender: "student",
      text: "Hi, I wanted to ask about room 201",
      timestamp: "2:30 PM",
      type: "text",
    },
    {
      id: "2",
      sender: "admin",
      text: "Hi Rahul! Room 201 is available. Would you like to book it?",
      timestamp: "2:32 PM",
      type: "text",
    },
    {
      id: "3",
      sender: "student",
      text: "Is room 201 still available?",
      timestamp: "2:45 PM",
      type: "text",
      replyTo: {
        id: "2",
        text: "Hi Rahul! Room 201 is available...",
        senderName: "You",
      },
    },
    {
      id: "4",
      sender: "admin",
      text: "Yes, it is! It's a nice 3-bed dorm with city view. Interested?",
      timestamp: "2:46 PM",
      type: "text",
    },
  ],
  "2": [
    {
      id: "1",
      sender: "student",
      text: "Thank you for the confirmation!",
      timestamp: "1:25 PM",
      type: "text",
    },
    {
      id: "2",
      sender: "admin",
      text: "You're welcome! Check-in is at 3 PM.",
      timestamp: "1:27 PM",
      type: "text",
    },
  ],
  "3": [
    {
      id: "1",
      sender: "student",
      text: "When can I check in?",
      timestamp: "Yesterday",
      type: "text",
    },
    {
      id: "2",
      sender: "admin",
      text: "Check-in is available from 2 PM onwards on your date.",
      timestamp: "Yesterday",
      type: "text",
    },
  ],
  "4": [
    {
      id: "1",
      sender: "student",
      text: "Can you send me the amenities list?",
      timestamp: "Yesterday",
      type: "text",
    },
  ],
  "5": [
    {
      id: "1",
      sender: "student",
      text: "What's the WiFi password?",
      timestamp: "2 days ago",
      type: "text",
    },
  ],
};

export default function ChatWindow({
  chatId,
  onMenuClick,
  isSidebarOpen,
}: {
  chatId: string | null;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}) {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES[chatId || "1"] || []);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    messageId: string;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const currentChat = MOCK_CHATS_INFO[chatId || "1"];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(e.target as Node)
      ) {
        setShowAttachmentMenu(false);
      }
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    };
  }, [isRecording]);

  const handleRightClick = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId,
    });
  };

  const handleReply = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setReplyingTo(message);
    }
    setContextMenu(null);
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: String(messages.length + 1),
        sender: "admin",
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "text",
        replyTo: replyingTo
          ? {
              id: replyingTo.id,
              text:
                replyingTo.text.substring(0, 50) +
                (replyingTo.text.length > 50 ? "..." : ""),
              senderName:
                replyingTo.sender === "admin" ? "You" : currentChat.name,
            }
          : undefined,
      };
      setMessages([...messages, newMessage]);
      setMessageText("");
      setReplyingTo(null);
    }
  };

  const handleVoiceStart = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const handleVoiceDelete = () => {
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleVoiceSend = () => {
    const duration = recordingTime;
    const voiceMessage: Message = {
      id: String(messages.length + 1),
      sender: "admin",
      text: `Voice message`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "voice",
      voiceDuration: duration,
    };
    setMessages([...messages, voiceMessage]);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let fileMessage: Message;
    const fileSize = (file.size / 1024).toFixed(1) + " KB";
    const fileName = file.name;

    switch (type) {
      case "photo":
        fileMessage = {
          id: String(messages.length + 1),
          sender: "admin",
          text: "📷 " + fileName,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "photo",
          fileData: { fileName, fileSize, fileType: "image" },
        };
        break;
      case "camera":
        fileMessage = {
          id: String(messages.length + 1),
          sender: "admin",
          text: "📹 Camera capture",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "file",
          fileData: {
            fileName: "camera_capture.jpg",
            fileSize: "512 KB",
            fileType: "image",
          },
        };
        break;
      case "document":
        fileMessage = {
          id: String(messages.length + 1),
          sender: "admin",
          text: "📄 " + fileName,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "document",
          fileData: { fileName, fileSize, fileType: "document" },
        };
        break;
      case "contact":
        fileMessage = {
          id: String(messages.length + 1),
          sender: "admin",
          text: "👤 Contact shared",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "contact",
          fileData: {
            fileName: "Contact_Info",
            fileSize: "2 KB",
            fileType: "contact",
          },
        };
        break;
      case "poll":
        fileMessage = {
          id: String(messages.length + 1),
          sender: "admin",
          text: "📊 Poll: Best time for check-in?",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "poll",
          fileData: { fileName: "Poll", fileSize: "1 KB", fileType: "poll" },
        };
        break;
      case "drawing":
        fileMessage = {
          id: String(messages.length + 1),
          sender: "admin",
          text: "✏️ Drawing",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "drawing",
          fileData: {
            fileName: "sketch.png",
            fileSize: "256 KB",
            fileType: "drawing",
          },
        };
        break;
      default:
        return;
    }

    setMessages([...messages, fileMessage]);
    setShowAttachmentMenu(false);
    e.target.value = "";
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderMessage = (message: Message) => {
    if (message.type === "voice") {
      const isPlaying = playingVoiceId === message.id;
      const mins = Math.floor((message.voiceDuration || 0) / 60);
      const secs = (message.voiceDuration || 0) % 60;
      const durationStr = `${mins}:${secs.toString().padStart(2, "0")}`;

      return (
        <div
          key={message.id}
          className={`flex ${
            message.sender === "admin" ? "justify-end" : "justify-start"
          }`}
          onContextMenu={(e) => handleRightClick(e, message.id)}
        >
          <div className="relative group">
            <div
              className={`px-4 py-2 rounded-lg ${
                message.sender === "admin"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted text-foreground rounded-bl-none"
              } flex items-center gap-3 min-w-fit`}
            >
              <button
                onClick={() => setPlayingVoiceId(isPlaying ? null : message.id)}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <span className="text-lg">{isPlaying ? "⏸" : "▶"}</span>
              </button>

              <div className="flex gap-1 items-center justify-center py-1">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-current rounded-full"
                    style={{
                      height: isPlaying ? `${8 + Math.sin(i) * 4}px` : "4px",
                      opacity: 0.7,
                      animation: isPlaying
                        ? `waveform 0.6s ease-in-out infinite`
                        : "none",
                      animationDelay: `${i * 0.03}s`,
                    }}
                  />
                ))}
              </div>

              <span className="text-sm font-mono font-semibold flex-shrink-0 w-10 text-right">
                {durationStr}
              </span>
            </div>

            <div className="opacity-0 group-hover:opacity-100 absolute -left-8 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              ⋮
            </div>
          </div>
        </div>
      );
    }

    if (
      ["photo", "document", "contact", "poll", "drawing"].includes(
        message.type || ""
      )
    ) {
      return (
        <div
          key={message.id}
          className={`flex ${
            message.sender === "admin" ? "justify-end" : "justify-start"
          }`}
          onContextMenu={(e) => handleRightClick(e, message.id)}
        >
          <div className="relative group">
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.sender === "admin"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted text-foreground rounded-bl-none"
              } break-words cursor-context-menu hover:opacity-90 transition-opacity`}
            >
              <p className="font-medium mb-1">{message.text}</p>
              {message.fileData && (
                <div
                  className={`text-xs mt-2 pt-2 border-t ${
                    message.sender === "admin"
                      ? "border-primary-foreground/30 text-primary-foreground/90"
                      : "border-foreground/30 text-foreground/70"
                  }`}
                >
                  <p className="truncate">{message.fileData.fileName}</p>
                  <p>{message.fileData.fileSize}</p>
                </div>
              )}
              <p
                className={`text-xs mt-2 ${
                  message.sender === "admin"
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}
              >
                {message.timestamp}
              </p>
            </div>

            <div className="opacity-0 group-hover:opacity-100 absolute -left-8 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              ⋮
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={message.id}
        className={`flex ${
          message.sender === "admin" ? "justify-end" : "justify-start"
        }`}
        onContextMenu={(e) => handleRightClick(e, message.id)}
      >
        <div className="relative group">
          <div
            className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
              message.sender === "admin"
                ? "bg-primary text-primary-foreground rounded-br-none"
                : "bg-muted text-foreground rounded-bl-none"
            } break-words cursor-context-menu hover:opacity-90 transition-opacity`}
          >
            {message.replyTo && (
              <div
                className={`text-xs mb-2 pb-2 border-l-2 pl-2 ${
                  message.sender === "admin"
                    ? "border-primary-foreground/50 text-primary-foreground/80"
                    : "border-foreground/50 text-foreground/70"
                }`}
              >
                <p className="font-semibold">{message.replyTo.senderName}</p>
                <p className="truncate">{message.replyTo.text}</p>
              </div>
            )}
            <p>{message.text}</p>
            <p
              className={`text-xs mt-1 ${
                message.sender === "admin"
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              }`}
            >
              {message.timestamp}
            </p>
          </div>

          <div className="opacity-0 group-hover:opacity-100 absolute -left-8 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            ⋮
          </div>
        </div>
      </div>
    );
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">
            Select a chat to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-card to-background">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3 flex-1">
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {currentChat.avatar}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground">
              {currentChat.name}
            </h2>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  currentChat.online ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <p className="text-xs text-muted-foreground">
                {currentChat.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="icon" variant="ghost">
            <Phone className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <Video className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <Search className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <Info className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Chat Info Bar */}
      <div className="bg-muted px-4 py-2 text-xs text-muted-foreground">
        <span className="font-semibold">{currentChat.roomInfo}</span>
        {currentChat.checkInDate && (
          <span> • Check-in: {currentChat.checkInDate}</span>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-2 flex flex-col">
          {messages.map((message) => renderMessage(message))}
        </div>

        <style>{`
          @keyframes waveform {
            0%, 100% { height: 4px; }
            50% { height: 12px; }
          }
        `}</style>
      </ScrollArea>

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-card border border-border rounded-lg shadow-lg z-50"
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
          }}
        >
          <button
            onClick={() => handleReply(contextMenu.messageId)}
            className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2 rounded-lg"
          >
            ↩ Reply
          </button>
        </div>
      )}

      {replyingTo && (
        <div className="bg-muted border-t border-border px-4 py-2 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-semibold">
              Replying to{" "}
              {replyingTo.sender === "admin" ? "yourself" : currentChat.name}
            </p>
            <p className="text-sm text-foreground truncate">
              {replyingTo.text}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setReplyingTo(null)}
            className="ml-2"
          >
            ✕
          </Button>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-border p-3 bg-card space-y-2">
        {isRecording && (
          <div className="bg-muted rounded-lg px-3 py-2 flex items-center justify-between">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleVoiceDelete}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3 flex-1 justify-center">
              <span className="text-sm font-mono text-foreground">
                {formatRecordingTime(recordingTime)}
              </span>
              <div className="flex gap-1 items-center">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary rounded-full animate-pulse"
                    style={{
                      height: "4px",
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">0:0</span>
            </div>

            <Button
              size="icon"
              onClick={handleVoiceSend}
              className="bg-primary hover:bg-primary/90 rounded-full"
            >
              <ChevronUp className="w-5 h-5" />
            </Button>
          </div>
        )}

        {showAttachmentMenu && (
          <div
            ref={attachmentMenuRef}
            className="bg-card border border-border rounded-lg p-2 space-y-1 absolute bottom-24 left-4 z-40 w-48"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg flex items-center gap-3"
            >
              <span>📷</span> Photos & videos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={(e) => handleFileSelect(e, "photo")}
              className="hidden"
            />

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg flex items-center gap-3"
            >
              <span>📹</span> Camera
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileSelect(e, "camera")}
              className="hidden"
            />

            <button
              onClick={() => documentInputRef.current?.click()}
              className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg flex items-center gap-3"
            >
              <span>📄</span> Document
            </button>
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
              onChange={(e) => handleFileSelect(e, "document")}
              className="hidden"
            />

            <button
              onClick={() =>
                handleFileSelect(
                  {
                    target: { files: [new File(["contact"], "contact.vcf")] },
                  } as any,
                  "contact"
                )
              }
              className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg flex items-center gap-3"
            >
              <span>👤</span> Contact
            </button>

            <button
              onClick={() =>
                handleFileSelect(
                  {
                    target: { files: [new File(["poll"], "poll.txt")] },
                  } as any,
                  "poll"
                )
              }
              className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg flex items-center gap-3"
            >
              <span>📊</span> Poll
            </button>

            <button
              onClick={() =>
                handleFileSelect(
                  {
                    target: { files: [new File(["drawing"], "sketch.png")] },
                  } as any,
                  "drawing"
                )
              }
              className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg flex items-center gap-3"
            >
              <span>✏️</span> Drawing
            </button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="text-primary hover:bg-primary/10"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
          </div>

          <Input
            placeholder="Aa"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 bg-muted border-0 rounded-full"
          />

          <Button
            size="icon"
            variant="ghost"
            className="text-primary hover:bg-primary/10"
          >
            <Smile className="w-5 h-5" />
          </Button>

          {messageText.trim() ? (
            <Button
              size="icon"
              onClick={handleSendMessage}
              className="bg-primary hover:bg-primary/90 rounded-full"
            >
              <Send className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={handleVoiceStart}
              className="bg-primary hover:bg-primary/90 rounded-full"
            >
              <Mic className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
