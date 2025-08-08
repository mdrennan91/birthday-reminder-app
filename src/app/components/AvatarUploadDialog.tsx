"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import AvatarUploader from "./AvatarUploader";
import Image from "next/image";

export default function AvatarUploadDialog({
  personId,
  onUploadComplete,
}: {
  personId: string;
  onUploadComplete: () => void;
}) {
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(true); // Keeps dialog open while preview is showing

  // Handle successful upload
  const handleUpload = (_filename: string, signedUrl: string) => {
    setUploadedAvatarUrl(signedUrl);
    setUploadMessage("Avatar uploaded successfully!");

    // Blur any focused element before hiding modal to avoid aria-hidden warning
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setOpen(false);
      onUploadComplete();
    }, 1500);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onUploadComplete()}>
      <Dialog.DialogPortal>
        <Dialog.DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.DialogContent
          aria-describedby="avatar-upload-description"
          className="fixed z-50 bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
        >
          <Dialog.DialogTitle className="text-lg font-semibold text-center mb-2">
            Upload Avatar
          </Dialog.DialogTitle>
          <Dialog.DialogDescription id="avatar-upload-description" className="sr-only">
            Upload a profile image for the newly added person.
          </Dialog.DialogDescription>

          <AvatarUploader
            personId={personId}
            onUpload={handleUpload}
            onClose={() => setOpen(false)}
          />

          {uploadedAvatarUrl && (
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

          {uploadMessage && (
            <div className="mt-4 text-center text-green-600 font-medium">
              {uploadMessage}
            </div>
          )}
        </Dialog.DialogContent>
      </Dialog.DialogPortal>
    </Dialog.Root>
  );
}
