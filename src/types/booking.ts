// src/types/booking.ts
export type Gender = "male" | "female";
export type Level = "100" | "200" | "300" | "400";
export type RoomTitle = "One-in-one" | "Two-in-one";

// Backend uses uppercase with underscores, but we'll handle both formats
export type BookingStatus = 
  | "PENDING_PAYMENT" 
  | "PENDING_APPROVAL" 
  | "APPROVED" 
  | "ROOM_ALLOCATED" 
  | "COMPLETED" 
  | "CANCELLED" 
  | "REJECTED" 
  | "EXPIRED"
  // Legacy support (will be normalized)
  | "pending payment" 
  | "pending approval" 
  | "approved";

export interface StudentBooking {
  id: string; // internal id
  bookingId?: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  level: Level;
  school: string;
  studentId: string;
  phone: string; // 10-15 digits
  admissionLetterName?: string; // filename or display text
  avatar?: string; // profile image URL (from API)
  imageUrl?: string; // profile image URL (legacy support)
  hostelName: string;
  roomTitle: RoomTitle;
  price: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  relation: string;
  hasMedicalCondition: boolean;
  medicalCondition?: string;
  status: BookingStatus;
  allocatedRoomNumber?: number | null;
  date?: string; // ISO date string for booking/created date
}
