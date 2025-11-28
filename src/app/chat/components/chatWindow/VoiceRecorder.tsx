
"use client";

import { useChatStore } from "@/stores/useChatStore";

export default function VoiceRecorder() {
	// Placeholder component — actual recording handled in MessageInput
	const isRecording = useChatStore((s) => s.isRecording);
	return (
		<div aria-hidden className="hidden">
			{isRecording ? "Recording..." : null}
		</div>
	);
}
