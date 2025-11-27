"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AddAdminDialog } from "./_components/add-member-dialog";
import { AdminsTable } from "./_components/members-table";

// Mock data - replace with real data fetching
const mockAdmins = [
  {
    id: "1",
    name: "Jane Cooper",
    email: "jad324h463",
    avatar: "JC",
    type: "Admin",
    phoneNumber: "05552731324",
    dateOfRegistration: "5/27/15",
  },
  {
    id: "2",
    name: "Wade Warren",
    email: "ad324h463",
    avatar: "WW",
    type: "Admin",
    phoneNumber: "05552731324",
    dateOfRegistration: "5/19/12",
  },
  {
    id: "3",
    name: "Esther Howard",
    email: "ad324h463",
    avatar: "EH",
    type: "Agent",
    phoneNumber: "05552731324",
    dateOfRegistration: "3/4/16",
  },
  {
    id: "4",
    name: "Jenny Wilson",
    email: "ad324h463",
    avatar: "JW",
    type: "Agent",
    phoneNumber: "05552731324",
    dateOfRegistration: "3/4/16",
  },
  {
    id: "5",
    name: "Guy Hawkins",
    email: "ad324h463",
    avatar: "GH",
    type: "Accounting",
    phoneNumber: "05552731324",
    dateOfRegistration: "7/27/13",
  },
  {
    id: "6",
    name: "Jacob Jones",
    email: "ad324h463",
    avatar: "JJ",
    type: "Agent",
    phoneNumber: "05552731324",
    dateOfRegistration: "5/27/15",
  },
  {
    id: "7",
    name: "Ronald Richards",
    email: "ad324h463",
    avatar: "RR",
    type: "Admin",
    phoneNumber: "05552731324",
    dateOfRegistration: "7/11/19",
  },
  {
    id: "8",
    name: "Devon Lane",
    email: "ad324h463",
    avatar: "DL",
    type: "Accounting",
    phoneNumber: "05552731324",
    dateOfRegistration: "9/23/16",
  },
  {
    id: "9",
    name: "Jerome Bell",
    email: "ad324h463",
    avatar: "JB",
    type: "Accounting",
    phoneNumber: "05552731324",
    dateOfRegistration: "8/2/19",
  },
];

export default function MembersPage() {
  const [admins, setAdmins] = useState(mockAdmins);

  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([
    "1",
    "2",
    "6",
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Define Admin type for type safety
  type Admin = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    type: string;
    phoneNumber: string;
    dateOfRegistration: string;
  };

  // Temporary no-op selectedFilters (replace with real header/context)
  const selectedFilters: Record<string, string> = {};

  // Set page title
  useEffect(() => {
    // Temporary no-op header setters (replace with real header/context)
    const setTitle = (t: string) => { void t; };
    const setFilters = (f: Record<string, { label: string; value: string }[]>) => { void f; };

    setTitle("Admin");
    setFilters({
      Users: [
        { label: "All Users", value: "all" },
        { label: "Admin", value: "admin" },
        { label: "Providers", value: "provider" },
        { label: "Accounting", value: "accounting" },
      ],
    });
  }, []);

  // Listen for action tab events from HeaderTabs
  useEffect(() => {
    const handleOpenModal = () => setIsDialogOpen(true);
    window.addEventListener("open-agent-modal", handleOpenModal);
    return () =>
      window.removeEventListener("open-agent-modal", handleOpenModal);
  }, []);

  const handleAddAdmin = (newAdmin: Omit<Admin, "id">) => {
    setAdmins([...admins, { ...newAdmin, id: String(admins.length + 1) }]);
    setIsDialogOpen(false);
  };

  const handleSelectAdmin = (id: string) => {
    setSelectedAdmins((prev) =>
      prev.includes(id)
        ? prev.filter((adminId) => adminId !== id)
        : [...prev, id]
    );
  };

  const handleDeleteAdmin = (id: string) => {
    setAdmins(admins.filter((admin) => admin.id !== id));
    setSelectedAdmins(selectedAdmins.filter((adminId) => adminId !== id));
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Management</h1>
          <Link href="/dashboard/members/allocated" className="text-sm text-blue-600">View Allocated Members</Link>
        </div>
        <AdminsTable
          admins={
            // Apply header-selected filter (Users)
            (() => {
              const sel = selectedFilters["Users"] || "all";
              if (sel === "all") return admins;
              return admins.filter((a) =>
                a.type.toLowerCase().includes(sel.toLowerCase())
              );
            })()
          }
          selectedAdmins={selectedAdmins}
          onSelectAdmin={handleSelectAdmin}
          onDeleteAdmin={handleDeleteAdmin}
        />
        <AddAdminDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onAddAdmin={handleAddAdmin}
        />
      </div>
    </main>
  );
}
