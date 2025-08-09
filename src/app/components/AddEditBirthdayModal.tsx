"use client";

import { useState } from "react";
import { PersonWithBirthday } from "@/types";
import AddBirthdayForm from "./AddBirthdayForm";
import AvatarUploadDialog from "./AvatarUploadDialog";

interface AddBirthdayModalProps {
  show: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  personToEdit?: PersonWithBirthday | null;
  onUpdated?: (updatedPerson: PersonWithBirthday) => void;
}

export default function AddBirthdayModal({
  show,
  onClose,
  onRefresh,
  personToEdit = null,
  onUpdated,
}: AddBirthdayModalProps) {
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);
  const [personIdForUpload, setPersonIdForUpload] = useState<string | null>(null);

  const handleUploadComplete = async () => {
    await onRefresh();
    setShowUploadPrompt(false);
    setPersonIdForUpload(null);
    onClose();
  };

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div
          className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 max-w-lg w-full focus:outline-none"
          role="dialog"
          aria-modal="true"
          aria-label={personToEdit ? "Edit Birthday" : "Add Birthday"}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 md:p-8 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">
              {personToEdit ? "Edit Birthday" : "Add Birthday"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-300 text-red-600 hover:bg-red-50"
              aria-label="Close"
              title="Close"
            >
              <span className="text-2xl font-bold leading-none">×</span>
            </button>

          </div>

          {/* Content */}
          <div className="p-6 md:p-8 pt-6">
            <AddBirthdayForm
              onClose={onClose}
              refreshPeople={onRefresh}
              personToEdit={personToEdit}
              onUpdated={(person) => {
                onUpdated?.(person);
                setPersonIdForUpload(person._id);
                setShowUploadPrompt(false);
              }}
            />
          </div>
        </div>
      </div>

      {/* (Optional) nested upload dialog if you use it here */}
      {showUploadPrompt && personIdForUpload && (
        <AvatarUploadDialog
          personId={personIdForUpload}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </>
  );
}
