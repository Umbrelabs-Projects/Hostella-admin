import { StudentBooking } from "@/types/booking";
import { User, GraduationCap, Building2, Phone } from "lucide-react";
import { FormSection } from "./types";

export const FORM_SECTIONS: FormSection[] = [
  {
    title: "Personal Information",
    icon: User,
    color: "blue",
    columns: 2,
    fields: [
      { name: "firstName", label: "First Name", type: "text", placeholder: "Enter first name" },
      { name: "lastName", label: "Last Name", type: "text", placeholder: "Enter last name" },
      { name: "email", label: "Email Address", type: "text", placeholder: "student@example.com" },
      { name: "phone", label: "Phone Number", type: "text", placeholder: "0241234567" },
      { name: "studentId", label: "Student ID", type: "text", placeholder: "Enter student ID" },
      { 
        name: "school", 
        label: "School", 
        type: "select",
        selectOptions: [
          { value: "KNUST", label: "KNUST" },
          { value: "UG", label: "University of Ghana" },
          { value: "UCC", label: "University of Cape Coast" },
          { value: "UEW", label: "University of Education, Winneba" },
          { value: "UDS", label: "University for Development Studies" },
          { value: "UPSA", label: "University of Professional Studies" },
          { value: "GIMPA", label: "Ghana Institute of Management and Public Administration" },
        ],
        disabled: true,
      },
    ],
  },
  {
    title: "Academic Details",
    icon: GraduationCap,
    color: "purple",
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
    title: "Accommodation Details",
    icon: Building2,
    color: "purple",
    columns: 2,
    fields: [
      {
        name: "roomTitle",
        label: "Room Type",
        type: "select",
        selectOptions: [
          { value: "One-in-one", label: "One-in-one" },
          { value: "Two-in-one", label: "Two-in-one" },
        ],
      },
      { 
        name: "hostelName", 
        label: "Hostel", 
        type: "select",
        selectOptions: [], // Will be populated from user's assignedHostels
      },
    ],
  },
  {
    title: "Emergency Contact",
    icon: Phone,
    color: "amber",
    columns: 3,
    fields: [
      { name: "emergencyContactName", label: "Contact Name", type: "text", placeholder: "Enter contact name" },
      { name: "emergencyContactNumber", label: "Contact Number", type: "text", placeholder: "0241234567" },
      { 
        name: "relation", 
        label: "Relation", 
        type: "select",
        selectOptions: [
          { value: "Father", label: "Father" },
          { value: "Mother", label: "Mother" },
          { value: "Guardian", label: "Guardian" },
          { value: "Sibling", label: "Sibling" },
          { value: "Other", label: "Other" },
        ],
      },
    ],
  },
];

export const DEFAULT_FORM_DATA: Partial<StudentBooking> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "male",
  studentId: "",
  level: "100",
  school: "",
  hostelName: "",
  roomTitle: "One-in-one",
  price: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  relation: "",
  hasMedicalCondition: false,
  status: "pending payment",
  date: new Date().toISOString().split("T")[0],
};

