"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AssignRoomDialogProps {
  open: boolean;
  bookingId: string | undefined;
  onOpenChange: (open: boolean) => void;
  onAssign: (bookingId: string, roomNumber: number) => void;
}

export default function AssignRoomDialog({ open, bookingId, onOpenChange, onAssign }: AssignRoomDialogProps) {
  const [room, setRoom] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const n = parseInt(room, 10);
    if (!bookingId) return setError("Missing booking id");
    if (Number.isNaN(n) || n <= 0) return setError("Please enter a valid room number");
    onAssign(bookingId, n);
    setRoom("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Room</DialogTitle>
          <DialogDescription>Enter a room number to assign to the student.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Room number</Label>
            <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. 12" />
            {error && <div className="text-destructive text-sm mt-1">{error}</div>}
          </div>
          <DialogFooter>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Assign</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
