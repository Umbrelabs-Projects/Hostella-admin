"use client";
import { ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onToggle: () => void;
  id: string;
}

export default function PasswordField({
  label,
  value,
  onChange,
  showPassword,
  onToggle,
  id,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-900 mb-2"
      >
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 pr-10"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
