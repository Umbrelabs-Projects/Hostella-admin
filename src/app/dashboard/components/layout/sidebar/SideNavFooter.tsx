"use client";

import React from "react";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SideNavFooter() {
  return (
    <div className="px-4 mb-4">
      <Link href="/" className="block w-full">
        <Button
          variant="ghost"
          className="flex cursor-pointer w-full items-center justify-start gap-3 rounded-md p-3 text-sm font-medium text-red-600 
                     bg-transparent hover:bg-red-50 hover:text-red-600 focus:bg-red-50 active:bg-red-100 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </Link>
    </div>
  );
}
