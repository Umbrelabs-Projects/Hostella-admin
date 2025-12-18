"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import PasswordField from "./components/PasswordField";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function PasswordSettings() {
  const updatePassword = useAuthStore((s) => s.updatePassword);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSave = async () => {
    setValidationError("");
    setSaveSuccess(false);

    if (!form.current || !form.new || !form.confirm) {
      setValidationError("All fields are required");
      return;
    }

    if (form.new !== form.confirm) {
      setValidationError("New passwords do not match");
      return;
    }

    if (form.new.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }

    try {
      await updatePassword({
        currentPassword: form.current,
        newPassword: form.new,
      });
      setSaveSuccess(true);
      setForm({ current: "", new: "", confirm: "" });
      toast.success("Password updated successfully");
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update password";
      toast.error(message);
    }
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

      {/* Success Message */}
      {saveSuccess && (
        <div className="flex items-center gap-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
          <p className="font-medium">Password updated successfully</p>
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="font-medium">{validationError}</p>
        </div>
      )}

      {/* API Error */}
      {error && !validationError && (
        <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="font-medium">{error}</p>
        </div>
      )}

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
            disabled={!form.current || !form.new || !form.confirm || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
