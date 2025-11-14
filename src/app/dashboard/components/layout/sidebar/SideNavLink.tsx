"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface SideNavLinkProps {
  title: string;
  icon: LucideIcon;
  url: string;
  isActive: boolean;
}

export default function SideNavLink({
  title,
  icon: Icon,
  url,
  isActive,
}: SideNavLinkProps) {
  return (
    <Link
      href={url}
      className={`flex items-center gap-3 mx-4 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
          : "text-gray-700 hover:bg-blue-50"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{title}</span>
    </Link>
  );
}
