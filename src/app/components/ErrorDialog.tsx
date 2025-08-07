// components/ErrorDialog.tsx
"use client";

import * as Dialog from "@radix-ui/react-dialog";

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
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed z-50 bg-white p-6 rounded-lg shadow-lg w-[90vw] max-w-sm top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold">Error</Dialog.Title>
            <Dialog.Close className="text-gray-500 hover:text-gray-700">
            </Dialog.Close>
          </div>
          <p className="text-sm text-gray-700 mb-4">{message}</p>
          <div className="text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
