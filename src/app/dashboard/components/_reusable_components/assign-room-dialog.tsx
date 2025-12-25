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
import { Key, Loader2, Home, Users } from "lucide-react";
import { useBookingsStore } from "@/stores/useBookingsStore";
import { cn } from "@/lib/utils";

// Room interface matching backend API response
interface Room {
  id: string;
  roomNumber: string;
  floorNumber: number;
  capacity: number;
  price: number;
  status: string;
  genderType: string | null;
  type: string | null;
  currentOccupants: number;
  availableSpots: number;
  occupancyStatus: "available" | "partially_available" | "full";
  colorCode: "default" | "green" | "red";
  allocatedBookings: Array<{
    id: string;
    bookingId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      gender: string;
      studentRefNumber: string;
    };
  }>;
  images: string[];
}

interface AssignRoomDialogProps {
  open: boolean;
  bookingId: string | undefined;
  onOpenChange: (open: boolean) => void;
  onAssign: (bookingId: string, roomId: string) => void;
}

export default function AssignRoomDialog({ open, bookingId, onOpenChange, onAssign }: AssignRoomDialogProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSuitableRooms } = useBookingsStore();

  // Fetch suitable rooms when dialog opens
  useEffect(() => {
    if (open && bookingId) {
      setLoading(true);
      setError(null);
      setSelectedRoomId(null);
      
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
      setSelectedRoomId(null);
    }
  }, [open, bookingId, getSuitableRooms]);

  const handleAssign = async () => {
    if (!bookingId) {
      setError("Missing booking ID");
      return;
    }
    
    if (!selectedRoomId) {
      setError("Please select a room");
      return;
    }

    setAssigning(true);
    setError(null);
    try {
      await onAssign(bookingId, selectedRoomId);
      setSelectedRoomId(null);
    onOpenChange(false);
      const selectedRoom = rooms.find(r => r.id === selectedRoomId);
      toast.success(`Assigned room ${selectedRoom?.roomNumber || selectedRoomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign room");
    } finally {
      setAssigning(false);
    }
  };

  // Use backend's colorCode and occupancyStatus directly
  const getRoomColor = (room: Room) => {
    const isSelected = selectedRoomId === room.id;
    
    if (isSelected) {
      return "ring-2 ring-blue-500 ring-offset-2 bg-blue-50 dark:bg-blue-950/30 border-blue-500";
    }
    
    // Use backend's colorCode
    switch (room.colorCode) {
      case "red":
        return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100 cursor-not-allowed opacity-75";
      case "green":
        return "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer";
      case "default":
      default:
        return "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer";
    }
  };

  const getRoomStatusText = (room: Room) => {
    switch (room.occupancyStatus) {
      case "full":
        return "Full";
      case "partially_available":
        return `${room.availableSpots} Spot${room.availableSpots > 1 ? 's' : ''} Available`;
      case "available":
      default:
        return "Available";
    }
  };

  const isRoomSelectable = (room: Room): boolean => {
    return room.occupancyStatus !== "full";
  };

  const handleRoomClick = (room: Room) => {
    if (!isRoomSelectable(room)) {
      return; // Don't allow selection of full rooms
    }
    setSelectedRoomId(room.id);
    setError(null);
  };

  // Group rooms by capacity/type for display
  const oneInOneRooms = rooms.filter((r) => r.capacity === 1);
  const twoInOneRooms = rooms.filter((r) => r.capacity === 2);
  const threeInOneRooms = rooms.filter((r) => r.capacity === 3);

  const renderRoomCard = (room: Room) => {
    const isSelected = selectedRoomId === room.id;
    const isSelectable = isRoomSelectable(room);

    return (
      <button
        key={room.id}
        type="button"
        onClick={() => handleRoomClick(room)}
        disabled={!isSelectable}
        className={cn(
          "relative p-4 rounded-lg border-2 transition-all text-left min-h-[120px]",
          getRoomColor(room)
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="font-bold text-lg">#{room.roomNumber}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Floor {room.floorNumber}</div>
          </div>
          {isSelected && (
            <div className="absolute top-2 right-2">
              <div className="size-3 bg-blue-500 rounded-full"></div>
            </div>
          )}
        </div>

        <div className="space-y-1 text-xs mb-2">
          <div className="flex justify-between">
            <span className="opacity-75">Capacity:</span>
            <span className="font-semibold">{room.capacity}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75">Occupied:</span>
            <span className="font-semibold">{room.currentOccupants}/{room.capacity}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75">Price:</span>
            <span className="font-semibold">GHS {room.price.toLocaleString()}</span>
          </div>
        </div>

        {room.allocatedBookings.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
            <div className="text-xs font-semibold mb-1 flex items-center gap-1">
              <Users className="size-3" />
              Current Occupants:
            </div>
            <div className="space-y-1">
              {room.allocatedBookings.map((booking) => (
                <div key={booking.id} className="text-xs">
                  <div className="font-medium">
                    {booking.user.firstName} {booking.user.lastName}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    ({booking.user.studentRefNumber})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
          <div className={cn(
            "text-xs font-semibold",
            room.occupancyStatus === "full" && "text-red-700 dark:text-red-400",
            room.occupancyStatus === "partially_available" && "text-green-700 dark:text-green-400",
            room.occupancyStatus === "available" && "text-gray-700 dark:text-gray-400"
          )}>
            {getRoomStatusText(room)}
          </div>
        </div>
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
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
              <p>No suitable rooms available for this booking type.</p>
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
                    {oneInOneRooms.map(renderRoomCard)}
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
                    {twoInOneRooms.map(renderRoomCard)}
                  </div>
                </div>
              )}

              {/* Three-in-one Rooms */}
              {threeInOneRooms.length > 0 && (
          <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Three-in-One Rooms ({threeInOneRooms.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {threeInOneRooms.map(renderRoomCard)}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded border-2 border-green-300 dark:border-green-700 bg-green-100 dark:bg-green-900/30"></div>
                    <span>Partially Available</span>
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
              {selectedRoomId ? (
                <span>
                  Selected: Room{" "}
                  <span className="font-mono font-semibold">
                    #{rooms.find(r => r.id === selectedRoomId)?.roomNumber || selectedRoomId}
                  </span>
                </span>
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
                disabled={!selectedRoomId || loading || assigning}
              >
                {assigning ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Key className="size-4 mr-2" />
                    Assign Room
                  </>
                )}
              </Button>
            </div>
            </div>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
