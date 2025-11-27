import { create } from "zustand";
import { StudentBooking } from "@/types/booking";
import { bookings as initialBookings } from "@/lib/dummy-data";
export type BookingsState = {
  bookings: StudentBooking[];
  selectedBooking: StudentBooking | null;
  setBookings: (b: StudentBooking[]) => void;
  setSelectedBooking: (b: StudentBooking | null) => void;
  updateBooking: (u: StudentBooking) => void;
};
export const useBookingsStore = create<BookingsState>((set) => ({
  bookings: initialBookings,
  selectedBooking: null,
  setBookings: (b: StudentBooking[]) => set({ bookings: b }),
  setSelectedBooking: (b: StudentBooking | null) => set({ selectedBooking: b }),
  updateBooking: (u: StudentBooking) =>
    set((state) => ({ bookings: state.bookings.map((b) => (b.id === u.id ? u : b)), selectedBooking: u })),
}));
