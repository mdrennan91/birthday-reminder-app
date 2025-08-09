"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface CategoryType {
  _id: string;
  name: string;
  color: string;
}

interface EditDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryType[];
  onUpdate: (id: string, name: string, color: string) => void;
  onDelete: (id: string) => void;
}

export default function EditDeleteDialog({
  open,
  onOpenChange,
  categories,
  onUpdate,
  onDelete,
}: EditDeleteDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedColor, setEditedColor] = useState("#000000");

  const startEdit = (cat: CategoryType) => {
    setEditingId(cat._id);
    setEditedName(cat.name);
    setEditedColor(cat.color);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedName("");
    setEditedColor("#000000");
  };

  const handleSave = () => {
    if (editingId) {
      onUpdate(editingId, editedName, editedColor);
      cancelEdit();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className="
            fixed inset-0 z-40 bg-black/40
            data-[state=open]:animate-in data-[state=open]:fade-in-0
            data-[state=closed]:animate-out data-[state=closed]:fade-out-0
          "
        />
        {/* Content: full-screen on mobile; centered sheet on md+ */}
        <Dialog.Content
          aria-describedby="edit-delete-description"
          className="
            fixed z-50 bg-white shadow-xl focus:outline-none
            inset-0 md:inset-auto md:top-1/2 md:left-1/2
            md:-translate-x-1/2 md:-translate-y-1/2
            w-full h-dvh md:h-auto md:w-[90vw] md:max-w-md
            data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0
            data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0
            rounded-none md:rounded-lg
          "
        >
          {/* Header (sticky on mobile) */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
            <Dialog.Title className="text-base font-semibold">
              Edit or Delete Categories
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
             aria-describedby={undefined}
          </Dialog.Description>
          <Dialog.Description
            id="edit-delete-description"
            className="px-4 pt-3 text-sm text-gray-500"
          >
            Make changes to your categories or remove them.
          </Dialog.Description>

          {/* List (scrollable) */}
          <ul className="max-h-[65dvh] overflow-y-auto px-4 py-3 md:max-h-[60vh]">
            {categories.map((cat) => (
              <li key={cat._id} className="flex items-center gap-2 py-2">
                {editingId === cat._id ? (
                  <>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="h-10 w-1/2 rounded border px-3"
                      autoFocus
                    />
                    <input
                      type="color"
                      value={editedColor}
                      onChange={(e) => setEditedColor(e.target.value)}
                      className="h-10 w-12 rounded border"
                      aria-label="Pick color"
                    />
                    <button
                      onClick={handleSave}
                      className="h-10 rounded bg-teal px-3 text-sm text-white hover:opacity-90"
                      style={{ backgroundColor: "#90bede" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="h-10 rounded bg-gray-300 px-3 text-sm hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 truncate" style={{ color: cat.color }}>
                      {cat.name}
                    </span>
                    <button
                      onClick={() => startEdit(cat)}
                      className="h-10 rounded bg-blue-500 px-3 text-sm text-white hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(cat._id)}
                      className="h-10 rounded bg-red-500 px-3 text-sm text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
            {categories.length === 0 && (
              <li className="py-6 text-center text-sm text-gray-500">
                No categories yet.
              </li>
            )}
          </ul>

          {/* Footer (sticky on mobile) */}
          <div className="sticky bottom-0 z-10 border-t bg-white px-4 py-3 text-right">
            <Dialog.Close className="h-10 rounded bg-gray-100 px-3 text-sm hover:bg-gray-200">
              Close
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
