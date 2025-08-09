"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, color: string) => void;
  mode: "add" | "edit";
  initialName?: string;
  initialColor?: string;
}

export default function CategoryModal({
  open,
  onOpenChange,
  onSave,
  mode,
  initialName = "",
  initialColor = "#cccccc",
}: CategoryModalProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    setName(initialName);
    setColor(initialColor);
  }, [initialName, initialColor, open]);

  const canSave = name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSave) return;
    onSave(name.trim(), color);
    onOpenChange(false);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        // Close on backdrop/Esc
        if (!next) onOpenChange(false);
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

        {/* Content: bottom sheet on mobile, centered on md+ */}
        <Dialog.Content
          aria-describedby="category-modal-desc"
          className="
            fixed z-50 bg-white shadow-xl focus:outline-none
            inset-x-0 bottom-0 rounded-t-2xl p-4
            md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
            md:rounded-lg md:p-6
            w-full md:w-[90vw] md:max-w-sm
            data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0
            data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0
          "
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold md:text-lg">
              {mode === "add" ? "Add Category" : "Edit Category"}
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
          <Dialog.Description
            id="category-modal-desc"
            className="mb-3 text-sm text-gray-600"
          >
            Choose a name and color for your category.
          </Dialog.Description>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="cat-name" className="block text-sm font-medium">
                Name
              </label>
              <input
                id="cat-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="mt-1 h-10 w-full rounded border px-3"
                placeholder="e.g., Family"
              />
            </div>

            <div>
              <label htmlFor="cat-color" className="block text-sm font-medium">
                Color
              </label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  id="cat-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-12 rounded border"
                  aria-label="Pick color"
                />
                <span className="text-sm text-gray-600">{color}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button className="h-10 rounded bg-gray-100 px-4 text-sm hover:bg-gray-200">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleSubmit}
                disabled={!canSave}
                className="h-10 rounded bg-teal px-4 text-sm text-white hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#90bede" }}
              >
                Save
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
