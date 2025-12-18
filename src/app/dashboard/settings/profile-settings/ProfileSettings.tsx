"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AvatarUploader from "./components/AvatarUploader";
import PersonalInfoForm from "./components/PersonalInfoForm";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function ProfileSettings() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Ensure profile data is fetched from backend when the page loads
  useEffect(() => {
    if (profileLoaded) return;
    const load = async () => {
      try {
        await fetchProfile();
      } finally {
        setProfileLoaded(true);
      }
    };
    load();
  }, [fetchProfile, profileLoaded]);

  // Keep local state in sync when user updates arrive
  useEffect(() => {
    if (user) {
      if (process.env.NODE_ENV === "development") {
        console.log("[ProfileSettings] User updated:", user);
      }
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setAvatarFile(null);
    }
  }, [user]);

  // Show success message when profile updates
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleSave = async () => {
    try {
      setSaveSuccess(false);
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      if (avatarFile) formData.append("avatar", avatarFile);
      await updateProfile(formData);
      setSaveSuccess(true);
      toast.success("Profile updated successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save profile";
      toast.error(message);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6 sm:p-8 space-y-6 sm:space-y-8 max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold">Profile Settings</h2>

      {/* Success Message */}
      {saveSuccess && (
        <div className="flex items-center gap-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
          <p className="font-medium">Profile updated successfully</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <AvatarUploader
        avatar={user?.avatar || ""}
        onFileSelect={setAvatarFile}
      />

      <hr className="border-gray-200" />

      <h2 className="text-lg font-semibold text-gray-900">
        Personal Information
      </h2>
      <PersonalInfoForm
        firstName={firstName}
        lastName={lastName}
        email={user?.email || ""}
        onChange={(field, value) =>
          field === "firstName" ? setFirstName(value) : setLastName(value)
        }
      />

      <Button
        onClick={handleSave}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
      >
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
