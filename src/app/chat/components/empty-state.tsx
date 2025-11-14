"use client";

import { images } from "@/lib/images";
import Image from "next/image";

export default function EmptyState({
  onSelectChat,
}: {
  onSelectChat: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black gap-6">
      {/* Hostella Logo */}
      <div className="bg-black px-3 pb-2">
        <Image src={images.logo} alt="logo" className="w-40" />
      </div>
      {/* Message */}
      <div className="text-center max-w-md">
        <p className="text-lg text-muted-foreground mb-2">
          Welcome to your admin chat
        </p>
        <p className="text-sm text-muted-foreground">
          Select a student from the chat list to start messaging about their
          bookings
        </p>
      </div>

      {/* Mobile CTA */}
      <button
        onClick={onSelectChat}
        className="md:hidden px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        View Chats
      </button>
    </div>
  );
}
