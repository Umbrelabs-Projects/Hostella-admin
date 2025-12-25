"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BookingsHeader from "./_components/BookingsHeader";
import BookingsFilters from "./_components/BookingsFilters";
import BookingsTable from "./_components/BookingsTable";
import BookingsDialogs from "./_components/BookingsDialogs";

import { useBookingsStore } from "@/stores/useBookingsStore";
import { useMembersStore } from "@/stores/useMembersStore";
import { toast } from "sonner";
import { StudentBooking } from "@/types/booking";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function Bookings() {
  const router = useRouter();
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
    approveBooking,
    assignRoom,
    completeOnboarding,
    deleteBooking: deleteBookingApi,
    cancelBooking,
    removeStudentFromRoom,
    setFilters,
    setCurrentPage,
    clearError,
  } = useBookingsStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewingBooking, setViewingBooking] = useState<StudentBooking | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  // Fetch bookings on mount and when filters change
  useEffect(() => {
    const loadBookings = async () => {
      await fetchBookings(currentPage, pageSize);
      setIsInitialized(true);
    };
    loadBookings();
  }, [currentPage, pageSize, filters, fetchBookings]);

  // Ensure bookings is always an array
  const bookingsArray = Array.isArray(bookings) ? bookings : [];
  const genderOptions = Array.from(new Set(bookingsArray.map((b) => b.gender).filter(Boolean)));
  const roomOptions = Array.from(new Set(bookingsArray.map((b) => b.roomTitle).filter(Boolean)));

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
      const result = await createBooking(input);
      setShowAddDialog(false);
      
      // Show success message with student account creation info
      toast.success(
        "Booking created successfully! Student account has been created and login credentials have been sent via email.",
        { duration: 5000 }
      );
      
      return result;
    } catch (err) {
      // Handle validation errors
      if (err instanceof Error && err.message.includes("Validation")) {
        toast.error(err.message, { duration: 4000 });
      } else if (err instanceof Error && err.message) {
        // Check if it's an API error with detailed messages
        const errorMessage = err.message;
        if (errorMessage.includes("errors")) {
          toast.error("Please check all required fields are filled correctly", { duration: 4000 });
        } else {
          toast.error(errorMessage, { duration: 4000 });
        }
      } else {
        toast.error("Failed to create booking. Please try again.", { duration: 4000 });
      }
      throw err;
    }
  };

  const handleApprovePayment = async (id: string) => {
    setLoadingActions(prev => ({ ...prev, [`approvePayment-${id}`]: true }));
    try {
      const updated = await approvePayment(id);
      setViewingBooking(updated);
      toast.success("Payment approved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve payment", { duration: 4000 });
    } finally {
      setLoadingActions(prev => ({ ...prev, [`approvePayment-${id}`]: false }));
    }
  };

  const handleAssignRoom = async (id: string, roomId: string): Promise<StudentBooking> => {
    setLoadingActions(prev => ({ ...prev, [`assignRoom-${id}`]: true }));
    try {
      const updated = await assignRoom(id, roomId);
      setViewingBooking(null); // Close the dialog
      
      // Refresh members list to include the newly assigned member
      const { fetchMembers } = useMembersStore.getState();
      await fetchMembers();
      
      toast.success("Room assigned successfully. Student is now a member.");
      // Navigate to members page after room assignment
      router.push("/dashboard/members");
      return updated;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign room", { duration: 4000 });
      throw err;
    } finally {
      setLoadingActions(prev => ({ ...prev, [`assignRoom-${id}`]: false }));
    }
  };

  const handleCompleteOnboarding = async (id: string) => {
    setLoadingActions(prev => ({ ...prev, [`completeOnboarding-${id}`]: true }));
    try {
      const b = bookingsArray.find((x) => x.id === id);
      if (!b?.allocatedRoomNumber) {
        toast.error("Cannot complete onboarding without an assigned room", { duration: 4000 });
        return;
      }

      await completeOnboarding(id);
      setViewingBooking(null);
      toast.success("Onboarding completed; booking moved to members");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete onboarding", { duration: 4000 });
    } finally {
      setLoadingActions(prev => ({ ...prev, [`completeOnboarding-${id}`]: false }));
    }
  };

  const handleApprove = async (id: string) => {
    setLoadingActions(prev => ({ ...prev, [`approve-${id}`]: true }));
    try {
      const updated = await approveBooking(id);
      setViewingBooking(updated);
      toast.success("Booking approved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve booking", { duration: 4000 });
    } finally {
      setLoadingActions(prev => ({ ...prev, [`approve-${id}`]: false }));
    }
  };

  const handleDeleteBooking = async (id: string) => {
    setLoadingActions(prev => ({ ...prev, [`delete-${id}`]: true }));
    try {
      await deleteBookingApi(id);
      const { removeMember } = useMembersStore.getState();
      removeMember(id);
      setDeletingBookingId(null);
      toast.success("Booking deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete booking", { duration: 4000 });
    } finally {
      setLoadingActions(prev => ({ ...prev, [`delete-${id}`]: false }));
    }
  };

  const handleCancelBooking = async (id: string, reason?: string) => {
    setLoadingActions(prev => ({ ...prev, [`cancel-${id}`]: true }));
    try {
      await cancelBooking(id, reason);
      const { removeMember } = useMembersStore.getState();
      removeMember(id);
      setViewingBooking(null); // Close the dialog since booking is removed
      toast.success("Booking cancelled successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel booking", { duration: 4000 });
    } finally {
      setLoadingActions(prev => ({ ...prev, [`cancel-${id}`]: false }));
    }
  };

  const handleRemoveStudent = async (id: string) => {
    setLoadingActions(prev => ({ ...prev, [`removeStudent-${id}`]: true }));
    try {
      const updated = await removeStudentFromRoom(id);
      setViewingBooking(updated);
      toast.success("Student removed from room successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove student from room", { duration: 4000 });
    } finally {
      setLoadingActions(prev => ({ ...prev, [`removeStudent-${id}`]: false }));
    }
  };

  // Initial skeleton when loading without data
  // (kept, but no extra isInitialized gate to avoid act warnings in tests)

  return (
    <main className="p-3 md:px-6" data-testid="bookings-container">
      <div className="mx-auto">
        <h1 className="sr-only">Bookings</h1>
        <BookingsHeader onNew={() => setShowAddDialog(true)} />

        <BookingsFilters
          search={filters.search}
          onSearch={(val) => setFilters({ search: val })}
          status={filters.status}
          onStatus={(val) => setFilters({ status: val })}
          statusOptions={[
            "all", 
            "PENDING_PAYMENT", // Internal format (will be converted to "pending payment" for API)
            "PENDING_APPROVAL", 
            "APPROVED", 
            // ROOM_ALLOCATED removed - these students are now members and should only appear in members page
            "COMPLETED", 
            "CANCELLED", 
            "REJECTED", 
            "EXPIRED"
          ]}
          gender={filters.gender ?? "all"}
          onGender={(val) => setFilters({ gender: val })}
          genderOptions={genderOptions}
          room={filters.roomType ?? "all"}
          onRoom={(val) => setFilters({ roomType: val })}
          roomOptions={roomOptions}
          onReset={resetFilters}
        />

        {(loading && !isInitialized) && !bookingsArray.length ? (
          <TableSkeleton rows={8} />
        ) : (
          <BookingsTable
            bookings={bookingsArray}
            search={filters.search}
            statusFilter={filters.status}
            genderFilter={filters.gender ?? "all"}
            roomFilter={filters.roomType ?? "all"}
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
        onCancel={handleCancelBooking}
        onRemoveStudent={handleRemoveStudent}
        loadingActions={loadingActions}
      />
    </main>
  );
}
