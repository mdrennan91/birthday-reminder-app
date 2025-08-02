"use client"; // Enables client-side rendering in a Next.js 13+ app using the App Router

import Image from "next/image";
import { PersonWithBirthday } from "@/types";

// Define the expected props for the component
type Props = {
  person: PersonWithBirthday; // The person whose details are displayed
  allCategories: { _id: string; name: string; color: string }[]; // All available categories/tags for lookup
  avatarUrl: string | undefined; // URL of the person's avatar image
  onEdit: () => void; // Callback for the Edit button
  onDelete: () => void; // Callback for the Delete button
};

// Component to display detailed information about a person
export default function PersonDetails({
  person,
  allCategories,
  avatarUrl,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div>
      {/* Header with person's name and action buttons */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold">{person.name}</h2>

        {/* Edit and Delete buttons */}
        <div className="space-x-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Avatar image or fallback default */}
      <Image
        src={avatarUrl || "/default-avatar.png"}
        alt={person.name}
        width={96}
        height={96}
        className="w-24 h-24 rounded-full mb-4 border border-teal"
      />

      {/* Person details: birthday, phone, email, etc. */}
      <div className="text-gray-700 space-y-2">
        <p>
          <strong>Birthday:</strong> {person.birthday}
        </p>
        <p>
          <strong>Phone:</strong> {person.phone}
        </p>
        <p>
          <strong>Email:</strong> {person.email}
        </p>
        <p>
          <strong>Address:</strong> {person.address}
        </p>
        <p>
          <strong>Notes:</strong> {person.notes}
        </p>

        {/* Tag display if the person has categories */}
        {person.categories && person.categories.length > 0 && (
          <div className="mt-4">
            <strong>Tags:</strong>
            <div className="flex flex-wrap gap-2 mt-1">
              {/* Render each tag with its color and name */}
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
      </div>
    </div>
  );
}
