"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import AvatarUploader from "./components/AvatarUploader";
import PersonalInfoForm from "./components/PersonalInfoForm";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ProfileSettings() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const loading = useAuthStore((s) => s.loading);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    if (avatarFile) formData.append("avatar", avatarFile);
    await updateProfile(formData);
  };

  return (
    <div className="bg-white rounded-lg border p-6 sm:p-8 space-y-6 sm:space-y-8 max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold">Profile Settings</h2>

      <AvatarUploader
        avatar={user?.avatar || "/avatar.jpg"}
        onFileSelect={setAvatarFile}
      />

      <hr className="border-gray-200" />

      <h2 className="text-lg font-semibold text-gray-900">
        Personal Information
      </h2>
      <PersonalInfoForm
        firstName={user?.firstName || firstName}
        lastName={user?.lastName || lastName}
        email={user?.email || "elvisgyasiowusu24@gmail.com"}
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
