"use client";

import { PersonWithBirthday } from "@/types";
import AddBirthdayForm from "./AddBirthdayForm";

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
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
      <div
        className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 w-full max-w-xl focus:outline-none"
        role="dialog"
        aria-modal="true"
        aria-label={personToEdit ? "Edit Birthday" : "Add Birthday"}
      >
        {/* Header with bold red close button */}
        <div className="flex items-center justify-between p-6 md:p-8 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">
            {personToEdit ? "Edit Birthday" : "Add Birthday"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-300 text-red-600 hover:bg-red-50"
            aria-label="Close"
            title="Close"
          >
            <span className="text-2xl font-bold leading-none">×</span>
          </button>

        </div>

        {/* Form content */}
        <div className="p-6 md:p-8 pt-6">
          <AddBirthdayForm
            onClose={onClose}
            refreshPeople={onRefresh}
            personToEdit={personToEdit}
            onUpdated={onUpdated}
          />
        </div>
      </div>
    </div>
  );
}
