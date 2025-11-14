import { useEffect, useRef, useState } from "react";

const MOCK_MESSAGES = [
  { id: "1", sender: "me", text: "Hello!", time: "2:20 PM" },
  { id: "2", sender: "them", text: "Hi there!", time: "2:21 PM" },
];

export default function useChatMessages(chatId: string) {
  const [messages] = useState(MOCK_MESSAGES);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return { messages, bottomRef };
}
