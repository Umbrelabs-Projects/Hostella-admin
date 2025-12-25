"use client";

import { useState, useEffect } from "react";

import DataTable from "../components/_reusable_components/data-table";
import { columns } from "../components/_reusable_components/columns";
import EditContactDialog from "../components/_reusable_components/edit-contact-dialog";
import DeleteConfirmDialog from "../components/_reusable_components/delete-confirm-dialog";
import { useMembersStore } from "@/stores/useMembersStore";
import { StudentBooking } from "@/types/booking";
import TableFilters from "../components/_reusable_components/table-filters";
import { TableSkeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function MembersPage() {
  const members = useMembersStore((s) => s.members);
  const loading = useMembersStore((s) => s.loading);
  const fetchMembers = useMembersStore((s) => s.fetchMembers);
  const unassignRoom = useMembersStore((s) => s.unassignRoom);
  const reassignRoom = useMembersStore((s) => s.reassignRoom);
  const deleteMember = useMembersStore((s) => s.deleteMember);
  
  const [viewingBooking, setViewingBooking] = useState<StudentBooking | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  // Filters
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");

  const resetFilters = () => {
    setSearch("");
    setGenderFilter("all");
    setRoomFilter("all");
  };

  // Fetch members from backend on component mount
  useEffect(() => {
    const loadMembers = async () => {
      await fetchMembers();
      setIsInitialized(true);
    };
    loadMembers();
  }, [fetchMembers]);

  // Members are tracked explicitly in the members store (after Complete Onboarding)
  // Ensure members is always an array
  const membersArray = Array.isArray(members) ? members : [];
  const genderOptions = Array.from(new Set(membersArray.map((b) => b.gender).filter(Boolean)));
  const roomOptions = Array.from(new Set(membersArray.map((b) => b.roomTitle).filter(Boolean)));

  const filteredMembers = membersArray.filter((b) => {
    if (genderFilter !== "all" && b.gender !== genderFilter) return false;
    if (roomFilter !== "all" && b.roomTitle !== roomFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    const fullName = `${b.firstName} ${b.lastName}`.toLowerCase();
    return (
      fullName.includes(s) ||
      (b.bookingId || "").toLowerCase().includes(s) ||
      (b.studentId || "").toLowerCase().includes(s) ||
      (b.email || "").toLowerCase().includes(s)
    );
  });

  const handleUnassignRoom = async (id: string): Promise<void> => {
    setLoadingActions(prev => ({ ...prev, [`unassign-${id}`]: true }));
    try {
      const updated = await unassignRoom(id);
      toast.success("Room unassigned successfully");
      // Update viewing booking if it's the same member
      if (viewingBooking?.id === id && updated) {
        setViewingBooking(updated);
      }
      await fetchMembers(); // Refresh the list
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to unassign room", { duration: 4000 });
      throw err;
    } finally {
      setLoadingActions(prev => ({ ...prev, [`unassign-${id}`]: false }));
    }
  };

  const handleReassignRoom = async (id: string, roomId?: string): Promise<StudentBooking | undefined> => {
    // If roomId is provided, perform the reassignment
    if (roomId) {
      setLoadingActions(prev => ({ ...prev, [`reassign-${id}`]: true }));
      try {
        const updated = await reassignRoom(id, roomId);
        toast.success("Room reassigned successfully");
        // Update viewing booking if it's the same member
        if (viewingBooking?.id === id && updated) {
          setViewingBooking(updated);
        }
        await fetchMembers(); // Refresh the list
        return updated;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to reassign room", { duration: 4000 });
        throw err;
      } finally {
        setLoadingActions(prev => ({ ...prev, [`reassign-${id}`]: false }));
      }
    }
    // No roomId means we need to open the dialog to select a room
    // This is handled by EditContactDialog opening its own AssignRoomDialog
    return undefined;
  };

  const handleDeleteMember = async (id: string) => {
    setLoadingActions(prev => ({ ...prev, [`delete-${id}`]: true }));
    try {
      await deleteMember(id);
      setDeletingMemberId(null);
      toast.success("Member deleted successfully");
      await fetchMembers(); // Refresh the list
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete member", { duration: 4000 });
    } finally {
      setLoadingActions(prev => ({ ...prev, [`delete-${id}`]: false }));
    }
  };


  return (
    <main className="p-3 md:px-6">
      <div className=" mx-auto">
        <TableFilters
          search={search}
          onSearch={setSearch}
          gender={genderFilter}
          onGender={setGenderFilter}
          genderOptions={genderOptions}
          room={roomFilter}
          onRoom={setRoomFilter}
          roomOptions={roomOptions}
          onReset={resetFilters}
        />

        {(loading && !isInitialized) && !membersArray.length ? (
          <TableSkeleton rows={8} />
        ) : (
          <DataTable 
            columns={columns({ 
              onView: setViewingBooking, 
              onDelete: (id) => setDeletingMemberId(id),
              showStatus: false, 
              showAssigned: true, 
              showFloor: true,
              isMember: true
            })} 
            data={filteredMembers} 
          />
        )}
      </div>

      {viewingBooking && (
        <EditContactDialog 
          booking={viewingBooking} 
          onOpenChange={(open) => !open && setViewingBooking(null)}
          onUnassignRoom={handleUnassignRoom}
          onReassignRoom={handleReassignRoom}
          loadingActions={loadingActions}
        />
      )}

      {deletingMemberId && (
        <DeleteConfirmDialog
          open={!!deletingMemberId}
          onOpenChange={(open) => !open && setDeletingMemberId(null)}
          onConfirm={() => {
            if (deletingMemberId) {
              handleDeleteMember(deletingMemberId);
            }
          }}
          loading={loadingActions[`delete-${deletingMemberId}`] || false}
          title="Delete Member"
          description="Are you sure you want to delete this member? This will also unassign their room if one is assigned. This action cannot be undone."
        />
      )}
    </main>
  );
}
