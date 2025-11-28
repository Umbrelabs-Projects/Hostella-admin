"use client";

import { ColumnDef } from "@tanstack/react-table";
import { StudentBooking } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

  if (showStatus) {
    base.push({
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as StudentBooking["status"];
        // Replace 'approved' display with 'unassigned' per UI decision
        const label = status === "approved" ? "unassigned" : status;
        const cls =
          label === "pending payment"
            ? "bg-amber-100 text-amber-800"
            : label === "pending approval"
            ? "bg-orange-100 text-orange-800"
            : label === "unassigned"
            ? "bg-slate-100 text-slate-800"
            : "bg-green-100 text-green-800";
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
        // Do not show assigned room for pending statuses
        if (booking.status === "pending payment" || booking.status === "pending approval") {
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
