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

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave(name, color);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-md w-80 z-50">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">
              {mode === "add" ? "Add Category" : "Edit Category"}
            </Dialog.Title>
            <Dialog.Close className="text-gray-500 hover:text-black">
              <X size={20} />
            </Dialog.Close>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-2 py-1 mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-8 border rounded mt-1"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-teal text-white px-4 py-2 rounded hover:bg-teal/80"
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
