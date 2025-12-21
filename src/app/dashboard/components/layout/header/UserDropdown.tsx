"use client";

import { User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

const dropdownItems = [
  { name: "Account Settings", link: "/dashboard/settings" },
  { name: "Sign Out", link: "/" },
];

export default function UserDropdown() {
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut();
    router.push("/");
  };

  if (!isHydrated) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full cursor-pointer border border-gray-200 p-0 h-10 w-10 overflow-hidden"
        aria-label="User menu"
        disabled
      >
        <User className="h-5 w-5 text-gray-700" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full cursor-pointer border border-gray-200 p-0 h-10 w-10 overflow-hidden"
          aria-label="User menu"
        >
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={`${user.firstName || "User"} avatar`}
              width={40}
              height={40}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="h-5 w-5 text-gray-700" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        {dropdownItems.map((item) => {
          const isLogout = item.name === "Sign Out";
          const isActive = pathname === item.link;

          if (isLogout) {
            return (
              <DropdownMenuItem
                key={item.name}
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 hover:text-red-600! hover:bg-red-50! focus:bg-red-50! active:bg-red-100!"
              >
                {item.name}
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuItem key={item.name} asChild className="p-0">
              <Link
                href={item.link}
                className={`block w-full px-3 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-50 focus:bg-gray-100 active:bg-gray-100
                  ${isActive ? "bg-gray-200 text-black font-medium" : ""}
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
