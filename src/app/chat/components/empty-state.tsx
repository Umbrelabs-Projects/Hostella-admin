"use client";

export default function EmptyState({
  onSelectChat,
}: {
  onSelectChat: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background gap-6">
      {/* Hostella Logo */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-4xl md:text-5xl font-bold text-primary-foreground">
            H
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Hostella
        </h1>
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
