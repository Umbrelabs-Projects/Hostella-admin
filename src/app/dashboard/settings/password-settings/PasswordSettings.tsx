"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import PasswordField from "./components/PasswordField";

export default function PasswordSettings() {
  const [form, setForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (form.new !== form.confirm) {
      alert("Passwords do not match");
      return;
    }
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setForm({ current: "", new: "", confirm: "" });
  };

  const handleChange = (
    field: "current" | "new" | "confirm",
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleShow = (field: "current" | "new" | "confirm") => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const fields = [
    { id: "current-password", label: "Current Password", key: "current" },
    { id: "new-password", label: "New Password", key: "new" },
    { id: "confirm-password", label: "Confirm New Password", key: "confirm" },
  ] as const;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 max-w-2xl space-y-6 mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Change Password
        </h2>
        <p className="text-sm text-gray-600">
          Update your password to keep your account secure
        </p>
      </div>

      <div className="space-y-6 pt-4">
        {fields.map((field) => (
          <PasswordField
            key={field.id}
            id={field.id}
            label={field.label}
            value={form[field.key]}
            onChange={(e) => handleChange(field.key, e.target.value)}
            showPassword={show[field.key]}
            onToggle={() => toggleShow(field.key)}
          />
        ))}

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={!form.current || !form.new || !form.confirm || isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            {isSaving ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
