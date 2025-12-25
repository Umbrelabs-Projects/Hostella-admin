"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Key, Loader2, Home } from "lucide-react";
import { useBookingsStore } from "@/stores/useBookingsStore";
import { cn } from "@/lib/utils";

interface Room {
  id: string;
  roomNumber: number;
  roomType: string;
  price: number;
  capacity: number;
  currentOccupancy: number;
  isAvailable: boolean;
  hostelId: string;
}

interface AssignRoomDialogProps {
  open: boolean;
  bookingId: string | undefined;
  onOpenChange: (open: boolean) => void;
  onAssign: (bookingId: string, roomNumber: number) => void;
}

export default function AssignRoomDialog({ open, bookingId, onOpenChange, onAssign }: AssignRoomDialogProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSuitableRooms } = useBookingsStore();

  // Fetch suitable rooms when dialog opens
  useEffect(() => {
    if (open && bookingId) {
      setLoading(true);
      setError(null);
      setSelectedRoom(null);
      
      getSuitableRooms(bookingId)
        .then((fetchedRooms) => {
          setRooms(fetchedRooms);
          setLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load rooms");
          setLoading(false);
        });
    } else {
      setRooms([]);
      setSelectedRoom(null);
    }
  }, [open, bookingId, getSuitableRooms]);

  const handleAssign = () => {
    if (!bookingId) {
      setError("Missing booking ID");
      return;
    }
    
    if (!selectedRoom) {
      setError("Please select a room");
      return;
    }

    onAssign(bookingId, selectedRoom);
    setSelectedRoom(null);
    setError(null);
    onOpenChange(false);
    toast.success(`Assigned room ${selectedRoom}`);
  };

  const getRoomStatus = (room: Room) => {
    // For one-in-one rooms
    if (room.capacity === 1) {
      return room.currentOccupancy >= room.capacity ? "full" : "available";
    }
    
    // For two-in-one rooms
    if (room.capacity === 2) {
      if (room.currentOccupancy >= room.capacity) {
        return "full"; // Red - fully occupied
      } else if (room.currentOccupancy === 1) {
        return "partial"; // Green - one person, space for one more
      } else {
        return "available"; // Green - empty, available
      }
    }
    
    return "available";
  };

  const getRoomColor = (room: Room) => {
    const status = getRoomStatus(room);
    const isSelected = selectedRoom === room.roomNumber;
    
    if (isSelected) {
      return "ring-2 ring-blue-500 ring-offset-2 bg-blue-50 dark:bg-blue-950/30 border-blue-500";
    }
    
    switch (status) {
      case "full":
        return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100 cursor-not-allowed opacity-75";
      case "partial":
        return "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer";
      case "available":
        return "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer";
      default:
        return "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer";
    }
  };

  const getRoomStatusText = (room: Room) => {
    const status = getRoomStatus(room);
    if (status === "full") {
      return "Full";
    } else if (status === "partial" && room.capacity === 2) {
      return "1/2 Occupied";
    } else {
      return "Available";
    }
  };

  const handleRoomClick = (room: Room) => {
    const status = getRoomStatus(room);
    if (status === "full") {
      return; // Don't allow selection of full rooms
    }
    setSelectedRoom(room.roomNumber);
    setError(null);
  };

  // Group rooms by type for display
  const oneInOneRooms = rooms.filter((r) => r.roomType.toLowerCase().includes("one-in-one") || r.capacity === 1);
  const twoInOneRooms = rooms.filter((r) => r.roomType.toLowerCase().includes("two-in-one") || r.capacity === 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="size-5" />
            Assign Room
          </DialogTitle>
          <DialogDescription>
            Select a room from the available rooms matching the student's preference.
            {bookingId && (
              <span className="block mt-1 font-mono text-xs">Booking: {bookingId}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Loading available rooms...</span>
            </div>
          )}

          {error && !loading && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {!loading && !error && rooms.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Home className="size-12 mx-auto mb-3 opacity-50" />
              <p>No suitable rooms available for this booking.</p>
            </div>
          )}

          {!loading && !error && rooms.length > 0 && (
            <div className="space-y-6">
              {/* One-in-one Rooms */}
              {oneInOneRooms.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    One-in-One Rooms ({oneInOneRooms.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {oneInOneRooms.map((room) => (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => handleRoomClick(room)}
                        disabled={getRoomStatus(room) === "full"}
                        className={cn(
                          "relative p-4 rounded-lg border-2 transition-all text-center",
                          getRoomColor(room)
                        )}
                      >
                        <div className="font-bold text-lg mb-1">#{room.roomNumber}</div>
                        <div className="text-xs opacity-75">{getRoomStatusText(room)}</div>
                        {selectedRoom === room.roomNumber && (
                          <div className="absolute top-1 right-1">
                            <div className="size-3 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Two-in-one Rooms */}
              {twoInOneRooms.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Two-in-One Rooms ({twoInOneRooms.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {twoInOneRooms.map((room) => (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => handleRoomClick(room)}
                        disabled={getRoomStatus(room) === "full"}
                        className={cn(
                          "relative p-4 rounded-lg border-2 transition-all text-center",
                          getRoomColor(room)
                        )}
                      >
                        <div className="font-bold text-lg mb-1">#{room.roomNumber}</div>
                        <div className="text-xs opacity-75">{getRoomStatusText(room)}</div>
                        {selectedRoom === room.roomNumber && (
                          <div className="absolute top-1 right-1">
                            <div className="size-3 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded border-2 border-green-300 dark:border-green-700 bg-green-100 dark:bg-green-900/30"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded border-2 border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/30"></div>
                    <span>Full / Assigned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/30"></div>
                    <span>Selected</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-muted-foreground">
              {selectedRoom ? (
                <span>Selected: Room <span className="font-mono font-semibold">#{selectedRoom}</span></span>
              ) : (
                <span>No room selected</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAssign}
                disabled={!selectedRoom || loading}
              >
                <Key className="size-4 mr-2" />
                Assign Room
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
