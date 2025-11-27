import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Pagination from "@/components/ui/pagination";
import ListCard from "@/components/lists/ListCard";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminRow } from "./member-row";

interface Admin {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: string;
  phoneNumber: string;
  dateOfRegistration: string;
}

interface AdminsTableProps {
  admins: Admin[];
  selectedAdmins: string[];
  onSelectAdmin: (id: string) => void;
  onDeleteAdmin: (id: string) => void;
}

export function AdminsTable({
  admins,
  selectedAdmins,
  onSelectAdmin,
  onDeleteAdmin,
}: AdminsTableProps) {
  // Local pagination state
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(admins.length / pageSize));
  const pagedAdmins = admins.slice((page - 1) * pageSize, page * pageSize);
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all
      admins.forEach((admin) => {
        if (!selectedAdmins.includes(admin.id)) {
          onSelectAdmin(admin.id);
        }
      });
    } else {
      // Deselect all
      selectedAdmins.forEach((id) => onSelectAdmin(id));
    }
  };

  const allSelected =
    admins.length > 0 && selectedAdmins.length === admins.length;
  const someSelected =
    selectedAdmins.length > 0 && selectedAdmins.length < admins.length;

  return (
    <ListCard footer={<Pagination current={page} total={totalPages} onChange={(p) => setPage(p)} />}>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-card">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                data-indeterminate={someSelected || undefined}
              />
            </TableHead>
            <TableHead className="text-foreground">Name</TableHead>
            <TableHead className="text-foreground">Type</TableHead>
            <TableHead className="text-foreground">Phone number</TableHead>
            <TableHead className="text-foreground">
              Date of Registration
            </TableHead>
            <TableHead className="w-12 text-center text-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedAdmins.map((admin) => (
            <AdminRow
              key={admin.id}
              admin={admin}
              isSelected={selectedAdmins.includes(admin.id)}
              onSelect={() => onSelectAdmin(admin.id)}
              onDelete={() => onDeleteAdmin(admin.id)}
            />
          ))}
        </TableBody>
      </Table>
    </ListCard>
  );
}
