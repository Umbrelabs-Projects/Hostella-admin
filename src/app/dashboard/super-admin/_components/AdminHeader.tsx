// src/app/dashboard/super-admin/_components/AdminHeader.tsx

"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, Shield } from "lucide-react";

interface AdminHeaderProps {
  onAddClick: () => void;
}

export default function AdminHeader({ onAddClick }: AdminHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-blue-600">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
          <p className="text-sm text-gray-600">Manage admin users and hostel assignments</p>
        </div>
      </div>
      <Button onClick={onAddClick} className="bg-blue-600 hover:bg-blue-700">
        <UserPlus className="mr-2 h-4 w-4" />
        Add New Admin
      </Button>
    </div>
  );
}
