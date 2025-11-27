import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface AdminsHeaderProps {
  onAddClick: () => void;
  filterStatus?: string;
  onFilterChange?: (s: string) => void;
}

export function AdminsHeader({ onAddClick, filterStatus = "all", onFilterChange }: AdminsHeaderProps) {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Members</h1>
        <p className="mt-1 text-muted-foreground">View and manage students with allocated rooms</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={(v) => onFilterChange?.(v)}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending payment">Pending payment</SelectItem>
            <SelectItem value="pending approval">Pending approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onAddClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>
    </div>
  );
}
