"use client";

import { images } from "@/lib/images";
import Image from "next/image";

export default function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      {/* Hostella Logo */}
      <div className="bg-black px-3 pb-2">
        <Image src={images.logo} alt="logo" className="w-40" />
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground mt-2">
          Select a chat from the left to start messaging.
        </p>
      </div>
    </div>
  );
}
