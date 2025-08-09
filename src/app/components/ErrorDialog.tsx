"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export default function ErrorDialog({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  return (
    <Dialog.Root
      open={open}
      // Radix gives `nextOpen: boolean`. Close only when it transitions to false.
      onOpenChange={(next) => {
        if (!next) onClose();
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
        {/* Content: full screen on mobile; centered on md+ */}
        <Dialog.Content
          aria-describedby="error-dialog-description"
          className="
            fixed z-50 bg-white shadow-xl focus:outline-none
            inset-x-0 bottom-0 rounded-t-2xl p-4
            md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
            md:rounded-lg md:p-6
            w-full md:w-[90vw] md:max-w-sm
            data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0
            data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-base font-bold md:text-lg">Error</Dialog.Title>
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
          {/* Message (scrollable if long) */}
          <div className="mt-3 max-h-[40dvh] overflow-y-auto md:max-h-[50vh]">
            <p id="error-dialog-description" className="text-sm text-gray-700 whitespace-pre-wrap">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-4 text-right">
            <button
              onClick={onClose}
              className="h-10 rounded bg-blue-600 px-4 text-sm text-white hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
