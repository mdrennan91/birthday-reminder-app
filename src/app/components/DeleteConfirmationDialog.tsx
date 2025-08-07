"use client";

import * as Dialog from "@radix-ui/react-dialog";

export default function DeleteConfirmationDialog({
  open,
  personName,
  onCancel,
  onConfirm,
  isLoading, 
}: {
  open: boolean;
  personName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading: boolean; 
}) {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content
          className="fixed z-50 bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-sm top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
          aria-describedby="delete-confirm-description"
        >
          <Dialog.Title className="text-lg font-semibold text-center mb-2">
            Confirm Deletion
          </Dialog.Title>
          <Dialog.Description
            id="delete-confirm-description"
            className="text-sm text-center text-gray-700 mb-4"
          >
            Are you sure you want to delete{" "}
            <span className="font-medium">{personName}</span>?
          </Dialog.Description>
          <div className="flex justify-center gap-4">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
            >
              {isLoading ? "Deleting..." : "Yes, Delete"}
            </button>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
