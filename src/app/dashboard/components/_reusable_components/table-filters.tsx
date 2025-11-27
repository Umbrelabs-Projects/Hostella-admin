"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import React from "react";

interface TableFiltersProps {
  search: string;
  onSearch: (v: string) => void;
  status?: string;
  onStatus?: (v: string) => void;
  statusOptions?: string[];
  gender?: string;
  onGender?: (v: string) => void;
  genderOptions?: string[];
  room?: string;
  onRoom?: (v: string) => void;
  roomOptions?: string[];
  onReset: () => void;
}

export default function TableFilters({
  search,
  onSearch,
  status,
  onStatus,
  statusOptions = [],
  gender,
  onGender,
  genderOptions = [],
  room,
  onRoom,
  roomOptions = [],
  onReset,
}: TableFiltersProps) {
  return (
    <div className="mb-3 flex flex-col md:flex-row md:items-center md:gap-3">
      <Input
        placeholder="Search name, booking ID, student ID or email"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="max-w-md"
      />

      {onStatus && (
        <Select onValueChange={(v) => onStatus(v)} value={status}>
          <SelectTrigger className="w-48">
            <SelectValue>{status === "all" ? "All statuses" : status}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {onGender && (
        <Select onValueChange={(v) => onGender(v)} value={gender}>
          <SelectTrigger className="w-40">
            <SelectValue>{gender === "all" ? "All genders" : gender}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All genders</SelectItem>
            {genderOptions.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {onRoom && (
        <Select onValueChange={(v) => onRoom(v)} value={room}>
          <SelectTrigger className="w-48">
            <SelectValue>{room === "all" ? "All rooms" : room}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All rooms</SelectItem>
            {roomOptions.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="ml-auto flex gap-2">
        <Button variant="ghost" onClick={onReset}>Reset</Button>
      </div>
    </div>
  );
}
