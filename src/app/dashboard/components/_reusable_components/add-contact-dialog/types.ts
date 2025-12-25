import { StudentBooking } from "@/types/booking";
import { LucideIcon } from "lucide-react";
import { BookingCreateRequest } from "./validation";

export interface AddBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (booking: BookingCreateRequest | Partial<StudentBooking>) => void | Promise<void>;
}

export interface FieldConfig {
  name: keyof StudentBooking;
  label: string;
  type?: "text" | "date" | "select";
  placeholder?: string;
  selectOptions?: { value: string; label: string }[];
  disabled?: boolean;
}

export interface FormSection {
  title: string;
  icon: LucideIcon;
  columns: number;
  fields: FieldConfig[];
  color: "blue" | "purple" | "amber";
}

export interface FormFieldProps {
  field: FieldConfig;
  value: string | undefined;
  onChange: (name: keyof StudentBooking, value: string) => void;
}

export interface FormSectionCardProps {
  section: FormSection;
  formData: Partial<StudentBooking>;
  onFieldChange: (name: keyof StudentBooking, value: string) => void;
}

