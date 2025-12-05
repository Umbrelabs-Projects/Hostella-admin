// src/app/dashboard/super-admin/_components/AdminFilters.tsx

"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminStore } from "@/stores/useAdminStore";
import { X } from "lucide-react";

interface AdminFiltersProps {
  onFilterChange?: () => void;
}

export default function AdminFilters({ onFilterChange }: AdminFiltersProps) {
  const {
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    resetFilters,
  } = useAdminStore();

  const handleResetFilters = () => {
    resetFilters();
    onFilterChange?.();
  };

  const hasActiveFilters = searchQuery !== "" || roleFilter !== "all" || statusFilter !== "all";

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 md:flex-row md:items-end">
      {/* Search */}
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700">Search</label>
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onFilterChange?.();
          }}
          className="mt-1"
        />
      </div>

      {/* Role Filter */}
      <div className="w-full md:w-48">
        <label className="text-sm font-medium text-gray-700">Role</label>
        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value as "all" | "super-admin" | "hostel-admin");
            onFilterChange?.();
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super-admin">Super Admin</SelectItem>
            <SelectItem value="hostel-admin">Hostel Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="w-full md:w-40">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as "all" | "active" | "inactive" | "suspended");
            onFilterChange?.();
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Filters Button */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={handleResetFilters} className="w-full md:w-auto">
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
}
