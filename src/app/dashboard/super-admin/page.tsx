// src/app/dashboard/super-admin/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminStore } from "@/stores/useAdminStore";
import { useAdminApi } from "./_hooks/useAdminApi";
import AdminHeader from "./_components/AdminHeader";
import AdminFilters from "./_components/AdminFilters";
import AdminTable from "./_components/AdminTable";
import AddAdminDialog from "./_components/AddAdminDialog";
import EditAdminDialog from "./_components/EditAdminDialog";
import DeleteAdminDialog from "./_components/DeleteAdminDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Admin } from "@/types/admin";

export default function SuperAdminPage() {
  const {
    admins,
    isAddDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    openAddDialog,
    closeAddDialog,
    closeEditDialog,
    closeDeleteDialog,
    openEditDialog,
    openDeleteDialog,
    loading,
    error,
    searchQuery,
    roleFilter,
    statusFilter,
    currentPage,
    pageSize,
    totalAdmins,
    setCurrentPage,
  } = useAdminStore();

  const { fetchAdmins, fetchHostels } = useAdminApi();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch admins and hostels on component mount and when filters change
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchAdmins(currentPage, pageSize, searchQuery, roleFilter, statusFilter),
        fetchHostels(),
      ]);
      setIsInitialized(true);
    };

    void loadData();
  }, [currentPage, pageSize, searchQuery, roleFilter, statusFilter, fetchAdmins, fetchHostels]);

  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleRefresh = useCallback(async () => {
    await fetchAdmins(currentPage, pageSize, searchQuery, roleFilter, statusFilter);
  }, [currentPage, pageSize, searchQuery, roleFilter, statusFilter, fetchAdmins]);

  const handleEditAdmin = (admin: Admin) => {
    openEditDialog(admin);
  };

  const handleDeleteAdmin = (admin: Admin) => {
    openDeleteDialog(admin);
  };

  const totalPages = Math.ceil(totalAdmins / pageSize);

  return (
    <div className="p-3 md:px-6 space-y-6">
      {/* Header */}
      <AdminHeader onAddClick={openAddDialog} />

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <AdminFilters onFilterChange={handleFilterChange} />

      {/* Admin Table */}
      <AdminTable
        admins={admins}
        loading={loading && !isInitialized}
        onEdit={handleEditAdmin}
        onDelete={handleDeleteAdmin}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalAdmins)} of {totalAdmins} admins
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  disabled={loading}
                  className={
                    page === currentPage
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : ""
                  }
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AddAdminDialog isOpen={isAddDialogOpen} onClose={closeAddDialog} />
      <EditAdminDialog isOpen={isEditDialogOpen} onClose={closeEditDialog} />
      <DeleteAdminDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onSuccess={() => { void handleRefresh(); }}
      />
    </div>
  );
}
