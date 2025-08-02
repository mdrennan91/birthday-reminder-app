"use client"; // Ensures this is a client-side component in a Next.js App Router project

import { useState } from "react";
import AvatarUploader from "./AvatarUploader";
import Image from "next/image";

// This component wraps AvatarUploader in a styled dialog box
export default function AvatarUploadDialog({
  personId,
  onUploadComplete,
}: {
  personId: string;               // The ID of the person to associate the avatar with
  onUploadComplete: () => void;  // Callback to trigger when upload is completed
}) {
  // Local state to manage preview and confirmation UI
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Handle successful upload from AvatarUploader
  const handleUpload = (_filename: string, signedUrl: string) => {
    setUploadedAvatarUrl(signedUrl);           // Store the signed image URL for preview
    setShowPreview(true);                      // Show preview image
    setUploadMessage("Avatar uploaded successfully!"); // Display confirmation message

    // Automatically close the dialog after a short delay
    setTimeout(() => {
      onUploadComplete();                      // Notify parent component upload is done
    }, 1500);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-md mx-auto">
      {/* Dialog title and accessibility label */}
      <h2 className="text-lg font-semibold mb-4 text-center">Upload Avatar</h2>
      <p className="sr-only">Upload a profile image for the newly added person.</p>

      {/* AvatarUploader handles actual upload and invokes handleUpload on success */}
      <AvatarUploader personId={personId} onUpload={handleUpload} />

      {/* Show uploaded avatar preview if available */}
      {showPreview && uploadedAvatarUrl && (
        <div className="mt-4 flex flex-col items-center">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <Image
            src={uploadedAvatarUrl}
            alt="Uploaded avatar preview"
            width={96}
            height={96}
            className="rounded-full object-cover border shadow"
          />
        </div>
      )}

      {/* Upload confirmation message */}
      {uploadMessage && (
        <div className="mt-4 text-center text-green-600 font-medium">
          {uploadMessage}
        </div>
      )}
    </div>
  );
}
