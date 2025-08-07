"use client";

import { useState } from "react";
import { PersonWithBirthday } from "@/types";
import AddBirthdayForm from "./AddBirthdayForm";
import AvatarUploadDialog from "./AvatarUploadDialog";

/**
 * Props for the AddBirthdayModal component.
 */
interface AddBirthdayModalProps {
  show: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  personToEdit?: PersonWithBirthday | null;
  onUpdated?: (updatedPerson: PersonWithBirthday) => void;
}

/**
 * A modal wrapper for the AddBirthdayForm, with optional avatar upload.
 */
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
      {/* Main modal for adding/editing birthday */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div
          className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full focus:outline-none"
          role="dialog"
          aria-modal="true"
          aria-label={personToEdit ? "Edit Birthday" : "Add Birthday"}
        >
          <h2 className="text-xl font-bold mb-4">
            {personToEdit ? "Edit Birthday" : "Add Birthday"}
          </h2>
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

      {/* Nested modal for avatar upload */}
      {showUploadPrompt && personIdForUpload && (
        <AvatarUploadDialog
          personId={personIdForUpload}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </>
  );
}
