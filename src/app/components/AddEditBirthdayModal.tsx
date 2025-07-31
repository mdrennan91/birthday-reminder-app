"use client";

import { PersonWithBirthday } from "@/types";
import AddBirthdayForm from "./AddBirthdayForm";

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
 * A modal wrapper for the AddBirthdayForm.
 */
export default function AddBirthdayModal({
  show,
  onClose,
  onRefresh,
  personToEdit = null,
  onUpdated,
}: AddBirthdayModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <AddBirthdayForm
          onClose={onClose}
          refreshPeople={onRefresh}
          personToEdit={personToEdit}
          onUpdated={onUpdated}
        />
      </div>
    </div>
  );
}
