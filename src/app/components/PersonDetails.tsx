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

  const btnBase =
    "inline-flex items-center justify-center h-9 px-3 text-sm font-medium rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const btnPrimary = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300`;
  const btnDanger = `${btnBase} bg-red-600 text-white hover:bg-red-700 focus:ring-red-300`;
  const btnGhostDanger = `${btnBase} border border-red-400 text-red-600 hover:bg-red-50 focus:ring-red-200`;

  return (
    <div className="h-full flex flex-col
      bg-white border border-black/10 shadow-sm rounded-xl mx-auto max-w-[560px]
      lg:bg-transparent lg:border-0 lg:shadow-none lg:rounded-none lg:max-w-none">
      <ErrorDialog open={errorOpen} message={errorMessage} onClose={() => setErrorOpen(false)} />

      {/* Header: actions on the right; name centered on its own row */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 justify-center lg:justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className={btnPrimary}
          >
            Edit Details
          </button>

          <button onClick={handleDeleteClick} className={btnDanger}>
            Delete Person
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close details"
            title="Close"
            className={`${btnGhostDanger.replace("text-sm", "")} text-2xl leading-none`}
          >
            ×
          </button>
        </div>

        <h2 className="text-xl font-semibold text-center mt-2">{person.name}</h2>
      </div>

      {/* Body (desktop: no scroll; mobile/tablet: allow scroll if needed) */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto md:overflow-y-auto lg:overflow-visible">
        {/* Avatar */}
        <Image
          src={avatarUrl || "/default-avatar.png"}
          alt={person.name}
          width={192}
          height={192}
          className="w-48 h-48 rounded-full mb-4 border border-teal mx-auto"
        />

        <hr className="my-4 border-black/10 lg:border-black/20" />

        {/* Facts */}
        <div className="text-gray-800 text-left lg:text-center space-y-2">
          {person.birthday &&
            (() => {
              const birthday = dayjs(person.birthday);
              const today = dayjs().startOf("day");
              let birthdayThisYear = birthday.set("year", today.year()).startOf("day");
              if (birthdayThisYear.isBefore(today)) birthdayThisYear = birthdayThisYear.add(1, "year");

              const currentAge = today.diff(birthday, "year");
              const daysUntil = birthdayThisYear.diff(today, "day");
              const displayAge = daysUntil > 0 ? currentAge + 1 : currentAge;
              const formattedBirthday = birthday.format("MM/DD/YYYY");

              return (
                <>
                  <p className="font-semibold">
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
              <a className="text-blue-700 hover:underline" href={`mailto:${person.email}`}>
                {person.email}
              </a>
            </p>
          )}
          {person.address && (
            <p>
              <strong>Address:</strong>{" "}
              <a
                className="text-blue-700 hover:underline"
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

          {!!person.categories?.length && (
            <div className="mt-4">
              <strong>Tags:</strong>
              <div className="flex flex-wrap gap-2 mt-1 justify-center">
                {person.categories.map((catRef) => {
                  const match = allCategories.find((c) => c._id === catRef._id);
                  return (
                    <span
                      key={catRef._id}
                      className="px-2 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: match?.color || "#888" }}
                    >
                      {match?.name || "Unknown"}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}