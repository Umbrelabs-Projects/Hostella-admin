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
}

export const columns = ({ onView, onDelete }: ColumnsConfig): ColumnDef<StudentBooking>[] => [
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
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as StudentBooking["status"];
      const cls =
        status === "pending payment"
          ? "bg-amber-100 text-amber-800"
          : status === "pending approval"
          ? "bg-orange-100 text-orange-800"
          : "bg-green-100 text-green-800";
      return <Badge className={cls}>{status}</Badge>;
    },
  },
  {
    accessorKey: "roomTitle",
    header: "Room Type",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => row.getValue("date") as string,
  },
  {
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
  },
];
