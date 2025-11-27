// src/lib/dummy-data.ts
import { StudentBooking } from "@/types/booking";

export const bookings: StudentBooking[] = [
  {
    id: "1",
    bookingId: "BK-1001",
    email: "jane.doe@example.com",
    firstName: "Jane",
    lastName: "Doe",
    gender: "female",
    level: "200",
    school: "KNUST",
    studentId: "KNUST12345",
    phone: "0244123456",
    admissionLetterName: "admission-jane.pdf",
    hostelName: "Maple Hostel",
    roomTitle: "One-in-one",
    price: "400",
    emergencyContactName: "John Doe",
    emergencyContactNumber: "0201234567",
    relation: "Father",
    hasMedicalCondition: false,
    status: "pending payment",
    date: "2025-11-10"
  },
  {
    id: "2",
    bookingId: "BK-1002",
    email: "paul.owusu@example.com",
    firstName: "Paul",
    lastName: "Owusu",
    gender: "male",
    level: "300",
    school: "KNUST",
    studentId: "KNUST9876",
    phone: "0244123499",
    admissionLetterName: "admission-paul.pdf",
    hostelName: "Oak Residence",
    roomTitle: "Two-in-two",
    price: "250",
    emergencyContactName: "Ama Owusu",
    emergencyContactNumber: "0244000000",
    relation: "Mother",
    hasMedicalCondition: true,
    medicalCondition: "Asthma",
    status: "pending approval",
    date: "2025-11-02"
  },
  // Example allocated member (approved)
  {
    id: "3",
    bookingId: "BK-1003",
    email: "alex.mensah@example.com",
    firstName: "Alex",
    lastName: "Mensah",
    gender: "male",
    level: "400",
    school: "KNUST",
    studentId: "KNUST54321",
    phone: "0244123000",
    admissionLetterName: "admission-alex.pdf",
    hostelName: "Maple Hostel",
    roomTitle: "Two-in-two",
    price: "300",
    emergencyContactName: "Nana Mensah",
    emergencyContactNumber: "0209988776",
    relation: "Mother",
    hasMedicalCondition: false,
    status: "approved",
    allocatedRoomNumber: 5,
    date: "2025-10-21"
  }
  ,
  // Pre-seeded member (completed onboarding)
  {
    id: "4",
    bookingId: "BK-1004",
    email: "maria.adebayo@example.com",
    firstName: "Maria",
    lastName: "Adebayo",
    gender: "female",
    level: "300",
    school: "KNUST",
    studentId: "KNUST77777",
    phone: "0244123111",
    admissionLetterName: "admission-maria.pdf",
    hostelName: "Oak Residence",
    roomTitle: "Two-in-two",
    price: "300",
    emergencyContactName: "Segun Adebayo",
    emergencyContactNumber: "0201111222",
    relation: "Brother",
    hasMedicalCondition: false,
    status: "approved",
    allocatedRoomNumber: 12,
    date: "2025-09-15"
  }
];

// explicit initial members (bookings that have completed onboarding)
export const initialMembers: StudentBooking[] = [
  // Maria Adebayo (BK-1004) is a completed member
  bookings.find((b) => b.bookingId === "BK-1004") as StudentBooking,
];
