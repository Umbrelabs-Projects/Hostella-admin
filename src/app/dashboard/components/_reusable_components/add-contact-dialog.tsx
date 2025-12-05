"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudentBooking } from "@/types/booking";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (booking: Partial<StudentBooking>) => void;
}

interface FieldConfig {
  name: keyof StudentBooking;
  label: string;
  type?: "text" | "date" | "select";
  placeholder?: string;
  selectOptions?: { value: string; label: string }[];
}

const FORM_SECTIONS: { title?: string; columns: number; fields: FieldConfig[] }[] = [
  {
    columns: 2,
    fields: [
      { name: "firstName", label: "First name", type: "text" },
      { name: "lastName", label: "Last name", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "studentId", label: "Student ID", type: "text" },
      { name: "school", label: "School", type: "text" },
    ],
  },
  {
    columns: 3,
    fields: [
      {
        name: "gender",
        label: "Gender",
        type: "select",
        selectOptions: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
        ],
      },
      {
        name: "level",
        label: "Level",
        type: "select",
        selectOptions: [
          { value: "100", label: "100" },
          { value: "200", label: "200" },
          { value: "300", label: "300" },
          { value: "400", label: "400" },
        ],
      },
      { name: "date", label: "Booking Date", type: "date" },
    ],
  },
  {
    columns: 2,
    fields: [
      {
        name: "roomTitle",
        label: "Room Type",
        type: "select",
        selectOptions: [
          { value: "One-in-one", label: "One-in-one" },
          { value: "Two-in-two", label: "Two-in-two" },
        ],
      },
      { name: "hostelName", label: "Hostel", type: "text" },
    ],
  },
  {
    columns: 2,
    fields: [
      { name: "emergencyContactName", label: "Emergency Contact Name", type: "text", placeholder: "Name" },
      { name: "emergencyContactNumber", label: "Emergency Contact Number", type: "text", placeholder: "Phone" },
    ],
  },
];

const DEFAULT_FORM_DATA: Partial<StudentBooking> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "male",
  studentId: "",
  level: "100",
  school: "",
  hostelName: "",
  roomTitle: "Two-in-two",
  price: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  relation: "",
  hasMedicalCondition: false,
  status: "pending payment",
  date: new Date().toISOString().split("T")[0],
};

interface FormFieldProps {
  field: FieldConfig;
  value: string | undefined;
  onChange: (name: keyof StudentBooking, value: string) => void;
}

function FormField({ field, value, onChange }: FormFieldProps) {
  if (field.type === "select") {
    return (
      <div>
        <Label className="mb-2" htmlFor={field.name}>{field.label}</Label>
        <Select value={value || ""} onValueChange={(v) => onChange(field.name, v)}>
          <SelectTrigger id={field.name}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.selectOptions?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor={field.name}>{field.label}</Label>
      <Input
        id={field.name}
        name={field.name}
        type={field.type || "text"}
        placeholder={field.placeholder}
        value={value || ""}
        onChange={(e) => onChange(field.name, e.target.value)}
      />
    </div>
  );
}

export default function AddContactDialog({
  open,
  onOpenChange,
  onAdd,
}: AddBookingDialogProps) {
  const [formData, setFormData] = useState<Partial<StudentBooking>>(DEFAULT_FORM_DATA);

  const handleFieldChange = (name: keyof StudentBooking, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Booking</DialogTitle>
          <DialogDescription>Enter student booking details.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAdd(formData);
            onOpenChange(false);
          }}
          className="space-y-4"
        >
          {FORM_SECTIONS.map((section, idx) => (
            <div key={idx} className={`grid grid-cols-${section.columns} gap-4`}>
              {section.fields.map((field) => (
                <FormField
                  key={field.name}
                  field={field}
                  value={String(formData[field.name] || "")}
                  onChange={handleFieldChange}
                />
              ))}
            </div>
          ))}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Booking</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

