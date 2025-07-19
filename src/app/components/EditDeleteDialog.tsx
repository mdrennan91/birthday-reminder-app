"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

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

  const startEdit = (category: CategoryType) => {
    setEditingId(category._id);
    setEditedName(category.name);
    setEditedColor(category.color);
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
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed z-50 bg-white p-6 rounded-lg shadow-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md">
          <Dialog.Title className="text-lg font-bold mb-4">Edit or Delete Categories</Dialog.Title>
          <ul className="space-y-4">
            {categories.map((cat) => (
              <li key={cat._id} className="flex items-center gap-2">
                {editingId === cat._id ? (
                  <>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="border p-1 rounded w-1/2"
                    />
                    <input
                      type="color"
                      value={editedColor}
                      onChange={(e) => setEditedColor(e.target.value)}
                      className="w-10 h-6"
                    />
                    <button
                      onClick={handleSave}
                      className="text-sm bg-teal text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-sm bg-gray-300 px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      className="flex-1 truncate"
                      style={{ color: cat.color }}
                    >
                      {cat.name}
                    </span>
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-sm bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(cat._id)}
                      className="text-sm bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <Dialog.Close className="mt-4 text-sm text-blue-600 hover:underline">Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
