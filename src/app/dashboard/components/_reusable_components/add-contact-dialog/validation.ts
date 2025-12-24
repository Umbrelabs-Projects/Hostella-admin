import { StudentBooking } from "@/types/booking";
import { isValidRoomTypeDisplay, convertRoomTypeToAPI } from "./roomTypeConverter";

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Interface for API request (different from StudentBooking)
 * Backend expects preferredRoomType: "SINGLE" | "DOUBLE" (not roomTitle)
 */
export interface BookingCreateRequest {
  hostelName: string;
  preferredRoomType: "SINGLE" | "DOUBLE";
  email: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  level: string;
  school: string;
  studentId: string;
  phone: string;
  price?: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  relation: string;
  hasMedicalCondition?: boolean;
  medicalCondition?: string;
  status?: string;
  date?: string;
}

export function validateBookingForm(formData: Partial<StudentBooking>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!formData.hostelName?.trim()) {
    errors.push({ field: "hostelName", message: "Hostel is required" });
  }

  if (!formData.roomTitle?.trim()) {
    errors.push({ field: "roomTitle", message: "Room type is required" });
  } else {
    const roomTitle = formData.roomTitle.trim();
    if (!isValidRoomTypeDisplay(roomTitle)) {
      errors.push({ field: "roomTitle", message: "Room type must be 'One-in-one' or 'Two-in-one'" });
    }
  }

  if (!formData.email?.trim()) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push({ field: "email", message: "Please enter a valid email address" });
  }

  if (!formData.firstName?.trim()) {
    errors.push({ field: "firstName", message: "First name is required" });
  }

  if (!formData.lastName?.trim()) {
    errors.push({ field: "lastName", message: "Last name is required" });
  }

  if (!formData.gender) {
    errors.push({ field: "gender", message: "Gender is required" });
  }

  if (!formData.level) {
    errors.push({ field: "level", message: "Level is required" });
  }

  if (!formData.school?.trim()) {
    errors.push({ field: "school", message: "School is required" });
  }

  if (!formData.studentId?.trim()) {
    errors.push({ field: "studentId", message: "Student ID is required" });
  }

  if (!formData.phone?.trim()) {
    errors.push({ field: "phone", message: "Phone number is required" });
  }

  if (!formData.emergencyContactName?.trim()) {
    errors.push({ field: "emergencyContactName", message: "Emergency contact name is required" });
  }

  if (!formData.emergencyContactNumber?.trim()) {
    errors.push({ field: "emergencyContactNumber", message: "Emergency contact number is required" });
  }

  if (!formData.relation?.trim()) {
    errors.push({ field: "relation", message: "Relation to student is required" });
  }

  return errors;
}

export function formatBookingForAPI(formData: Partial<StudentBooking>): BookingCreateRequest {
  // Convert UI display name to API format
  // Backend requires preferredRoomType: "SINGLE" | "DOUBLE" (not roomTitle)
  let preferredRoomType: "SINGLE" | "DOUBLE" = "SINGLE";
  
  if (formData.roomTitle) {
    const normalized = formData.roomTitle.trim();
    if (isValidRoomTypeDisplay(normalized)) {
      preferredRoomType = convertRoomTypeToAPI(normalized);
    }
  }

  // Ensure gender is lowercase (backend accepts both but lowercase is preferred)
  const gender = formData.gender?.toLowerCase().trim() as "male" | "female" | "other" | undefined;

  // Build formatted object for API request
  // Note: Backend expects preferredRoomType, not roomTitle
  const formatted: BookingCreateRequest = {
    hostelName: formData.hostelName?.trim() || "",
    preferredRoomType: preferredRoomType, // ✅ Converted to API format: "SINGLE" or "DOUBLE"
    email: formData.email?.trim() || "",
    firstName: formData.firstName?.trim() || "",
    lastName: formData.lastName?.trim() || "",
    gender: gender || "male",
    level: formData.level?.trim() || "",
    school: formData.school?.trim() || "",
    studentId: formData.studentId?.trim() || "",
    phone: formData.phone?.trim() || "",
    emergencyContactName: formData.emergencyContactName?.trim() || "",
    emergencyContactNumber: formData.emergencyContactNumber?.trim() || "",
    relation: formData.relation?.trim() || "",
    status: formData.status || "pending payment",
    hasMedicalCondition: formData.hasMedicalCondition || false,
  };

  // Add optional fields only if they have values
  if (formData.price && formData.price.trim() !== "") {
    formatted.price = formData.price.trim();
  }
  
  if (formData.date && formData.date.trim() !== "") {
    formatted.date = formData.date.trim();
  }
  
  if (formData.medicalCondition && formData.medicalCondition.trim() !== "") {
    formatted.medicalCondition = formData.medicalCondition.trim();
  }

  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    console.log("[formatBookingForAPI] Formatted booking data for API:", formatted);
    console.log("[formatBookingForAPI] Preferred room type:", formatted.preferredRoomType);
    console.log("[formatBookingForAPI] Original roomTitle (UI):", formData.roomTitle);
  }

  return formatted;
}

