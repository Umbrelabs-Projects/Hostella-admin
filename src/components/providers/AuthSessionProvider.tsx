"use client";

import { useEffect, ReactNode } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AuthSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return <>{children}</>;
}
