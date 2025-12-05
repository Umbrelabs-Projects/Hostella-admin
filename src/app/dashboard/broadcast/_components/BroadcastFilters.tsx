// src/app/dashboard/broadcast/_components/BroadcastFilters.tsx

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
import { useBroadcastStore } from "@/stores/useBroadcastStore";
import { X } from "lucide-react";

interface BroadcastFiltersProps {
  onFilterChange?: () => void;
}

export default function BroadcastFilters({ onFilterChange }: BroadcastFiltersProps) {
  const { searchQuery, setSearchQuery, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter } =
    useBroadcastStore();

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    onFilterChange?.();
  };

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || priorityFilter !== "all";

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 md:flex-row md:items-end">
      {/* Search */}
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700">Search</label>
        <Input
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onFilterChange?.();
          }}
          className="mt-1"
        />
      </div>

      {/* Status Filter */}
      <div className="w-full md:w-40">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value as "all" | "draft" | "sent" | "scheduled" | "failed");
          onFilterChange?.();
        }}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority Filter */}
      <div className="w-full md:w-40">
        <label className="text-sm font-medium text-gray-700">Priority</label>
        <Select value={priorityFilter} onValueChange={(value) => {
          setPriorityFilter(value as "all" | "low" | "medium" | "high" | "urgent");
          onFilterChange?.();
        }}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetFilters}
          className="w-full md:w-auto"
        >
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
}
