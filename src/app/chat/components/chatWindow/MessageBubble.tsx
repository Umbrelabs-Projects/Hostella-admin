"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import { Message } from "@/types/chat";
import { useChatStore } from "@/stores/useChatStore";

interface MessageBubbleProps {
	message: Message;
	chatId: string;
}

export default function MessageBubble({ message, chatId }: MessageBubbleProps) {
	// keep chatId param for parity with callers
	void chatId;
	const isAdmin = message.sender === "admin";
	const playingVoiceId = useChatStore((s) => s.playingVoiceId);
	const setPlayingVoiceId = useChatStore((s) => s.setPlayingVoiceId);
	const setReplying = useChatStore((s) => s.setReplying);

	const isPlaying = playingVoiceId === message.id;
	const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
	const ctxRef = useRef<HTMLDivElement | null>(null);

	const handlePlayVoice = () => {
		if (isPlaying) setPlayingVoiceId(null);
		else setPlayingVoiceId(message.id);
	};

	const onContext = (e: React.MouseEvent) => {
		e.preventDefault();
		setContextMenu({ x: e.clientX, y: e.clientY });
	};

	const handleReply = () => {
		setReplying(message);
		setContextMenu(null);
	};

	return (
		<div onContextMenu={onContext} className="flex items-start gap-3 group">
			{!isAdmin && (
				<div className="w-8 h-8 rounded-full bg-linear-to-br from-green-400 to-green-500 flex items-center justify-center text-white text-sm font-bold shrink-0">S</div>
			)}

			<div className="flex flex-col gap-1 max-w-[70%] sm:max-w-md">
				<div className="flex items-end gap-2">
					<div
						className={cn(
							"px-4 py-3 rounded-3xl shadow-sm",
							isAdmin
								? "bg-blue-500 text-white rounded-br-none"
								: "bg-white text-slate-900 rounded-bl-none border border-slate-200"
						)}
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
								className={`px-3 py-1 rounded-lg border ${isPlaying ? "border-primary" : "border-muted/30"}`}
							>
								{isPlaying ? "Playing..." : "Play Voice"} ({message.voiceDuration}s)
							</button>
						) : (
							<p className="text-sm leading-relaxed">{message.text}</p>
						)}
					</div>
				</div>
				<p className={cn("text-xs px-4", isAdmin ? "text-right text-slate-500" : "text-left text-slate-500")}>
					{message.timestamp}
				</p>
			</div>

			{isAdmin && (
				<div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">A</div>
			)}

			{contextMenu && (
				<>
					<div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
					<div
						ref={ctxRef}
						className="fixed z-50 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-max"
						style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
					>
						<button onClick={handleReply} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
							<RotateCcw className="h-4 w-4" />
							Reply
						</button>
					</div>
				</>
			)}
		</div>
	);
}


