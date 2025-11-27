"use client";

import React, { useState, useMemo } from "react";
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
import { toast } from "sonner";
import { Key } from "lucide-react";

interface AssignRoomDialogProps {
  open: boolean;
  bookingId: string | undefined;
  onOpenChange: (open: boolean) => void;
  onAssign: (bookingId: string, roomNumber: number) => void;
}

export default function AssignRoomDialog({ open, bookingId, onOpenChange, onAssign }: AssignRoomDialogProps) {
  const [room, setRoom] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const roomNumber = useMemo(() => {
    const n = parseInt(room, 10);
    return Number.isNaN(n) ? null : n;
  }, [room]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!bookingId) return setError("Missing booking id");
    if (!roomNumber || roomNumber <= 0) return setError("Please enter a valid room number");
    onAssign(bookingId, roomNumber);
    setRoom("");
    setError(null);
    onOpenChange(false);
    toast.success(`Assigned room ${roomNumber}`);
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
            <div className="flex items-center gap-2">
              <Input
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. 12"
                type="number"
                min={1}
                step={1}
                aria-label="Room number"
                autoFocus
                className="max-w-xs"
              />
              <span className="text-sm text-muted-foreground">Booking: <span className="font-mono">{bookingId ?? "—"}</span></span>
            </div>
            {error && <div className="text-destructive text-sm mt-1">{error}</div>}
            <div className="text-xs text-muted-foreground mt-2">Enter a positive integer for the room number. For example: <strong>12</strong>.</div>
          </div>
          <DialogFooter>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={!roomNumber || (roomNumber ?? 0) <= 0}>
                <Key className="size-4 mr-2" />Assign
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
