"use client";
import React from "react";

interface PersonalInfoFormProps {
  firstName: string;
  lastName: string;
  email: string;
  onChange: (field: "firstName" | "lastName", value: string) => void;
}

export default function PersonalInfoForm({
  firstName,
  lastName,
  email,
  onChange,
}: PersonalInfoFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* First Name */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          First Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={firstName}
          placeholder="First Name"
          onChange={(e) => onChange("firstName", e.target.value)}
          className="border px-4 py-2 rounded-lg w-full"
        />
      </div>

      {/* Last Name */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Last Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={lastName}
          placeholder="Last Name"
          onChange={(e) => onChange("lastName", e.target.value)}
          className="border px-4 py-2 rounded-lg w-full"
        />
      </div>

      {/* Email (disabled) */}
      <div className="flex flex-col sm:col-span-2">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="border px-4 py-2 rounded-lg w-full bg-gray-100 cursor-not-allowed"
        />
      </div>
    </div>
  );
}
