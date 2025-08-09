"use client";

import Image from "next/image";
import dayjs from "dayjs";
import { useState } from "react";
import { PersonWithBirthday } from "@/types";
import ErrorDialog from "./ErrorDialog";

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

  const handleDeleteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await onDelete();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setErrorOpen(true);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-50 bg-lavender p-4 pb-20 overflow-y-auto
        lg:static lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0 lg:pb-0 lg:overflow-visible
      "
      role="dialog"
      aria-modal="true"
    >
      {/* Error Dialog */}
      <ErrorDialog
        open={errorOpen}
        message={errorMessage}
        onClose={() => setErrorOpen(false)}
      />

      {/* Mobile top bar: Close + Name */}
      <div className="mb-4 grid grid-cols-[auto,1fr,auto] items-center lg:hidden">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="px-3 py-1 text-sm bg-blue-500 text-white font-bold rounded hover:bg-gray-300"
          aria-label="Close details"
        >
          Close
        </button>
        <h2 className="text-lg font-bold text-center px-2 truncate">
          {person.name}
        </h2>
        <div className="w-[68px]" />
      </div>

      {/* Desktop header with original top-right buttons (unchanged size) */}
      <div className="hidden lg:flex items-start mb-4 relative">
        <h2 className="text-xl font-bold absolute left-1/2 -translate-x-1/2">
          {person.name}
        </h2>
        <div className="ml-auto flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Details
          </button>
          <button
            onClick={handleDeleteClick}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Person
          </button>
        </div>
      </div>

      {/* Avatar */}
      <Image
        src={avatarUrl || "/default-avatar.png"}
        alt={person.name}
        width={96}
        height={96}
        className="w-52 h-52 rounded-full mb-4 border border-teal mx-auto"
      />

      <hr className="my-4 border-black" />

      {/* Details (tablet becomes flex column so we can push buttons down) */}
      <div className="text-gray-700 space-y-2 text-center md:flex md:flex-col md:min-h-[65vh]">
        {person.birthday && (() => {
          const birthday = dayjs(person.birthday);
          const today = dayjs().startOf("day");
          let birthdayThisYear = birthday.set("year", today.year()).startOf("day");
          if (birthdayThisYear.isBefore(today)) {
            birthdayThisYear = birthdayThisYear.add(1, "year");
          }
          const currentAge = today.diff(birthday, "year");
          const daysUntil = birthdayThisYear.diff(today, "day");
          const displayAge = daysUntil > 0 ? currentAge + 1 : currentAge;
          const formattedBirthday = birthday.format("MM/DD/YYYY");

          return (
            <>
              <p className="font-semibold text-black">
                {daysUntil === 0
                  ? `${person.name} is turning ${displayAge} today!`
                  : daysUntil === 1
                  ? `${person.name} is turning ${displayAge} tomorrow.`
                  : `${person.name} is turning ${displayAge} in ${daysUntil} days.`}
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
            <a className="text-blue-500 hover:underline" href={`mailto:${person.email}`}>
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

        {/* Spacer pushes tablet buttons further down (tablet only) */}
        <div className="hidden md:block flex-1" />

        {/* Tablet-only action row at bottom of content (side-by-side) */}
        <div className="hidden md:flex lg:hidden justify-center gap-4 mt-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Details
          </button>
          <button
            onClick={handleDeleteClick}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Person
          </button>
        </div>

        {/* Desktop close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="hidden lg:inline-block mt-4 px-3 py-1 text-sm bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>

      {/* Mobile bottom action bar (unchanged) */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center gap-4 p-4 bg-white border-t border-gray-300 md:hidden">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit Details
        </button>
        <button
          onClick={handleDeleteClick}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete Person
        </button>
      </div>
    </div>
  );
}
