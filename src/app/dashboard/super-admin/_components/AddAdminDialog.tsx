// src/app/dashboard/super-admin/_components/AddAdminDialog.tsx

"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminStore } from "@/stores/useAdminStore";
import { adminFormSchema, AdminFormData } from "../_validations/adminSchema";
import { useAdminApi } from "../_hooks/useAdminApi";
import { Loader2, AlertCircle } from "lucide-react";
import { useEffect } from "react";

interface AddAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddAdminDialog({ isOpen, onClose }: AddAdminDialogProps) {
  const { loading, error, hostels } = useAdminStore();
  const { createAdmin, fetchHostels } = useAdminApi();

  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "hostel-admin",
      assignedHostelId: "",
    },
  });

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = form;
  const selectedRole = watch("role");
  const selectedHostelId = watch("assignedHostelId");

  // Fetch hostels when dialog opens
  useEffect(() => {
    if (isOpen) {
      void fetchHostels();
    }
  }, [isOpen, fetchHostels]);

  const handleDialogClose = () => {
    reset();
    onClose();
  };

  const onSubmit: SubmitHandler<AdminFormData> = async (data) => {
    const result = await createAdmin(data);
    if (result) {
      handleDialogClose();
    }
  };

  // Filter available hostels (those without admins)
  const availableHostels = hostels.filter((h) => !h.hasAdmin);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDialogClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Admin</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => { void handleSubmit(onSubmit)(e); }} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="e.g., John"
                {...register("firstName")}
                disabled={loading}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="e.g., Doe"
                {...register("lastName")}
                disabled={loading}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@hostella.com"
                {...register("email")}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                {...register("phone")}
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Admin Role *</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => {
                setValue("role", value as "super-admin" | "hostel-admin");
              }}
              disabled={loading}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select admin role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super-admin">Super Admin - Full System Access</SelectItem>
                <SelectItem value="hostel-admin">Hostel Admin - Hostel Management</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
            <p className="text-xs text-gray-500">
              {selectedRole === "super-admin"
                ? "Super admins have access to all system features including user management"
                : "Hostel admins manage a specific hostel including bookings and members"}
            </p>
          </div>

          {/* Hostel Assignment */}
          <div className="space-y-2">
            <Label htmlFor="assignedHostelId">
              Assign Hostel * {selectedRole === "hostel-admin" && <span className="text-red-500">(Required)</span>}
            </Label>
            <Select
              value={selectedHostelId}
              onValueChange={(value) => {
                setValue("assignedHostelId", value);
              }}
              disabled={loading || availableHostels.length === 0}
            >
              <SelectTrigger id="assignedHostelId">
                <SelectValue placeholder={
                  availableHostels.length === 0
                    ? "No hostels available"
                    : "Select a hostel"
                } />
              </SelectTrigger>
              <SelectContent>
                {availableHostels.map((hostel) => (
                  <SelectItem key={hostel.id} value={hostel.id}>
                    {hostel.name} - {hostel.location} (Capacity: {hostel.capacity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assignedHostelId && (
              <p className="text-sm text-red-500">{errors.assignedHostelId.message}</p>
            )}
            {availableHostels.length === 0 ? (
              <p className="text-xs text-red-500">
                ⚠️ All hostels already have admins assigned. Please remove an existing admin to assign a new one.
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                ℹ️ Each hostel can only have one admin. {availableHostels.length} hostel(s) available for assignment.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleDialogClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading || availableHostels.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Admin"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
