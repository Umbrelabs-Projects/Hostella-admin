// src/app/dashboard/super-admin/_components/AdminTable.tsx

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
import { Admin } from "@/types/admin";
import { Loader2, Edit, Trash2, Building2 } from "lucide-react";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

interface AdminTableProps {
  admins: Admin[];
  loading: boolean;
  onEdit?: (admin: Admin) => void;
  onDelete?: (admin: Admin) => void;
}

const getRoleBadgeColor = (role: Admin["role"]) => {
  switch (role) {
    case "super-admin":
      return "bg-purple-100 text-purple-800";
    case "hostel-admin":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusBadgeColor = (status: Admin["status"]) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "suspended":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function AdminTable({ admins, loading, onEdit, onDelete }: AdminTableProps) {
  if (loading && admins.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">No admins found. Click &quot;Add New Admin&quot; to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Admin Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Assigned Hostel</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Last Login</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {admin.firstName} {admin.lastName}
                </TableCell>
                <TableCell className="text-sm text-gray-600">{admin.email}</TableCell>
                <TableCell className="text-sm text-gray-600">{admin.phone}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(admin.role)}>
                    {admin.role === "super-admin" ? "Super Admin" : "Hostel Admin"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {admin.assignedHostelName ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{admin.assignedHostelName}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Not assigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(admin.status)}>
                    {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatRelativeTime(admin.lastLogin)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit?.(admin)}
                      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete?.(admin)}
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
