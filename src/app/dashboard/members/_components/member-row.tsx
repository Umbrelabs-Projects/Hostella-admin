import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Info, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminTypeBadge } from "./member-type-badge";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useState } from "react";

interface Admin {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: string;
  phoneNumber: string;
  dateOfRegistration: string;
}

interface AdminRowProps {
  admin: Admin;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function AdminRow({
  admin,
  isSelected,
  onSelect,
  onDelete,
}: AdminRowProps) {
  const [open, setOpen] = useState(false);
  return (
    <TableRow className="border-border hover:bg-muted/30">
      <TableCell>
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{admin.avatar}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{admin.name}</span>
            <span className="text-sm text-muted-foreground">
              @{admin.email}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <AdminTypeBadge type={admin.type} />
      </TableCell>
      <TableCell className="text-foreground">{admin.phoneNumber}</TableCell>
      <TableCell className="text-foreground">
        {admin.dateOfRegistration}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Info className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setOpen(true)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <ConfirmDialog
            open={open}
            onOpenChange={setOpen}
            title={`Delete ${admin.name}`}
            description={`Are you sure you want to delete ${admin.name}? This action cannot be undone.`}
            confirmLabel="Delete"
            onConfirm={() => {
              setOpen(false);
              onDelete();
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
