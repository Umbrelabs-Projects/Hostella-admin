// Helper function to transform nested API response to flat StudentBooking structure
import { StudentBooking } from "@/types/booking";

// API response types
interface ApiUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  gender?: string;
  phone?: string;
  studentRefNumber?: string;
  level?: string;
  campus?: string;
  school?: string;
  programme?: string;
  avatar?: string;
  hasMedicalCondition?: boolean;
  hasHealthCondition?: boolean;
  medicalCondition?: string | null;
  healthCondition?: string | null;
  bloodType?: string;
  allergies?: string;
}

interface ApiHostel {
  id?: string;
  name?: string;
  location?: string;
  phoneNumber?: string;
  campus?: string;
}

interface ApiRoom {
  id?: string;
  roomNumber?: string | number;
  floorNumber?: number;
  capacity?: number;
  type?: string;
  status?: string;
}

interface ApiPayment {
  id?: string;
  status?: string;
  amount?: number;
  receiptUrl?: string;
  provider?: string;
  reference?: string;
}

interface ApiBookingResponse {
  id: string;
  bookingId?: string;
  status?: string;
  preferredRoomType?: string;
  totalAmount?: number | string;
  price?: string;
  createdAt?: string;
  date?: string;
  assignedAt?: string;
  reportingDate?: string;
  allocatedRoomNumber?: number | string | null;
  floorNumber?: number | null;
  user?: ApiUser;
  hostel?: ApiHostel;
  room?: ApiRoom | null;
  payment?: ApiPayment;
  // Legacy flat fields (for backward compatibility)
  firstName?: string;
  lastName?: string;
  email?: string;
  gender?: string;
  phone?: string;
  studentId?: string;
  studentRefNumber?: string;
  level?: string;
  school?: string;
  campus?: string;
  hostelName?: string;
  roomTitle?: string;
  avatar?: string;
  imageUrl?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  relation?: string;
  hasMedicalCondition?: boolean;
  medicalCondition?: string | null;
  hasHealthCondition?: boolean;
  healthCondition?: string | null;
  bloodType?: string;
  allergies?: string;
}

/**
 * Transform nested API booking response to flat StudentBooking structure
 * Handles both new nested format and legacy flat format
 */
export function transformBooking(apiBooking: ApiBookingResponse): StudentBooking {
  // Extract from nested user object or use flat fields (backward compatibility)
  const user = apiBooking.user || {};
  const hostel = apiBooking.hostel || {};
  const room = apiBooking.room;
  const payment = apiBooking.payment;

  // Map preferredRoomType to roomTitle
  const roomTitleMap: Record<string, string> = {
    SINGLE: "One-in-one",
    DOUBLE: "Two-in-one",
  };
  const roomTitle = apiBooking.roomTitle || 
    (apiBooking.preferredRoomType ? roomTitleMap[apiBooking.preferredRoomType] : undefined) ||
    (room?.type ? roomTitleMap[room.type] : undefined);

  // Extract room number and floor from room object or flat fields
  const allocatedRoomNumber = apiBooking.allocatedRoomNumber ?? 
    (room?.roomNumber ? (typeof room.roomNumber === "string" ? parseInt(room.roomNumber, 10) : room.roomNumber) : null);
  
  const floorNumber = apiBooking.floorNumber ?? room?.floorNumber ?? null;

  // Normalize gender (API may return uppercase, frontend expects lowercase)
  const normalizeGender = (gender?: string): "male" | "female" => {
    if (!gender) return "male";
    const normalized = gender.toLowerCase();
    return normalized === "female" ? "female" : "male";
  };

  // Build the flat StudentBooking structure
  const booking: StudentBooking = {
    id: apiBooking.id,
    bookingId: apiBooking.bookingId,
    email: user.email || apiBooking.email || "",
    firstName: user.firstName || apiBooking.firstName || "",
    lastName: user.lastName || apiBooking.lastName || "",
    gender: normalizeGender(user.gender || apiBooking.gender),
    level: (user.level || apiBooking.level || "100") as "100" | "200" | "300" | "400",
    school: user.school || user.campus || apiBooking.school || apiBooking.campus || "",
    studentId: user.studentRefNumber || apiBooking.studentId || apiBooking.studentRefNumber || "",
    phone: user.phone || apiBooking.phone || "",
    avatar: user.avatar || apiBooking.avatar || apiBooking.imageUrl,
    imageUrl: user.avatar || apiBooking.avatar || apiBooking.imageUrl, // Legacy support
    hostelName: hostel.name || apiBooking.hostelName || "",
    roomTitle: roomTitle as "One-in-one" | "Two-in-one" | undefined,
    price: apiBooking.price || String(apiBooking.totalAmount || ""),
    emergencyContactName: apiBooking.emergencyContactName || "",
    emergencyContactNumber: apiBooking.emergencyContactNumber || "",
    relation: apiBooking.relation || "",
    hasMedicalCondition: user.hasMedicalCondition || user.hasHealthCondition || apiBooking.hasMedicalCondition || apiBooking.hasHealthCondition || false,
    medicalCondition: user.medicalCondition || user.healthCondition || apiBooking.medicalCondition || apiBooking.healthCondition || undefined,
    status: (apiBooking.status || "pending payment") as StudentBooking["status"],
    allocatedRoomNumber: allocatedRoomNumber,
    floorNumber: floorNumber,
    date: apiBooking.date || apiBooking.createdAt,
  };

  // Add payment info if available (for internal use, not part of StudentBooking type)
  if (payment) {
    (booking as any).payment = {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      receiptUrl: payment.receiptUrl,
      provider: payment.provider,
      reference: payment.reference,
    };
  }

  return booking;
}

/**
 * Transform array of API bookings
 */
export function transformBookings(apiBookings: ApiBookingResponse[]): StudentBooking[] {
  return apiBookings.map(transformBooking);
}

