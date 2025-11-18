"use client";

import { Message } from "@/types/chat";
import { useChatStore } from "@/stores/useChatStore";

interface MessageBubbleProps {
  message: Message;
  chatId: string;
}

export default function MessageBubble({ message, chatId }: MessageBubbleProps) {
  const { playingVoiceId, setPlayingVoiceId } = useChatStore((s) => ({
    playingVoiceId: s.playingVoiceId,
    setPlayingVoiceId: s.setPlayingVoiceId,
  }));

  const isPlaying = playingVoiceId === message.id;

  const handlePlayVoice = () => {
    if (isPlaying) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(message.id);
    }
  };

  return (
    <div
      className={`p-3 rounded-xl max-w-[70%] ${
        message.sender === "admin" ? "bg-primary text-white self-end" : "bg-muted/10 text-black self-start"
      }`}
    >
      {message.replyTo && (
        <div className="mb-1 p-2 rounded-lg bg-muted/20 text-sm">
          <span className="font-semibold">{message.replyTo.senderName}: </span>
          {message.replyTo.text}
        </div>
      )}

      {message.type === "voice" ? (
        <button
          onClick={handlePlayVoice}
          className={`px-3 py-1 rounded-lg border ${
            isPlaying ? "border-primary" : "border-muted/30"
          }`}
        >
          {isPlaying ? "Playing..." : "Play Voice"} ({message.voiceDuration}s)
        </button>
      ) : (
        <p>{message.text}</p>
      )}
    </div>
  );
}
