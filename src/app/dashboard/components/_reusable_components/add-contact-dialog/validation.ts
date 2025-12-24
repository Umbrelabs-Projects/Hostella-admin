import { StudentBooking } from "@/types/booking";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateBookingForm(formData: Partial<StudentBooking>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!formData.hostelName?.trim()) {
    errors.push({ field: "hostelName", message: "Hostel is required" });
  }

  if (!formData.roomTitle?.trim()) {
    errors.push({ field: "roomTitle", message: "Room type is required" });
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

export function formatBookingForAPI(formData: Partial<StudentBooking>): Partial<StudentBooking> {
  // Ensure roomTitle is properly formatted
  const formatted: Partial<StudentBooking> = {
    ...formData,
    // Ensure roomTitle is one of the valid values
    roomTitle: formData.roomTitle === "One-in-one" || formData.roomTitle === "Two-in-one" 
      ? formData.roomTitle 
      : "One-in-one",
    // Ensure gender is lowercase (backend accepts both but lowercase is preferred)
    gender: formData.gender?.toLowerCase() as "male" | "female" | undefined,
    // Ensure status is set
    status: formData.status || "pending payment",
  };

  // Remove empty strings and convert to undefined for optional fields
  if (formatted.price === "") delete formatted.price;
  if (formatted.medicalCondition === "") delete formatted.medicalCondition;

  return formatted;
}

