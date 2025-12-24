"use client";

import { ColumnDef } from "@tanstack/react-table";
import { StudentBooking } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

interface ColumnsConfig {
  onView: (booking: StudentBooking) => void;
  onDelete?: (id: string) => void;
  showStatus?: boolean; // whether to show status column
  showAssigned?: boolean; // whether to show assigned room column
  showFloor?: boolean; // whether to include floor column (derived from room number)
}

export const columns = ({ onView, onDelete, showStatus = true, showAssigned = false, showFloor = false }: ColumnsConfig): ColumnDef<StudentBooking>[] => {
  const base: ColumnDef<StudentBooking>[] = [
    {
      accessorKey: "firstName",
      header: "Name",
      cell: ({ row }) => {
        const b = row.original;
        const fullName = `${b.firstName} ${b.lastName || ""}`.trim();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              {(b.avatar || b.imageUrl) ? (
                <AvatarImage 
                  src={b.avatar || b.imageUrl || ""} 
                  alt={fullName}
                />
              ) : null}
              <AvatarFallback className="bg-teal-600 text-white font-semibold text-xs">
                {`${b.firstName?.[0] || ""}${b.lastName?.[0] || ""}`.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{fullName}</span>
              <span className="text-xs text-muted-foreground">{b.studentId}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "bookingId",
      header: "Booking ID",
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => String(row.getValue("gender")).toUpperCase(),
    },
  ];

  // Helper to normalize and format status (API returns lowercase with spaces/underscores)
  const normalizeStatus = (status: string): string => {
    const normalized = status.toLowerCase().trim();
    const statusMap: Record<string, string> = {
      "pending payment": "PENDING_PAYMENT",
      "pending approval": "PENDING_APPROVAL",
      "approved": "APPROVED",
      "room_allocated": "ROOM_ALLOCATED",
      "room allocated": "ROOM_ALLOCATED",
      "completed": "COMPLETED",
      "cancelled": "CANCELLED",
      "rejected": "REJECTED",
      "expired": "EXPIRED",
    };
    return statusMap[normalized] || normalized.toUpperCase().replace(/\s+/g, "_");
  };

  const formatStatusLabel = (status: string): string => {
    const normalized = normalizeStatus(status);
    if (normalized === "APPROVED") return "Approved (Unassigned)";
    if (normalized === "ROOM_ALLOCATED") return "Room Allocated";
    if (normalized === "COMPLETED") return "Completed";
    if (normalized === "CANCELLED") return "Cancelled";
    if (normalized === "REJECTED") return "Rejected";
    if (normalized === "EXPIRED") return "Expired";
    // Convert to readable format
    return normalized.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string): string => {
    const normalized = normalizeStatus(status);
    if (normalized === "PENDING_PAYMENT") return "bg-amber-100 text-amber-800";
    if (normalized === "PENDING_APPROVAL") return "bg-orange-100 text-orange-800";
    if (normalized === "APPROVED") return "bg-slate-100 text-slate-800";
    if (normalized === "ROOM_ALLOCATED") return "bg-blue-100 text-blue-800";
    if (normalized === "COMPLETED") return "bg-green-100 text-green-800";
    if (normalized === "CANCELLED") return "bg-red-100 text-red-800";
    if (normalized === "REJECTED") return "bg-red-100 text-red-800";
    if (normalized === "EXPIRED") return "bg-gray-100 text-gray-800";
    return "bg-gray-100 text-gray-800";
  };

  if (showStatus) {
    base.push({
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as StudentBooking["status"];
        const label = formatStatusLabel(status);
        const cls = getStatusColor(status);
        return <Badge className={cls}>{label}</Badge>;
      },
    });
  }

  base.push({
    accessorKey: "roomTitle",
    header: "Room Type",
  });

  if (showAssigned) {
    base.push({
      accessorKey: "allocatedRoomNumber",
      header: "Room Number",
      cell: ({ row }) => {
        const booking = row.original;
        // Normalize status for comparison
        const normalizeStatus = (status: string): string => {
          const statusMap: Record<string, string> = {
            "pending payment": "PENDING_PAYMENT",
            "pending approval": "PENDING_APPROVAL",
            "approved": "APPROVED",
          };
          return statusMap[status.toLowerCase()] || status.toUpperCase().replace(/\s+/g, "_");
        };
        const normalized = normalizeStatus(booking.status);
        // Do not show assigned room for pending statuses
        if (normalized === "PENDING_PAYMENT" || normalized === "PENDING_APPROVAL") {
          return <span className="text-muted-foreground">—</span>;
        }
        return booking.allocatedRoomNumber != null ? String(booking.allocatedRoomNumber) : <span className="text-muted-foreground">—</span>;
      },
    });
  }

  // optional floor column derived from room number
  if (showFloor) {
    base.push({
      id: "floor",
      header: "Floor",
      cell: ({ row }) => {
        const booking = row.original;
        const n = booking.allocatedRoomNumber;
        if (n == null) return <span className="text-muted-foreground">—</span>;
        // Derive floor as groups of 10 rooms per floor (1-10 => floor 1, 11-20 => floor 2, etc.)
        const floor = Math.floor((n - 1) / 10) + 1;
        return String(floor);
      },
    });
  }

  base.push({
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => row.getValue("date") as string,
  });

  base.push({
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const booking = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(booking)}
            className="h-8 w-8 cursor-pointer"
          >
            <Info className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(booking.id)}
              className="h-8 cursor-pointer w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  });

  return base;
};
