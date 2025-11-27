import { create } from "zustand";
import { StudentBooking } from "@/types/booking";
import { bookings as initialBookings } from "@/lib/dummy-data";

export type MembersState = {
  members: StudentBooking[]; // those with allocated rooms are considered 'members'
  filterStatus: string;
  selectedMember: StudentBooking | null;
  setMembers: (m: StudentBooking[]) => void;
  setFilterStatus: (s: string) => void;
  setSelectedMember: (m: StudentBooking | null) => void;
  updateMember: (u: StudentBooking) => void;
};

export const useMembersStore = create<MembersState>((set) => ({
  members: initialBookings.filter((b) => b.allocatedRoomNumber != null),
  filterStatus: "all",
  selectedMember: null,
  setMembers: (m: StudentBooking[]) => set({ members: m }),
  setFilterStatus: (s: string) => set({ filterStatus: s }),
  setSelectedMember: (m: StudentBooking | null) => set({ selectedMember: m }),
  updateMember: (u: StudentBooking) =>
    set((state) => ({ members: state.members.map((m) => (m.id === u.id ? u : m)), selectedMember: u })),
}));
