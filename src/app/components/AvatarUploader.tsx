"use client"; // Marks this as a client-side component in a Next.js App Router project

import Image from "next/image";
import React, { ChangeEvent, DragEvent, useState } from "react";

// Props: personId is used for upload identification, onUpload is a callback with the uploaded file info
export default function AvatarUploader({
  personId,
  onUpload,
}: {
  personId: string;
  onUpload: (filename: string, signedUrl: string) => void;
}) {
  // Internal state for drag/drop feedback, selected file, preview URL, and upload status
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Handle file drop from drag-and-drop interaction
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePreview(file);
  };

  // Handle file selection via the file input element
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePreview(file);
  };

  // Generate a preview URL and store selected file
  const handlePreview = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Upload selected file to the server using FormData and fetch
  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true); // Disable button while uploading
    const formData = new FormData();
    formData.append("image", selectedFile); // Append the file under "image" key
    formData.append("personId", personId);  // Include the person ID in the form data

    try {
      const res = await fetch("/api/uploadAvatar", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // Call parent component's callback with uploaded file info
        onUpload(data.path, data.signedUrl);
      } else {
        const err = await res.json();
        alert(`Upload failed: ${err.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border p-4 rounded bg-white">
      {/* Label for the upload section */}
      <label className="block font-semibold mb-2">Upload Avatar</label>

      {/* Drag-and-drop area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true); // Highlight border on drag over
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`border-dashed border-2 rounded p-6 text-center ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        Drop image here or choose below
      </div>

      {/* File picker input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mt-2"
      />

      {/* Image preview and upload button (if file is selected) */}
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
