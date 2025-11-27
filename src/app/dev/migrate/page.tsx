"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBookingsStore } from "@/stores/useBookingsStore";
import { useMembersStore } from "@/stores/useMembersStore";

export default function DevMigratePage() {
  const { bookings } = useBookingsStore();
  const { members } = useMembersStore();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleMigrate = () => {
    setRunning(true);
    const { addMember } = useMembersStore.getState();
    const toAdd = (bookings || []).filter((b) => b.allocatedRoomNumber != null && b.status === "approved");
    let added = 0;
    toAdd.forEach((b) => {
      const exists = (members || []).some((m) => m.id === b.id);
      if (!exists) {
        addMember(b);
        added += 1;
      }
    });
    setMessage(`Migration completed. ${added} member(s) added.`);
    setRunning(false);
  };

  return (
    <main className="p-6">
      <h2 className="text-lg font-semibold mb-4">Dev Migration</h2>
      <p className="mb-4">This page will add any approved bookings with an allocated room to the explicit members list.</p>
      <div className="flex gap-3 mb-4">
        <Button onClick={handleMigrate} disabled={running}>
          {running ? "Running..." : "Migrate allocated bookings to members"}
        </Button>
      </div>
      {message && <div className="text-sm text-muted-foreground">{message}</div>}
      <div className="mt-6">
        <h3 className="font-medium">Current Members (preview)</h3>
        <ul className="list-disc pl-6 mt-2">
          {(members || []).map((m) => (
            <li key={m.id}>{m.bookingId} — {m.firstName} {m.lastName}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
