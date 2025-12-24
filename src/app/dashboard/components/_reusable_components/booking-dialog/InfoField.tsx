"use client";

import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface InfoFieldProps {
  label: string;
  icon: LucideIcon;
  iconColor?: "blue" | "indigo" | "green" | "pink" | "purple" | "orange" | "amber" | "teal" | "red";
  value: ReactNode;
  href?: string;
  className?: string;
  valueClassName?: string;
}

const iconColorClasses = {
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
  green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  pink: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
  purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  teal: "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
  red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
};

const hoverBorderColors = {
  blue: "hover:border-blue-300 dark:hover:border-blue-700",
  indigo: "hover:border-indigo-300 dark:hover:border-indigo-700",
  green: "hover:border-green-300 dark:hover:border-green-700",
  pink: "hover:border-pink-300 dark:hover:border-pink-700",
  purple: "hover:border-purple-300 dark:hover:border-purple-700",
  orange: "hover:border-orange-300 dark:hover:border-orange-700",
  amber: "hover:border-amber-300 dark:hover:border-amber-700",
  teal: "hover:border-teal-300 dark:hover:border-teal-700",
  red: "hover:border-red-300 dark:hover:border-red-700",
};

const hoverTextColors = {
  blue: "hover:text-blue-600 dark:hover:text-blue-400",
  indigo: "hover:text-indigo-600 dark:hover:text-indigo-400",
  green: "hover:text-green-600 dark:hover:text-green-400",
  pink: "hover:text-pink-600 dark:hover:text-pink-400",
  purple: "hover:text-purple-600 dark:hover:text-purple-400",
  orange: "hover:text-orange-600 dark:hover:text-orange-400",
  amber: "hover:text-amber-600 dark:hover:text-amber-400",
  teal: "hover:text-teal-600 dark:hover:text-teal-400",
  red: "hover:text-red-600 dark:hover:text-red-400",
};

export default function InfoField({
  label,
  icon: Icon,
  iconColor = "blue",
  value,
  href,
  className = "",
  valueClassName = "",
}: InfoFieldProps) {
  const iconClasses = iconColorClasses[iconColor];
  const hoverClass = hoverBorderColors[iconColor];
  const hoverTextClass = hoverTextColors[iconColor];

  const content = (
    <div className={`group p-3 rounded-xl bg-linear-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-800 ${hoverClass} transition-all ${className}`}>
      <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
        {label}
      </Label>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconClasses}`}>
          <Icon className="size-3" />
        </div>
        {href ? (
          <a 
            href={href} 
            className={`text-sm font-medium text-gray-800 dark:text-gray-200 ${hoverTextClass} transition-colors ${valueClassName}`}
          >
            {value}
          </a>
        ) : (
          <div className={`text-sm font-medium text-gray-800 dark:text-gray-200 ${valueClassName}`}>
            {value}
          </div>
        )}
      </div>
    </div>
  );

  return content;
}

