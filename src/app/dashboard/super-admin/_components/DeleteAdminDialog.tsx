// src/app/dashboard/super-admin/_components/DeleteAdminDialog.tsx

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/stores/useAdminStore";
import { useAdminApi } from "../_hooks/useAdminApi";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteAdminDialog({ isOpen, onClose, onSuccess }: DeleteAdminDialogProps) {
  const { loading, selectedAdmin } = useAdminStore();
  const { deleteAdmin } = useAdminApi();

  const handleDelete = async () => {
    if (!selectedAdmin) return;

    const success = await deleteAdmin(selectedAdmin.id);
    if (success) {
      onClose();
      onSuccess?.();
    }
  };

  if (!selectedAdmin) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete Admin</DialogTitle>
              <DialogDescription className="mt-1">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the admin account for{" "}
            <span className="font-semibold text-gray-900">
              {selectedAdmin.firstName} {selectedAdmin.lastName}
            </span>
            ?
          </p>

          {selectedAdmin.assignedHostelName && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> This admin is currently assigned to{" "}
                <span className="font-semibold">{selectedAdmin.assignedHostelName}</span>.
                Deleting this account will free up the hostel for reassignment.
              </p>
            </div>
          )}

          <div className="rounded-lg bg-gray-50 p-3 space-y-1">
            <p className="text-sm font-medium text-gray-700">Admin Details:</p>
            <p className="text-sm text-gray-600">Email: {selectedAdmin.email}</p>
            <p className="text-sm text-gray-600">Phone: {selectedAdmin.phone}</p>
            <p className="text-sm text-gray-600">
              Role: {selectedAdmin.role === "super-admin" ? "Super Admin" : "Hostel Admin"}
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => { void handleDelete(); }}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Admin"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
