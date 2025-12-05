"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  BookIcon,
  Home,
  MessageCircleMoreIcon,
  Settings,
  Users2Icon,
} from "lucide-react";
import SideNavHeader from "./SideNavHeader";
import SideNavLink from "./SideNavLink";
import SideNavFooter from "./SideNavFooter";

interface SideNavProps {
  closeMenu: () => void;
}

export default function SideNav({ closeMenu }: SideNavProps) {
  const pathname = usePathname();

  const navItems = [
    { title: "Bookings", icon: BookIcon, url: "/dashboard/bookings" },
    { title: "Members", icon: Users2Icon, url: "/dashboard/members" },
    {
      title: "Broadcast Message",
      icon: MessageCircleMoreIcon,
      url: "/dashboard/broadcast",
    },
    { title: "Settings", icon: Settings, url: "/dashboard/settings" },
  ];

  return (
    <div className="flex h-full flex-col py- bg-white">
      {/* Header */}
      <SideNavHeader closeMenu={closeMenu} />

      {/* Links */}
      <div className="flex flex-col grow gap-1 mt-4">
        {navItems.map(({ title, icon, url }) => (
          <SideNavLink
            key={title}
            title={title}
            icon={icon}
            url={url}
            isActive={pathname === url}
          />
        ))}
      </div>

      {/* Footer (Sign out) */}
      <SideNavFooter />
    </div>
  );
}
