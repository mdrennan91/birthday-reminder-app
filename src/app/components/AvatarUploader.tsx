"use client";

import Image from "next/image";
import React, { ChangeEvent, DragEvent, useState } from "react";

export default function AvatarUploader({
  personId,
  onUpload,
  onClose,
}: {
  onClose: () => void;
  personId: string;
  onUpload: (filename: string, signedUrl: string) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validate file type and size before preview/upload
  const validateFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024; // 2 MB

    if (!allowedTypes.includes(file.type)) {
      return "Only JPG, PNG, or WebP files are allowed.";
    }
    if (file.size > maxSize) {
      return "File must be smaller than 2MB.";
    }
    return null;
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePreview(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePreview(file);
  };

  const handlePreview = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("personId", personId);

    try {
      const res = await fetch("/api/uploadAvatar", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onUpload(data.path, data.signedUrl);
      } else {
        const err = await res.json();
        setErrorMessage(`Upload failed: ${err.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border p-4 rounded bg-white">
      {/* Drag-and-drop area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`border-dashed border-2 rounded p-6 text-center ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        Drag and Drop image here
      </div>

      <div className="m-2 text-center font-extrabold">OR</div>

      {/* File picker */}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="ml-8"
      />

      {/* Error message */}
      {errorMessage && (
        <p className="text-sm text-red-600 text-center mt-2">{errorMessage}</p>
      )}
      <div className="mt-4 flex justify-center">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 mt-4"
      >
        Cancel
      </button>
      </div>
      {/* Preview and upload button */}
      {previewUrl && (
        <div className="mt-4 flex flex-col items-center">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <Image
            src={previewUrl}
            alt="Selected avatar"
            width={96}
            height={96}
            className="rounded-full object-cover border shadow"
          />
          <button
            onClick={uploadFile}
            disabled={uploading}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {uploading ? "Uploading..." : "Confirm Upload"}
          </button>
        </div>
      )}
    </div>
  );
}
