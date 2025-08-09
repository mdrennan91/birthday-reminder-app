"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import AvatarUploader from "./AvatarUploader";
import Image from "next/image";
import { X } from "lucide-react";

export default function AvatarUploadDialog({
  personId,
  onUploadComplete,
}: {
  personId: string;
  onUploadComplete: () => void;
}) {
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  // Ensure onUploadComplete() only runs once
  const hasCompleted = useRef(false);
  const completeOnce = () => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    onUploadComplete();
  };

  // Handle successful upload
  const handleUpload = (_filename: string, signedUrl: string) => {
    setUploadedAvatarUrl(signedUrl);
    setUploadMessage("Avatar uploaded successfully!");
    // Give users a quick peek, then close
    setTimeout(() => {
      // blur focused element to avoid aria-hidden warnings when dialog closes
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setOpen(false);
      completeOnce();
    }, 1200);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) completeOnce(); // close via Esc/backdrop/close button
      }}
    >
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className="
            fixed inset-0 z-50 bg-black/40
            data-[state=open]:animate-in data-[state=open]:fade-in-0
            data-[state=closed]:animate-out data-[state=closed]:fade-out-0
          "
        />
        {/* Bottom sheet on mobile, centered on md+ */}
        <Dialog.Content
          aria-describedby="avatar-upload-description"
          className="
            fixed z-50 bg-white shadow-xl focus:outline-none
            inset-x-0 bottom-0 rounded-t-2xl p-4
            md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
            md:rounded-lg md:p-6
            w-full md:w-[90vw] md:max-w-md
            data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0
            data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0
          "
        >
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold md:text-lg">
              Upload Avatar
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-gray-50"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            aria-describedby={undefined}
          </Dialog.Description>
          <Dialog.Description id="avatar-upload-description" className="sr-only">
            Upload a profile image for the newly added person.
          </Dialog.Description>

          {/* Uploader */}
          <AvatarUploader
            personId={personId}
            onUpload={handleUpload}
            onClose={() => {
              setOpen(false);
              completeOnce();
            }}
          />

          {/* Preview */}
          {uploadedAvatarUrl && (
            <div className="mt-4 flex flex-col items-center">
              <p className="mb-2 text-sm text-gray-600">Preview:</p>
              <Image
                src={uploadedAvatarUrl}
                alt="Uploaded avatar preview"
                width={96}
                height={96}
                className="rounded-full border object-cover shadow"
              />
            </div>
          )}

          {/* Success message */}
          {uploadMessage && (
            <div className="mt-4 text-center text-green-600 font-medium">
              {uploadMessage}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
