// src/app/dashboard/broadcast/_components/BroadcastList.tsx

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BroadcastMessage } from "@/types/broadcast";
import { Loader2, Trash2, RotateCcw, Eye } from "lucide-react";

// Format date without date-fns
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

interface BroadcastListProps {
  messages: BroadcastMessage[];
  loading: boolean;
  onView?: (message: BroadcastMessage) => void;
  onResend?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const getPriorityBadgeColor = (priority: BroadcastMessage["priority"]) => {
  switch (priority) {
    case "low":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "urgent":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusBadgeColor = (status: BroadcastMessage["status"]) => {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-800";
    case "sent":
      return "bg-blue-100 text-blue-800";
    case "scheduled":
      return "bg-purple-100 text-purple-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function BroadcastList({
  messages,
  loading,
  onView,
  onResend,
  onDelete,
}: BroadcastListProps) {
  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">No broadcast messages yet.</p>
        <p className="text-sm text-gray-500">Start by creating your first message.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Title</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Engagement</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.id} className="hover:bg-gray-50">
              <TableCell className="font-medium max-w-xs truncate">{message.title}</TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {message.recipientType === "all-residents" && "All Residents"}
                  {message.recipientType === "all-members" && "All Members"}
                  {message.recipientType === "specific-members" &&
                    `${message.recipientCount} Members`}
                </span>
              </TableCell>
              <TableCell>
                <Badge className={`${getPriorityBadgeColor(message.priority)} capitalize`}>
                  {message.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={`${getStatusBadgeColor(message.status)} capitalize`}>
                  {message.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {formatDate(message.createdAt)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {message.readCount !== undefined && message.recipientCount > 0
                    ? `${Math.round((message.readCount / message.recipientCount) * 100)}%`
                    : "N/A"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onView && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onView(message)}
                      title="View message"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {(message.status === "sent" || message.status === "failed") && onResend && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onResend(message.id)}
                      title="Resend message"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  {(message.status === "draft" || message.status === "scheduled") && onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(message.id)}
                      title="Delete message"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
