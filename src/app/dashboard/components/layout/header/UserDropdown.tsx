"use client";

import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

const dropdownItems = [
  { name: "Account Settings", link: "/dashboard/settings" },
  { name: "Sign Out", link: "/" },
];

export default function UserDropdown() {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full cursor-pointer border border-gray-200"
          aria-label="User menu"
        >
          <User className="h-5 w-5 text-gray-700" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        {dropdownItems.map((item) => {
          const isLogout = item.name === "Sign Out";
          const isActive = pathname === item.link;

          return (
            <DropdownMenuItem key={item.name} asChild className="p-0">
              <Link
                href={item.link}
                className={`block w-full px-3 py-2 text-sm cursor-pointer
                  ${
                    isLogout
                      ? "text-red-600 hover:!text-red-600 hover:!bg-red-50 focus:!bg-red-50 active:!bg-red-100"
                      : "text-gray-700 hover:bg-gray-50 focus:bg-gray-100 active:bg-gray-100"
                  }
                  ${
                    isActive && !isLogout
                      ? "bg-gray-200 text-black font-medium"
                      : ""
                  }
                `}
              >
                {item.name}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
