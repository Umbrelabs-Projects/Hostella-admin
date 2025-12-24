"use client";

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface ActionButtonProps {
  icon: LucideIcon;
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "success" | "info" | "teal" | "warning" | "danger" | "outline" | "destructive";
  className?: string;
  disabled?: boolean;
}

const variantStyles = {
  primary: "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white",
  success: "bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white",
  info: "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white",
  teal: "bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white",
  warning: "bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white",
  danger: "bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white",
  outline: "border-2 hover:bg-gray-50 dark:hover:bg-gray-800",
  destructive: "text-white",
};

export default function ActionButton({
  icon: Icon,
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
}: ActionButtonProps) {
  const isGradientVariant = ["primary", "success", "info", "teal", "warning", "danger"].includes(variant);
  const isOutlineVariant = variant === "outline";
  const isDestructiveVariant = variant === "destructive";
  
  const baseClasses = isGradientVariant || isDestructiveVariant
    ? "cursor-pointer h-10 shadow-lg hover:shadow-xl transition-all font-semibold whitespace-nowrap"
    : "cursor-pointer h-10 transition-all font-semibold whitespace-nowrap";
  
  const variantClass = variantStyles[variant];
  const buttonVariant = isOutlineVariant ? "outline" : isDestructiveVariant ? "destructive" : undefined;

  return (
    <Button
      variant={buttonVariant}
      onClick={onClick}
      disabled={disabled}
      className={`${variantClass} ${baseClasses} ${className}`}
    >
      <Icon className="size-4 mr-2" />
      {children}
    </Button>
  );
}

