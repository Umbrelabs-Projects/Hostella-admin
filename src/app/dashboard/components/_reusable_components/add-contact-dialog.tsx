"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StudentBooking } from "@/types/booking";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { AddBookingDialogProps } from "./add-contact-dialog/types";
import { FORM_SECTIONS, DEFAULT_FORM_DATA } from "./add-contact-dialog/constants";
import { validateBookingForm, formatBookingForAPI } from "./add-contact-dialog/validation";
import AddBookingDialogHeader from "./add-contact-dialog/AddBookingDialogHeader";
import FormSectionCard from "./add-contact-dialog/FormSectionCard";
import AddBookingDialogFooter from "./add-contact-dialog/AddBookingDialogFooter";

export default function AddContactDialog({
  open,
  onOpenChange,
  onAdd,
}: AddBookingDialogProps) {
  const user = useAuthStore((s) => s.user);
  const [formData, setFormData] = useState<Partial<StudentBooking>>(DEFAULT_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get assigned hostels from user profile
  const assignedHostels = user?.assignedHostels || [];
  
  // Create hostel options for dropdown (format: "Hostel Name - Campus")
  const hostelOptions = assignedHostels.map((hostel) => ({
    value: hostel.name,
    label: `${hostel.name} - ${hostel.campus}`,
  }));

  // Update form sections with dynamic hostel options
  const formSectionsWithHostels = FORM_SECTIONS.map((section) => ({
    ...section,
    fields: section.fields.map((field) => {
      if (field.name === "hostelName") {
        return {
          ...field,
          selectOptions: hostelOptions,
        };
      }
      return field;
    }),
  }));

  // Pre-fill school from user profile when dialog opens
  useEffect(() => {
    if (open && user) {
      setFormData((prev) => ({
        ...prev,
        // Pre-select first hostel if only one assigned, otherwise leave empty for user to select
        hostelName: assignedHostels.length === 1 ? assignedHostels[0].name : prev.hostelName || "",
        school: user.school || prev.school || "KNUST", // Default to KNUST if not provided
        // Ensure roomTitle is always set to a valid default
        roomTitle: prev.roomTitle || "One-in-one",
      }));
    } else if (!open) {
      // Reset form and loading state when dialog closes
      setFormData(DEFAULT_FORM_DATA);
      setIsSubmitting(false);
    }
  }, [open, user, assignedHostels]);

  const handleFieldChange = (name: keyof StudentBooking, value: string) => {
    // Prevent changing disabled fields
    const field = FORM_SECTIONS.flatMap(s => s.fields).find(f => f.name === name);
    if (field?.disabled) return;
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Prevent double submission
    if (isSubmitting) return;

    // Validate form
    const validationErrors = validateBookingForm(formData);
    if (validationErrors.length > 0) {
      // Show first error
      toast.error(validationErrors[0].message, { duration: 4000 });
      return;
    }

    setIsSubmitting(true);
    try {
      // Format data for API
      const formattedData = formatBookingForAPI(formData);
      
      // Call onAdd callback
      await onAdd(formattedData);
      
      // Success message will be shown by the parent component
      onOpenChange(false);
    } catch (error) {
      // Error handling is done by the parent component
      console.error("Error creating booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0">
        <AddBookingDialogHeader />

        {/* Scrollable Form Content */}
        <form
          id="add-booking-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex-1 overflow-y-auto min-h-0 p-6"
        >
          <div className="space-y-4">
            {formSectionsWithHostels.map((section, idx) => (
              <FormSectionCard
                key={idx}
                section={section}
                formData={formData}
                onFieldChange={handleFieldChange}
              />
            ))}
          </div>
        </form>

        <AddBookingDialogFooter
          onCancel={() => {
            if (!isSubmitting) {
              onOpenChange(false);
            }
          }}
          onCreate={handleSubmit}
          loading={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}

