// src/app/dashboard/super-admin/_hooks/useAdminApi.ts

import { useCallback } from "react";
import { Admin, Hostel, AdminFormData, AdminListAPIResponse } from "@/types/admin";
import { useAdminStore } from "@/stores/useAdminStore";
import { toast } from "sonner";

// Mock hostels data for development
const generateMockHostels = (): Hostel[] => [
  { id: "hostel_001", name: "Sunrise Hostel", location: "North Campus", capacity: 200, hasAdmin: true },
  { id: "hostel_002", name: "Moonlight Hostel", location: "South Campus", capacity: 150, hasAdmin: false },
  { id: "hostel_003", name: "Hilltop Hostel", location: "East Campus", capacity: 180, hasAdmin: false },
  { id: "hostel_004", name: "Valley View Hostel", location: "West Campus", capacity: 220, hasAdmin: true },
  { id: "hostel_005", name: "Riverside Hostel", location: "Central Campus", capacity: 160, hasAdmin: false },
  { id: "hostel_006", name: "Garden Hostel", location: "North Campus", capacity: 140, hasAdmin: false },
];

// Mock admins data for development
const generateMockAdmins = (): Admin[] => [
  {
    id: "admin_001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@hostella.com",
    phone: "+1234567890",
    role: "hostel-admin",
    status: "active",
    assignedHostelId: "hostel_001",
    assignedHostelName: "Sunrise Hostel",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "admin_002",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@hostella.com",
    phone: "+1987654321",
    role: "hostel-admin",
    status: "active",
    assignedHostelId: "hostel_004",
    assignedHostelName: "Valley View Hostel",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export function useAdminApi() {
  const {
    setLoading,
    setError,
    setSuccess,
    addAdmin,
    setAdmins,
    updateAdmin,
    removeAdmin,
    setTotalAdmins,
    setHostels,
    updateHostelAdminStatus,
  } = useAdminStore();

  // Fetch all hostels
  const fetchHostels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const storedHostels = localStorage.getItem("admin_hostels");
      const hostels: Hostel[] = storedHostels ? JSON.parse(storedHostels) : generateMockHostels();

      // Sync hasAdmin status with current admin assignments
      const storedAdmins = localStorage.getItem("admin_users");
      const admins: Admin[] = storedAdmins ? JSON.parse(storedAdmins) : [];
      
      const assignedHostelIds = new Set(
        admins.filter((a) => a.assignedHostelId).map((a) => a.assignedHostelId)
      );
      
      const updatedHostels = hostels.map((h) => ({
        ...h,
        hasAdmin: assignedHostelIds.has(h.id),
      }));

      localStorage.setItem("admin_hostels", JSON.stringify(updatedHostels));
      setHostels(updatedHostels);
      return updatedHostels;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch hostels";
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setHostels]);

  // Fetch all admins with filtering and pagination
  const fetchAdmins = useCallback(
    async (page = 1, pageSize = 10, search = "", roleFilter = "all", statusFilter = "all") => {
      setLoading(true);
      setError(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const storedAdmins = localStorage.getItem("admin_users");
        const allAdmins: Admin[] = storedAdmins ? JSON.parse(storedAdmins) : generateMockAdmins();

        // Apply filters
        let filtered = allAdmins.filter((admin) => {
          if (search) {
            const searchLower = search.toLowerCase();
            const fullName = `${admin.firstName} ${admin.lastName}`.toLowerCase();
            if (
              !fullName.includes(searchLower) &&
              !admin.email.toLowerCase().includes(searchLower) &&
              !admin.phone.includes(search)
            ) {
              return false;
            }
          }
          if (roleFilter !== "all" && admin.role !== roleFilter) {
            return false;
          }
          if (statusFilter !== "all" && admin.status !== statusFilter) {
            return false;
          }
          return true;
        });

        // Sort by created date (newest first)
        filtered = filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Paginate
        const startIndex = (page - 1) * pageSize;
        const paginatedAdmins = filtered.slice(startIndex, startIndex + pageSize);

        setAdmins(paginatedAdmins);
        setTotalAdmins(filtered.length);
        setError(null);

        return {
          admins: paginatedAdmins,
          total: filtered.length,
          page,
          pageSize,
        } as AdminListAPIResponse;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch admins";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setAdmins, setTotalAdmins]
  );

  // Create a new admin
  const createAdmin = useCallback(
    async (data: AdminFormData) => {
      setLoading(true);
      setError(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get existing data
        const storedAdmins = localStorage.getItem("admin_users");
        const allAdmins: Admin[] = storedAdmins ? JSON.parse(storedAdmins) : [];
        
        const storedHostels = localStorage.getItem("admin_hostels");
        const allHostels: Hostel[] = storedHostels ? JSON.parse(storedHostels) : [];

        // Validate email uniqueness
        const emailExists = allAdmins.some(
          (admin) => admin.email.toLowerCase() === data.email.toLowerCase()
        );
        if (emailExists) {
          throw new Error("An admin with this email already exists");
        }

        // Validate hostel assignment (one-to-one mapping)
        if (data.assignedHostelId) {
          const hostelAlreadyAssigned = allAdmins.some(
            (admin) => admin.assignedHostelId === data.assignedHostelId
          );
          if (hostelAlreadyAssigned) {
            const hostel = allHostels.find((h) => h.id === data.assignedHostelId);
            throw new Error(
              `Hostel "${hostel?.name || "selected"}" already has an admin assigned. Please choose a different hostel.`
            );
          }
        }

        // Create new admin
        const hostel = allHostels.find((h) => h.id === data.assignedHostelId);
        const newAdmin: Admin = {
          id: `admin_${Date.now()}`,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          role: data.role,
          status: "active",
          assignedHostelId: data.assignedHostelId || null,
          assignedHostelName: hostel?.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        allAdmins.unshift(newAdmin);
        localStorage.setItem("admin_users", JSON.stringify(allAdmins));

        // Update hostel hasAdmin status
        if (data.assignedHostelId) {
          const updatedHostels = allHostels.map((h) =>
            h.id === data.assignedHostelId ? { ...h, hasAdmin: true } : h
          );
          localStorage.setItem("admin_hostels", JSON.stringify(updatedHostels));
          updateHostelAdminStatus(data.assignedHostelId, true);
        }

        addAdmin(newAdmin);
        setSuccess("Admin created successfully!");
        toast.success(`Admin ${newAdmin.firstName} ${newAdmin.lastName} created successfully`);
        return newAdmin;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create admin";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setSuccess, addAdmin, updateHostelAdminStatus]
  );

  // Update an existing admin
  const updateAdminData = useCallback(
    async (adminId: string, data: Partial<AdminFormData> & { status?: Admin["status"] }) => {
      setLoading(true);
      setError(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const storedAdmins = localStorage.getItem("admin_users");
        const allAdmins: Admin[] = storedAdmins ? JSON.parse(storedAdmins) : [];
        
        const storedHostels = localStorage.getItem("admin_hostels");
        const allHostels: Hostel[] = storedHostels ? JSON.parse(storedHostels) : [];

        const adminIndex = allAdmins.findIndex((a) => a.id === adminId);
        if (adminIndex === -1) {
          throw new Error("Admin not found");
        }

        const currentAdmin = allAdmins[adminIndex];

        // Validate email uniqueness (excluding current admin)
        if (data.email && data.email !== currentAdmin.email) {
          const emailExists = allAdmins.some(
            (admin) => admin.id !== adminId && admin.email.toLowerCase() === (data.email || "").toLowerCase()
          );
          if (emailExists) {
            throw new Error("An admin with this email already exists");
          }
        }

        // Validate hostel assignment change
        if (data.assignedHostelId && data.assignedHostelId !== currentAdmin.assignedHostelId) {
          const hostelAlreadyAssigned = allAdmins.some(
            (admin) => admin.id !== adminId && admin.assignedHostelId === data.assignedHostelId
          );
          if (hostelAlreadyAssigned) {
            const hostel = allHostels.find((h) => h.id === data.assignedHostelId);
            throw new Error(
              `Hostel "${hostel?.name || "selected"}" already has an admin assigned. Please choose a different hostel.`
            );
          }
        }

        const oldHostelId = currentAdmin.assignedHostelId;
        const newHostelId = data.assignedHostelId || currentAdmin.assignedHostelId;
        const hostel = allHostels.find((h) => h.id === newHostelId);

        const updatedAdmin: Admin = {
          ...currentAdmin,
          ...data,
          assignedHostelId: newHostelId || null,
          assignedHostelName: hostel?.name,
          updatedAt: new Date().toISOString(),
        };

        allAdmins[adminIndex] = updatedAdmin;
        localStorage.setItem("admin_users", JSON.stringify(allAdmins));

        // Update hostel hasAdmin status
        if (oldHostelId !== newHostelId) {
          const updatedHostels = allHostels.map((h) => {
            if (h.id === oldHostelId) return { ...h, hasAdmin: false };
            if (h.id === newHostelId) return { ...h, hasAdmin: true };
            return h;
          });
          localStorage.setItem("admin_hostels", JSON.stringify(updatedHostels));
          
          if (oldHostelId) updateHostelAdminStatus(oldHostelId, false);
          if (newHostelId) updateHostelAdminStatus(newHostelId, true);
        }

        updateAdmin(updatedAdmin);
        setSuccess("Admin updated successfully!");
        toast.success(`Admin ${updatedAdmin.firstName} ${updatedAdmin.lastName} updated successfully`);
        return updatedAdmin;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update admin";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setSuccess, updateAdmin, updateHostelAdminStatus]
  );

  // Delete an admin
  const deleteAdmin = useCallback(
    async (adminId: string) => {
      setLoading(true);
      setError(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const storedAdmins = localStorage.getItem("admin_users");
        const allAdmins: Admin[] = storedAdmins ? JSON.parse(storedAdmins) : [];
        
        const storedHostels = localStorage.getItem("admin_hostels");
        const allHostels: Hostel[] = storedHostels ? JSON.parse(storedHostels) : [];

        const admin = allAdmins.find((a) => a.id === adminId);
        if (!admin) {
          throw new Error("Admin not found");
        }

        const filteredAdmins = allAdmins.filter((a) => a.id !== adminId);
        localStorage.setItem("admin_users", JSON.stringify(filteredAdmins));

        // Free up the hostel
        if (admin.assignedHostelId) {
          const updatedHostels = allHostels.map((h) =>
            h.id === admin.assignedHostelId ? { ...h, hasAdmin: false } : h
          );
          localStorage.setItem("admin_hostels", JSON.stringify(updatedHostels));
          updateHostelAdminStatus(admin.assignedHostelId, false);
        }

        removeAdmin(adminId);
        setSuccess("Admin deleted successfully!");
        toast.success(`Admin ${admin.firstName} ${admin.lastName} deleted successfully`);
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete admin";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setSuccess, removeAdmin, updateHostelAdminStatus]
  );

  return {
    fetchHostels,
    fetchAdmins,
    createAdmin,
    updateAdminData,
    deleteAdmin,
  };
}
