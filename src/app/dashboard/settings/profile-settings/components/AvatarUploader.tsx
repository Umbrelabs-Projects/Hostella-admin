"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AvatarUploaderProps {
  avatar: string;
  onFileSelect: (file: File) => void;
}

export default function AvatarUploader({
  avatar,
  onFileSelect,
}: AvatarUploaderProps) {
  const [preview, setPreview] = useState(avatar);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
      <div className="relative">
        <Image
          src={preview}
          alt="Profile"
          width={128}
          height={128}
          className="rounded-full border"
        />
        <label
          htmlFor="avatar-upload"
          className="absolute bottom-0 right-0 cursor-pointer"
        >
          <div className="bg-blue-600 text-white p-2 rounded-full shadow">
            <Upload className="w-5 h-5" />
          </div>
        </label>
        <input
          id="avatar-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleUpload}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
        <Button
          onClick={() => document.getElementById("avatar-upload")?.click()}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
        >
          Upload New
        </Button>
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent w-full sm:w-auto"
        >
          Delete Avatar
        </Button>
      </div>
    </div>
  );
}
