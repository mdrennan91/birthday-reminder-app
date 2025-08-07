"use client";

import Image from "next/image";
import dayjs from "dayjs";
import { useState } from "react";
import { PersonWithBirthday } from "@/types";
import ErrorDialog from "./ErrorDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

type Props = {
  person: PersonWithBirthday;
  allCategories: { _id: string; name: string; color: string }[];
  avatarUrl: string | undefined;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onClose: () => void;
};

export default function PersonDetails({
  person,
  allCategories,
  avatarUrl,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete();
      setConfirmOpen(false); // close modal
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong.");
      setErrorOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Error Dialog */}
      <ErrorDialog
        open={errorOpen}
        message={errorMessage}
        onClose={() => setErrorOpen(false)}
      />

      {/* Confirmation Modal */}
      <DeleteConfirmationDialog
        open={confirmOpen}
        personName={person.name}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Header with name and buttons */}
      <div className="flex items-start mb-4 relative">
        <h2 className="text-xl font-bold absolute left-1/2 -translate-x-1/2">
          {person.name}
        </h2>
        <div className="space-x-2 ml-auto">
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Details
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Person
          </button>
        </div>
      </div>

      {/* Avatar image or fallback default */}
      <Image
        src={avatarUrl || "/default-avatar.png"}
        alt={person.name}
        width={96}
        height={96}
        className="w-52 h-52 rounded-full mb-4 border border-teal justify-center mx-auto"
      />

      <hr className="my-4 border-black" />

      {/* Person details: birthday, phone, email, etc. */}
      <div className="text-gray-700 space-y-2 text-center">
        
        {/* Custom birthday age logic */}

        {person.birthday && (() => {
          const birthday = dayjs(person.birthday);
          const today = dayjs();

          let birthdayThisYear = birthday.year(today.year());
          if (birthdayThisYear.isBefore(today, "day")) {
            birthdayThisYear = birthdayThisYear.add(1, "year");
          }

          const currentAge = today.diff(birthday, "year");
          const age = currentAge + 1;
          const daysUntil = birthdayThisYear.diff(today, "day");
          const formattedBirthday = birthday.format("MM/DD/YYYY");

          return (
            <>
              <p className="font-semibold text-black">

                {person.name} is turning {age} in {daysUntil === 0 ? "today!" : `${daysUntil} day${daysUntil !== 1 ? "s" : ""}`}.

              </p>
              <p>
                <strong>Birthday:</strong> {formattedBirthday}
              </p>
            </>
          );
        })()}

        {person.phone && (
          <p>
            <strong>Phone:</strong> {person.phone}
          </p>
        )}
        {person.email && (
          <p>
            <strong>Email:</strong>{" "}
            <a
              className="text-blue-500 hover:underline"
              href={`mailto:${person.email}`}
            >
              {person.email}
            </a>
          </p>
        )}
        {person.address && (
          <p>
            <strong>Address:</strong>{" "}
            <a
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${person.address}`}
            >
              {person.address}
            </a>
          </p>
        )}
        {person.notes && (
          <p>
            <strong>Notes:</strong> {person.notes}
          </p>
        )}

        {/* Tag display if the person has categories */}
        {person.categories && person.categories.length > 0 && (
          <div className="mt-4">
            <strong>Tags:</strong>
            <div className="flex flex-wrap gap-2 mt-1 justify-center">
              {person.categories.map((catRef) => {
                const matching = allCategories.find((c) => c._id === catRef._id);
                return (
                  <span
                    key={catRef._id}
                    className="px-2 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: matching?.color || "#888" }}
                  >
                    {matching?.name || "Unknown"}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 px-3 py-1 text-sm bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}
