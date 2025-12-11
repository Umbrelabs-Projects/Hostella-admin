"use client";

import { useEffect, useState } from "react";
import BookingsHeader from "./_components/BookingsHeader";
import BookingsFilters from "./_components/BookingsFilters";
import BookingsTable from "./_components/BookingsTable";
import BookingsDialogs from "./_components/BookingsDialogs";

import { useBookingsStore } from "@/stores/useBookingsStore";
import { useMembersStore } from "@/stores/useMembersStore";
import { toast } from "sonner";
import { StudentBooking } from "@/types/booking";
import { TableSkeleton, HeaderSkeleton, FilterBarSkeleton } from "@/components/ui/skeleton";

export default function Bookings() {
  const {
    bookings,
    loading,
    error,
    currentPage,
    pageSize,
    totalBookings,
    filters,
    fetchBookings,
    createBooking,
    approvePayment,
    assignRoom,
    completeOnboarding,
    deleteBooking: deleteBookingApi,
    setFilters,
    setCurrentPage,
    clearError,
  } = useBookingsStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewingBooking, setViewingBooking] = useState<StudentBooking | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch bookings on mount and when filters change
  useEffect(() => {
    const loadBookings = async () => {
      await fetchBookings(currentPage, pageSize);
      setIsInitialized(true);
    };

    loadBookings();
  }, [currentPage, pageSize, filters, fetchBookings]);

  const genderOptions = Array.from(new Set((bookings || []).map((b) => b.gender).filter(Boolean)));
  const roomOptions = Array.from(new Set((bookings || []).map((b) => b.roomTitle).filter(Boolean)));

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      gender: "all",
      roomType: "all",
    });
    setCurrentPage(1);
  };

  const handleAddBooking = async (input: Partial<StudentBooking>) => {
    try {
      const newBooking = await createBooking(input);
      setShowAddDialog(false);
      toast.success("Booking created successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create booking");
    }
  };

  const handleApprovePayment = async (id: string) => {
    try {
      const updated = await approvePayment(id);
      setViewingBooking(updated);
      toast.success("Payment approved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve payment");
    }
  };

  const handleAssignRoom = async (id: string, roomNumber: number) => {
    try {
      const updated = await assignRoom(id, roomNumber);
      setViewingBooking(updated);
      toast.success("Room assigned successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign room");
    }
  };

  const handleCompleteOnboarding = async (id: string) => {
    try {
      const b = bookings.find((x) => x.id === id);
      if (!b?.allocatedRoomNumber) {
        toast.error("Cannot complete onboarding without an assigned room");
        return;
      }

      await completeOnboarding(id);
      setViewingBooking(null);
      toast.success("Onboarding completed; booking moved to members");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete onboarding");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      // This might be a local update or API call depending on business logic
      // For now, treating as local state update
      const b = bookings.find((x) => x.id === id);
      if (b) {
        const updated: StudentBooking = { ...b, status: "approved" };
        setViewingBooking(updated);
        toast.success("Booking approved");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve booking");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await deleteBookingApi(id);
      const { removeMember } = useMembersStore.getState();
      removeMember(id);
      setDeletingBookingId(null);
      toast.success("Booking deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete booking");
    }
  };

  if (!isInitialized) {
    return (
      <main className="p-3 md:px-6">
        <div className="mx-auto">
          <HeaderSkeleton />
          <FilterBarSkeleton />
          <TableSkeleton rows={8} />
        </div>
      </main>
    );
  }

  return (
    <main className="p-3 md:px-6">
      <div className="mx-auto">
        <BookingsHeader onNew={() => setShowAddDialog(true)} />

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={clearError}
                className="text-sm font-medium text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <BookingsFilters
          search={filters.search}
          onSearch={(val) => setFilters({ search: val })}
          status={filters.status}
          onStatus={(val) => setFilters({ status: val })}
          statusOptions={["all", "pending payment", "pending approval", "approved"]}
          gender={filters.gender}
          onGender={(val) => setFilters({ gender: val })}
          genderOptions={genderOptions}
          room={filters.roomType}
          onRoom={(val) => setFilters({ roomType: val })}
          roomOptions={roomOptions}
          onReset={resetFilters}
        />

        {loading && !bookings.length ? (
          <TableSkeleton rows={8} />
        ) : (
          <BookingsTable
            bookings={bookings}
            search={filters.search}
            statusFilter={filters.status}
            genderFilter={filters.gender}
            roomFilter={filters.roomType}
            onView={setViewingBooking}
            onDelete={setDeletingBookingId}
            isLoading={loading}
          />
        )}

        {/* Pagination */}
        {totalBookings > pageSize && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalBookings)} of {totalBookings} bookings
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(Math.ceil(totalBookings / pageSize), currentPage + 1)
                  )
                }
                disabled={currentPage >= Math.ceil(totalBookings / pageSize)}
                className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <BookingsDialogs
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
        viewingBooking={viewingBooking}
        setViewingBooking={setViewingBooking}
        deletingBookingId={deletingBookingId}
        setDeletingBookingId={setDeletingBookingId}
        onAdd={handleAddBooking}
        onApprovePayment={handleApprovePayment}
        onAssignRoom={handleAssignRoom}
        onCompleteOnboarding={handleCompleteOnboarding}
        onApprove={handleApprove}
        onDeleteConfirm={handleDeleteBooking}
      />
    </main>
  );
}
