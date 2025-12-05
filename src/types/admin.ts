// src/types/admin.ts

export type AdminRole = "super-admin" | "hostel-admin";
export type AdminStatus = "active" | "inactive" | "suspended";

export interface Hostel {
  id: string;
  name: string;
  location: string;
  capacity: number;
  hasAdmin: boolean; // Tracks if hostel already has an admin assigned
}

export interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: AdminRole;
  status: AdminStatus;
  assignedHostelId: string | null; // One-to-one mapping: one admin per hostel
  assignedHostelName?: string; // Denormalized for display
  createdAt: string; // ISO date string
  updatedAt: string;
  lastLogin?: string;
}

export interface AdminFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: AdminRole;
  assignedHostelId: string;
}

export interface AdminAPIResponse {
  success: boolean;
  message: string;
  data?: Admin;
}

export interface AdminListAPIResponse {
  success: boolean;
  admins: Admin[];
  total: number;
  page: number;
  pageSize: number;
}
