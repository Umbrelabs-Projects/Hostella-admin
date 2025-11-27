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

export default function AddContactDialog({
  open,
  onOpenChange,
  onAdd,
}: AddBookingDialogProps) {
  const [formData, setFormData] = useState<Partial<StudentBooking>>({
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(v) => setFormData((p) => ({ ...p, gender: v as StudentBooking["gender"] }))}
              >
                <SelectTrigger id="gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="level">Level</Label>
              <Select
                value={formData.level}
                onValueChange={(v) => setFormData((p) => ({ ...p, level: v as StudentBooking["level"] }))}
              >
                <SelectTrigger id="level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="300">300</SelectItem>
                  <SelectItem value="400">400</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Booking Date</Label>
              <Input id="date" name="date" type="date" onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="roomTitle">Room Type</Label>
              <Select
                value={formData.roomTitle}
                onValueChange={(v) => setFormData((p) => ({ ...p, roomTitle: v as StudentBooking["roomTitle"] }))}
              >
                <SelectTrigger id="roomTitle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="One-in-one">One-in-one</SelectItem>
                  <SelectItem value="Two-in-two">Two-in-two</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hostelName">Hostel</Label>
              <Input id="hostelName" name="hostelName" onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Emergency Contact</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input id="emergencyContactName" name="emergencyContactName" placeholder="Name" onChange={handleChange} />
              <Input id="emergencyContactNumber" name="emergencyContactNumber" placeholder="Phone" onChange={handleChange} />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Booking</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
