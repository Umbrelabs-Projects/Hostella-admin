// components/chat/ChatWindow/MessageBubble.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/stores/useChatStore";
import type { Message } from "@/types/chat";

export default function MessageBubble({
  message,
  chatId,
}: {
  message: Message;
  chatId: string;
}) {
  const isAdmin = message.sender === "admin";
  const setReplying = useChatStore((s) => s.setReplying);
  const playingVoiceId = useChatStore((s) => s.playingVoiceId);
  const setPlayingVoiceId = useChatStore((s) => s.setPlayingVoiceId);
  const deleteMessage = useChatStore((s) => s.deleteMessage);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // create URL only for voice or image blobs; cleanup afterwards
    if (message.fileData?.fileBlob) {
      const url = URL.createObjectURL(message.fileData.fileBlob);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setAudioUrl(null);
      };
    }
    return;
  }, [message.fileData]);

  useEffect(() => {
    if (playingVoiceId !== message.id && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [playingVoiceId, message.id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playingVoiceId === message.id) {
      audioRef.current.pause();
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(message.id);
      audioRef.current.play().catch(() => setPlayingVoiceId(null));
      audioRef.current.onended = () => setPlayingVoiceId(null);
    }
  };

  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
      <div className="relative group max-w-xs lg:max-w-md">
        <div
          className={`px-3 py-2 rounded-lg ${
            isAdmin
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-muted text-foreground rounded-bl-none"
          } wrap-break-word cursor-context-menu hover:opacity-90 transition`}
        >
          {message.replyTo && (
            <div className="text-xs mb-2 pb-2 border-l-2 pl-2">
              <p className="font-semibold">{message.replyTo.senderName}</p>
              <p className="truncate">{message.replyTo.text}</p>
            </div>
          )}

          {/* Voice */}
          {message.type === "voice" && (
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <span>{playingVoiceId === message.id ? "⏸" : "▶"}</span>
              </button>

              <div className="flex-1">
                <div className="text-sm font-mono">
                  {message.voiceDuration
                    ? `${Math.floor(
                        (message.voiceDuration || 0) / 60
                      )}:${String((message.voiceDuration || 0) % 60).padStart(
                        2,
                        "0"
                      )}`
                    : "0:00"}
                </div>
                {audioUrl && (
                  <audio ref={audioRef} src={audioUrl} preload="auto" />
                )}
              </div>
            </div>
          )}

          {/* Files / Photos / Documents */}
          {message.type &&
            message.type !== "text" &&
            message.type !== "voice" && (
              <div>
                <p className="font-medium mb-1">{message.text}</p>

                {message.fileData?.fileType?.startsWith("image") &&
                  message.fileData.fileBlob &&
                  audioUrl && (
                    <img
                      src={audioUrl}
                      className="max-w-full rounded-md mt-2"
                      alt={message.fileData.fileName}
                    />
                  )}

                {message.fileData &&
                  !message.fileData.fileType?.startsWith("image") && (
                    <div className="text-xs mt-2 pt-2 border-t">
                      <p className="truncate">{message.fileData.fileName}</p>
                      <p>{message.fileData.fileSize}</p>
                    </div>
                  )}
              </div>
            )}

          {/* Plain text */}
          {(!message.type || message.type === "text") && <p>{message.text}</p>}

          <p className="text-xs mt-1 text-muted-foreground">
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
