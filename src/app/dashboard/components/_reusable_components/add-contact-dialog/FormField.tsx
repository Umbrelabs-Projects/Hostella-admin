"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormFieldProps } from "./types";

export default function FormField({ field, value, onChange }: FormFieldProps) {
  if (field.type === "select") {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor={field.name}>
          {field.label}
        </Label>
        <Select 
          value={value || ""} 
          onValueChange={(v) => onChange(field.name, v)}
          disabled={field.disabled}
          defaultValue={field.name === "roomTitle" ? "One-in-one" : undefined}
        >
          <SelectTrigger 
            id={field.name} 
            className={`h-10 ${field.disabled ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"}`}
          >
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.selectOptions?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor={field.name}>
        {field.label}
      </Label>
      <Input
        id={field.name}
        name={field.name}
        type={field.type || "text"}
        placeholder={field.placeholder}
        value={value || ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        disabled={field.disabled}
        className={`h-10 ${field.disabled ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"}`}
      />
    </div>
  );
}

