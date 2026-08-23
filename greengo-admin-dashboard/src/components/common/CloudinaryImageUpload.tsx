"use client";

import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { useRef, useState } from "react";

type Props = {
  label?: string;
  folder?: string;
  disabled?: boolean;
  onUploaded: (url: string) => void;
};

export default function CloudinaryImageUpload({
  label = "ატვირთვა",
  folder,
  disabled = false,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("აირჩიეთ სურათის ფაილი");
      return;
    }

    try {
      setUploading(true);
      const url = await uploadImageToCloudinary(file, folder);
      onUploaded(url);
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      alert(
        `სურათის ატვირთვა ვერ მოხერხდა: ${
          error instanceof Error ? error.message : "უცნობი შეცდომა"
        }`,
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        {uploading ? "იტვირთება..." : label}
      </button>
    </div>
  );
}
