"use client";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  FieldErrors,
  UseFormRegister,
  Path,
  FieldValues,
} from "react-hook-form";
import { useState } from "react";

interface InputFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  icon?: React.ElementType;
  type?: string;
  isPassword?: boolean;
  placeholder?: string;
}

export function InputField<T extends FieldValues>({
  label,
  name,
  register,
  errors,
  icon: Icon,
  type = "text",
  isPassword = false,
  placeholder,
}: InputFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const fieldError = errors[name];
  const errorMessage =
    typeof fieldError?.message === "string"
      ? fieldError.message
      : undefined;

  return (
    <div className="space-y-2 w-full border-none outline-none">
      <Label htmlFor={String(name)} className="text-gray-700">
        {label}
      </Label>

      <div className="relative flex items-center">
        {Icon && (
          <Icon className="absolute left-3 text-yellow-400 w-5 h-5 pointer-events-none" />
        )}

        <Input
          id={String(name)}
          type={inputType}
          placeholder={placeholder}
          {...register(name)}
          className={`pl-10 pr-10 py-5 bg-white border-gray-200 focus:ring-1 focus:ring-yellow-400 rounded-lg ${
            errorMessage ? "border-red-500" : ""
          }`}
        />

        {isPassword && (
          <Button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            variant="ghost"
            size="icon"
            className="absolute right-3 text-yellow-400 cursor-pointer hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        )}
      </div>

      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}
