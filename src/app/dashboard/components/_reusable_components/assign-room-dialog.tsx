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
import { useMembersStore } from "@/stores/useMembersStore";
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
  isMember?: boolean; // If true, use member endpoint; if false/undefined, use booking endpoint
}

export default function AssignRoomDialog({ open, bookingId, onOpenChange, onAssign, isMember = false }: AssignRoomDialogProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSuitableRooms } = useBookingsStore();
  const { getSuitableRoomsForMember } = useMembersStore();

  // Fetch suitable rooms when dialog opens
  useEffect(() => {
    if (open && bookingId) {
      setLoading(true);
      setError(null);
      setSelectedRoomId(null);
      
      // Log for debugging
      if (process.env.NODE_ENV === "development") {
        console.log("[AssignRoomDialog] Fetching suitable rooms for", isMember ? "memberId" : "bookingId", ":", bookingId);
      }
      
      // Use member endpoint if isMember is true, otherwise use booking endpoint
      const fetchRooms = isMember 
        ? getSuitableRoomsForMember(bookingId)
        : getSuitableRooms(bookingId);
      
      fetchRooms
        .then((fetchedRooms) => {
          if (process.env.NODE_ENV === "development") {
            console.log("[AssignRoomDialog] Fetched rooms:", fetchedRooms.length);
          }
          setRooms(fetchedRooms);
          setLoading(false);
        })
        .catch((err) => {
          const errorMessage = err instanceof Error ? err.message : "Failed to load rooms";
          if (process.env.NODE_ENV === "development") {
            console.error("[AssignRoomDialog] Error fetching rooms:", err);
          }
          // If booking/member not found, show a helpful message
          if (errorMessage.includes("not found") || errorMessage.includes("Member not found") || errorMessage.includes("Booking not found")) {
            const entityType = isMember ? "member" : "booking";
            setError(`Unable to fetch available rooms. The ${entityType} ID "${bookingId}" was not found. Please check if the ${entityType} exists.`);
          } else {
            setError(errorMessage);
          }
          setLoading(false);
        });
    } else {
      setRooms([]);
      setSelectedRoomId(null);
    }
  }, [open, bookingId, isMember, getSuitableRooms, getSuitableRoomsForMember]);

  const handleAssign = async () => {
    if (!bookingId) {
      setError("Missing booking ID");
      return;
    }
    
    if (!selectedRoomId) {
      setError("Please select a room");
      return;
    }

    const selectedRoom = rooms.find(r => r.id === selectedRoomId);
    if (!selectedRoom) {
      setError("Selected room not found");
      return;
    }

    // Double-check room is still available (defensive check)
    // Backend will also validate using actual booking count, but this provides immediate feedback
    if (selectedRoom.occupancyStatus === "full") {
      setError("This room is now full. Please select another room.");
      return;
    }

    setAssigning(true);
    setError(null);
    try {
      await onAssign(bookingId, selectedRoomId);
      setSelectedRoomId(null);
      onOpenChange(false);
      toast.success(`Assigned room ${selectedRoom.roomNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign room");
    } finally {
      setAssigning(false);
    }
  };

  // Use backend's colorCode and occupancyStatus directly
  // Backend calculates occupancyStatus based on actual booking count (bookings with status "ROOM_ALLOCATED")
  // This ensures frontend and backend are in sync - both use the same calculation method
  // Backend provides: "default" | "green" | "red"
  const getRoomColor = (room: Room) => {
    switch (room.colorCode) {
      case "red":
        // Full rooms - red background (cannot select)
        return "bg-red-600 hover:bg-red-500";
      case "green":
        // Partially available - green background (two-in-one with one person)
        return "bg-green-600 hover:bg-green-500";
      case "default":
      default:
        // Available - white/default background (empty rooms)
        return "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700";
    }
  };


  // Check if room is selectable based on backend's occupancyStatus
  // Backend calculates this by counting actual bookings with status "ROOM_ALLOCATED"
  // This ensures consistency between frontend display and backend validation
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

  // Group rooms by capacity/type for display (used for labeling)
  const oneInOneRooms = rooms.filter((r) => r.capacity === 1);
  const twoInOneRooms = rooms.filter((r) => r.capacity === 2);
  const threeInOneRooms = rooms.filter((r) => r.capacity === 3);
  
  // Sort rooms by floor and room number for better UX
  const sortedRooms = [...rooms].sort((a, b) => {
    if (a.floorNumber !== b.floorNumber) {
      return a.floorNumber - b.floorNumber;
    }
    // Extract numeric part from room number for proper sorting
    const aNum = parseInt(a.roomNumber.replace(/\D/g, '')) || 0;
    const bNum = parseInt(b.roomNumber.replace(/\D/g, '')) || 0;
    return aNum - bNum;
  });

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
          "relative rounded-lg px-4 py-2.5 transition-all duration-150",
          "flex items-center justify-center min-w-[60px]",
          "hover:brightness-110 active:scale-95",
          isSelected && "ring-2 ring-blue-500 ring-offset-1",
          !isSelectable && "opacity-60 cursor-not-allowed",
          getRoomColor(room)
        )}
      >
        {/* Room number - text color depends on background */}
        <span className={cn(
          "font-semibold text-sm",
          room.colorCode === "default" 
            ? "text-gray-900 dark:text-gray-100" 
            : "text-white"
        )}>
          {room.roomNumber}
        </span>
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-800">
          <DialogTitle className="flex items-center gap-2.5 text-xl">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Key className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            Assign Room
          </DialogTitle>
          <DialogDescription className="mt-2 text-gray-600 dark:text-gray-400">
            Select a room from the available rooms matching the student&apos;s preference.
            {bookingId && (
              <span className="inline-block mt-2 font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {isMember ? "Member ID" : "Booking ID"}: {bookingId}
              </span>
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
            <div className="space-y-6 mx-1">
              {/* Group rooms by floor for better organization */}
              {(() => {
                const floors = Array.from(new Set(sortedRooms.map(r => r.floorNumber))).sort((a, b) => a - b);
                const roomTypeLabel = oneInOneRooms.length > 0 ? "One-in-One" : 
                                     twoInOneRooms.length > 0 ? "Two-in-One" : 
                                     threeInOneRooms.length > 0 ? "Three-in-One" : "Rooms";
                
                return floors.map((floor) => {
                  const floorRooms = sortedRooms.filter(r => r.floorNumber === floor);
                  return (
                    <div key={floor} className="mb-5">
                      {/* Floor heading - simple and clean */}
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                        Floor {floor} • {roomTypeLabel} ({floorRooms.length})
                      </h3>
                      {/* Horizontal row of room buttons */}
                      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        {floorRooms.map(renderRoomCard)}
                      </div>
                    </div>
                  );
                });
              })()}

              {/* Legend - Matching backend color codes */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-6 px-3 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600"></div>
                    <span className="text-gray-600 dark:text-gray-400">Available (default)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 px-3 rounded-lg bg-green-600"></div>
                    <span className="text-gray-600 dark:text-gray-400">Partially Available (green)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 px-3 rounded-lg bg-red-600"></div>
                    <span className="text-gray-600 dark:text-gray-400">Full (red)</span>
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
              <Button className="cursor-pointer" variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAssign}
                disabled={!selectedRoomId || loading || assigning}
                className="cursor-pointer"
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
