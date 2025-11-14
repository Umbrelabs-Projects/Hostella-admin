"use client";

import { usePathname } from "next/navigation";
import HeaderLeft from "./HeaderLeft";
import HeaderRight from "./HeaderRight";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Default title
  let title = "Dashboard";

  if (segments.length > 0) {
    const last = segments[segments.length - 1];

    // Capitalize only
    title = last.charAt(0).toUpperCase() + last.slice(1);
  }

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
      <HeaderLeft title={title} onMenuClick={onMenuClick} />
      <HeaderRight />
    </div>
  );
}
