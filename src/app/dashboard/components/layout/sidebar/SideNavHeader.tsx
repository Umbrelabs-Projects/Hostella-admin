"use client";

import React from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { images } from "@/lib/images";
import Link from "next/link";

interface SideNavHeaderProps {
  closeMenu: () => void;
}

export default function SideNavHeader({ closeMenu }: SideNavHeaderProps) {
  return (
    <div>
      <Link href="/dashboard" className="hidden md:block">
        <div className="bg-black h-15 flex justify-around items-center pb-3">
          <Image src={images.logo} alt="logo" />
        </div>
      </Link>
      <div className="flex w-full mb-6 md:hidden bg-black ">
        <Link href="/dashboard" className="block md:hidden w-full">
          <div className="w-full h-15 flex justify-around items-center pb-3">
            <Image src={images.logo} alt="logo" />
          </div>
        </Link>
        <button
          onClick={closeMenu}
          className="p-2 m-2 bg-white rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
