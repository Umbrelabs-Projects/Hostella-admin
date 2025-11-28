import { create } from "zustand";
import { StudentBooking } from "@/types/booking";
import { initialMembers } from "@/lib/dummy-data";

export type MembersState = {
  members: StudentBooking[]; // explicit members (added on Complete Onboarding)
  filterStatus: string;
  selectedMember: StudentBooking | null;
  setMembers: (m: StudentBooking[]) => void;
  setFilterStatus: (s: string) => void;
  setSelectedMember: (m: StudentBooking | null) => void;
  updateMember: (u: StudentBooking) => void;
  addMember: (m: StudentBooking) => void;
  removeMember: (id: string) => void;
};

export const useMembersStore = create<MembersState>((set) => ({
  // start with explicit seed members from dummy-data (those who've completed onboarding)
  members: initialMembers || [],
  filterStatus: "all",
  selectedMember: null,
  setMembers: (m: StudentBooking[]) => set({ members: m }),
  setFilterStatus: (s: string) => set({ filterStatus: s }),
  setSelectedMember: (m: StudentBooking | null) => set({ selectedMember: m }),
  updateMember: (u: StudentBooking) =>
    set((state) => ({ members: state.members.map((m) => (m.id === u.id ? u : m)), selectedMember: u })),
  addMember: (m: StudentBooking) =>
    set((state) => ({ members: state.members.find((x) => x.id === m.id) ? state.members : [...state.members, m] })),
  removeMember: (id: string) => set((state) => ({ members: state.members.filter((m) => m.id !== id) })),
}));
