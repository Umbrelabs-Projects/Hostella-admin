// components/chat/ChatWindow/MessageInput.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Mic, Send, Smile, Trash2, ChevronUp } from "lucide-react";
import { useChatStore } from "@/stores/useChatStore";
import type { Message } from "@/types/chat";

export default function MessageInput({ chatId }: { chatId: string }) {
  const [text, setText] = useState("");
  const [isRecordingLocal, setIsRecordingLocal] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const store = useChatStore();
  const replying = store.replying;
  const setReplying = store.setReplying;
  const showAttachmentMenu = store.showAttachmentMenu;
  const setShowAttachmentMenu = store.setShowAttachmentMenu;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const send = () => {
    if (!text.trim()) return;
    store.sendMessage(chatId, text, replying ?? undefined);
    setText("");
    setReplying(null);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || typeof MediaRecorder === "undefined") {
      alert("Recording not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recordedChunks.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "audio/webm" });
        store.sendVoice(chatId, recordTime, blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecordingLocal(true);
      store.setRecording(true);
      setRecordTime(0);
      timerRef.current = window.setInterval(() => setRecordTime((v) => v + 1), 1000);
    } catch (err) {
      console.error("Recording error", err);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingLocal(false);
    store.setRecording(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordTime(0);
    recordedChunks.current = [];
  };

  const finishRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingLocal(false);
    store.setRecording(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordTime(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: Message["type"]) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileData = {
      fileName: file.name,
      fileSize: `${Math.round(file.size / 1024)} KB`,
      fileType: file.type,
      fileBlob: file,
    };
    store.sendFile(chatId, type, fileData, file.name);
    if (e.target) (e.target as HTMLInputElement).value = "";
    setShowAttachmentMenu(false);
  };

  const sendContact = () => {
    store.sendFile(chatId, "contact", { fileName: "contact.vcf", fileSize: "2 KB", fileType: "text/vcard" }, "Contact shared");
    setShowAttachmentMenu(false);
  };

  const sendPoll = () => {
    store.sendFile(chatId, "poll", { fileName: "poll.json", fileSize: "1 KB", fileType: "application/json" }, "Poll: Best time for check-in?");
    setShowAttachmentMenu(false);
  };

  const sendDrawing = () => {
    store.sendFile(chatId, "drawing", { fileName: "sketch.png", fileSize: "256 KB", fileType: "image/png" }, "Drawing");
    setShowAttachmentMenu(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="border-t border-border p-3 bg-card space-y-2 relative">
      {/* Recording preview */}
      {isRecordingLocal && (
        <div className="bg-muted rounded-lg px-3 py-2 flex items-center justify-between">
          <Button size="icon" variant="ghost" onClick={cancelRecording}><Trash2 className="w-5 h-5" /></Button>

          <div className="flex items-center gap-3 flex-1 justify-center">
            <span className="text-sm font-mono">{formatTime(recordTime)}</span>
            <div className="flex gap-1 items-center">
              {[...Array(4)].map((_, i) => <div key={i} className="w-1 bg-primary rounded-full animate-pulse" style={{ height: 4, animationDelay: `${i * 0.1}s` }} />)}
            </div>
          </div>

          <Button size="icon" onClick={finishRecording} className="bg-primary hover:bg-primary/90 rounded-full"><ChevronUp className="w-5 h-5" /></Button>
        </div>
      )}

      {/* Attachment menu */}
      {showAttachmentMenu && (
        <div className="bg-card border border-border rounded-lg p-2 space-y-1 absolute bottom-24 left-4 z-40 w-48">
          <button onClick={() => fileInputRef.current?.click()} className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg flex items-center gap-3">📷 Photos & videos</button>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={(e) => handleFileChange(e, "photo")} className="hidden" />

          <button onClick={() => cameraInputRef.current?.click()} className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg flex items-center gap-3">📹 Camera</button>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange(e, "photo")} className="hidden" />

          <button onClick={() => docInputRef.current?.click()} className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg flex items-center gap-3">📄 Document</button>
          <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx" onChange={(e) => handleFileChange(e, "document")} className="hidden" />

          <button onClick={sendContact} className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg flex items-center gap-3">👤 Contact</button>
          <button onClick={sendPoll} className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg flex items-center gap-3">📊 Poll</button>
          <button onClick={sendDrawing} className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg flex items-center gap-3">✏️ Drawing</button>
        </div>
      )}

      {/* Reply preview */}
      {replying && (
        <div className="bg-muted border-t border-border px-4 py-2 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-semibold">Replying to {replying.sender === "admin" ? "yourself" : "student"}</p>
            <p className="text-sm text-foreground truncate">{replying.text}</p>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setReplying(null)} className="ml-2">✕</Button>
        </div>
      )}

      <div className="flex gap-2 items-end">
        <div className="relative">
          <Button size="icon" variant="ghost" onClick={() => store.setShowAttachmentMenu(!store.showAttachmentMenu)} className="text-primary hover:bg-primary/10"><Paperclip className="w-5 h-5" /></Button>
        </div>

        <Input placeholder="Aa" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} className="flex-1 bg-muted border-0 rounded-full" />

        <Button size="icon" variant="ghost" className="text-primary hover:bg-primary/10"><Smile className="w-5 h-5" /></Button>

        {text.trim() ? (
          <Button size="icon" onClick={send} className="bg-primary hover:bg-primary/90 rounded-full"><Send className="w-5 h-5" /></Button>
        ) : (
          <>
            {isRecordingLocal ? (
              <Button size="icon" onClick={finishRecording} className="bg-primary hover:bg-primary/90 rounded-full"><ChevronUp className="w-5 h-5" /></Button>
            ) : (
              <Button size="icon" onClick={startRecording} className="bg-primary hover:bg-primary/90 rounded-full"><Mic className="w-5 h-5" /></Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
