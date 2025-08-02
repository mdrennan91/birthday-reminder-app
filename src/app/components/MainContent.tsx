"use client"; // Enables client-side rendering

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import { useSession } from "next-auth/react";

import { Person, PersonWithBirthday } from "@/types";
import { addBirthdayThisYear } from "@/lib/helper/addBirthdayThisYear";
import { sortByUpcoming } from "@/lib/sorting/sortByUpcoming";
import { sortPinnedFirst } from "@/lib/sorting/sortPinnedFirst";
import { groupByMonth } from "@/lib/sorting/groupByMonth";
import { fetchBirthdays } from "@/lib/api/fetchBirthdays";
import { deleteBirthday } from "@/lib/api/deleteBirthday";
import { refreshPeople } from "@/lib/api/refreshPeople";
import AddBirthdayModal from "./AddEditBirthdayModal";
import { updatePinnedStatus } from "@/lib/api/updatePinnedStatus";
import { useSignedAvatars } from "@/lib/helper/useSignedAvatars";
import PersonDetails from "./PersonDetails";

// Extend dayjs with isToday plugin
dayjs.extend(isToday);

// Custom DOM event name for category filtering
const CATEGORY_FILTER_EVENT = "filter-category";

export default function MainContent() {
  const { status } = useSession();

  // === State ===
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] =
    useState<PersonWithBirthday | null>(null);
  const [displayCount, setDisplayCount] = useState(4);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [allCategories, setAllCategories] = useState<
    { _id: string; name: string; color: string }[]
  >([]);
  const [allPeople, setAllPeople] = useState<Person[]>([]); // Full source list
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Avatar mapping by person ID
  const avatarUrls = useSignedAvatars(people);
  const today = dayjs();

  // === Effects ===

  // Fetch people after login
  useEffect(() => {
    if (status === "authenticated") {
      fetchBirthdays().then((birthdays) => {
        setAllPeople(birthdays);
        setPeople(birthdays);
      }).catch(console.error);
    }
  }, [status]);

  // Handle category filter event from sidebar
  useEffect(() => {
    const handleCategoryFilter = (e: CustomEvent) => {
      setActiveCategory(e.detail);
    };

    window.addEventListener(
      CATEGORY_FILTER_EVENT,
      handleCategoryFilter as EventListener
    );
    return () => {
      window.removeEventListener(
        CATEGORY_FILTER_EVENT,
        handleCategoryFilter as EventListener
      );
    };
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setAllCategories(data);
      }
    }

    if (status === "authenticated") {
      fetchCategories();
    }
  }, [status]);

  // Listen for "categoryUpdated" event and refresh the list
  useEffect(() => {
    const handleCategoryUpdate = () => {
      fetch("/api/categories")
        .then((res) => res.json())
        .then(setAllCategories)
        .catch(console.error);
    };

    window.addEventListener("categoryUpdated", handleCategoryUpdate);
    return () => {
      window.removeEventListener("categoryUpdated", handleCategoryUpdate);
    };
  }, []);

  // === Computed Data ===

  // Add derived `birthdayThisYear` field to people
  const peopleWithBirthday = useMemo(() => {
    return addBirthdayThisYear(people, today);
  }, [people, today]);

  // Filter/sort for upcoming birthdays in active category
  const upcoming = useMemo(() => {
    return sortByUpcoming({
      people: peopleWithBirthday,
      today,
      activeCategory,
      displayCount,
    });
  }, [peopleWithBirthday, today, activeCategory, displayCount]);

  // Ensure pinned birthdays appear at the top
  const combinedList = useMemo(() => {
    return sortPinnedFirst(upcoming);
  }, [upcoming]);


  // Group by month for visual grouping
  const groupedByMonth = useMemo(() => {
    return groupByMonth(combinedList);
  }, [combinedList]);

  // === Handlers ===

  // Handle deleting a selected birthday
  const handleDelete = async () => {
    if (!selectedPerson) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedPerson.name}?`
    );
    if (!confirmed) return;

    try {
      await deleteBirthday(selectedPerson._id);
      await refreshPeople(setPeople);
      setSelectedPerson(null);
    } catch (err) {
      console.error("Error deleting birthday:", err);
      alert("Failed to delete birthday.");
    }
  };

  // === Conditional Rendering ===

  if (status === "unauthenticated") {
    return null; // Hide content until login
  }

  if (status === "loading") {
    return <div className="p-4 text-center">Loading...</div>;
  }

  // === Render ===

  return (
    <main className="flex flex-1 overflow-hidden">
      {/* Left Column: List View */}
      <section className="w-1/2 p-4 border-r border-teal overflow-y-auto bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Upcoming Birthdays</h2>
          <div>
            {/* Search Bar that filters people, return original list if empty, utilize setTimeout to prevent constant calls*/}
            <input
              type="text"
              placeholder="Search..."
              className="border p-1 text-sm rounded"
              onChange={(e) => {
                const query = e.target.value.toLowerCase();
                if (timeoutId) {
                  clearTimeout(timeoutId);
                }
                const newTimeout = setTimeout(() => {
                  if (query === "") {
                    setPeople(allPeople);
                    return;
                  }
                  const filtered = allPeople.filter((person) =>
                    person.name.toLowerCase().includes(query)
                  );
                  if (filtered.length > 0) {
                    setPeople(filtered);
                  } else {
                    alert("No results found.");
                    e.target.value = "";
                    setPeople(allPeople);
                  }
                }, 1000);
                setTimeoutId(newTimeout);
              }}
            />
          </div>
          {/* Select count of birthdays to display */}
          <select
            className="border p-1 text-sm rounded"
            value={displayCount}
            onChange={(e) => setDisplayCount(Number(e.target.value))}
          >
            {[4, 6, 8, 10].map((n) => (
              <option key={n} value={n}>
                {n} shown
              </option>
            ))}
          </select>

          {/* Open add birthday modal */}
          <button
            onClick={() => {
              setIsEditing(false);
              setSelectedPerson(null);
              setShowAddForm(true);
            }}
            className="px-3 py-1 text-sm bg-teal text-white rounded hover:bg-teal/80"
          >
            + Add Birthday
          </button>
        </div>

        {/* No people found */}
        {combinedList.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">
            No birthdays found in this category.
          </div>
        ) : (
          // Render birthdays grouped by month
          Object.entries(groupedByMonth).map(([month, peopleInMonth]) => (
            <div key={month} className="mb-6">
              <h3 className="text-md font-bold text-teal mb-2">{month}</h3>
              <ul key={displayCount} className="space-y-4">
                {peopleInMonth.map((person) => {
                  const age = person.birthdayThisYear.diff(
                    dayjs(person.birthday),
                    "year"
                  );
                  const daysUntil = person.birthdayThisYear.diff(today, "day");
                  const daysLabel = person.birthdayThisYear.isToday()
                    ? "Today"
                    : `${daysUntil} days`;

                  return (
                    <li
                      key={person._id}
                      className="border border-teal rounded p-4 flex items-center justify-between cursor-pointer hover:bg-teal/5"
                      onClick={() => setSelectedPerson(person)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Pin checkbox */}
                        <input
                          type="checkbox"
                          checked={person.pinned ?? false}
                          onChange={async (e) => {
                            e.stopPropagation();
                            const newPinned = e.target.checked;
                            try {
                              await updatePinnedStatus(person._id, newPinned);
                        {/* Avatar image */}
                              await refreshPeople(setPeople); // reload people from DB
                            } catch (err) {
                              console.error(
                                "Failed to update pinned state:",
                                err
                              );
                            }
                          }}
                        />
                        <Image
                          src={avatarUrls[person._id] || "/default-avatar.png"}
                          alt={person.name}
                          width={40}
                          height={40}
                          className="rounded-full border border-teal"
                        />
                        <div className="text-left">
                          <div className="font-semibold">{person.name}</div>
                          {/* Category badges */}
                          <div className="text-sm text-gray-600">
                            Age: {age}
                          </div>
                          {person.categories &&
                            person.categories.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {person.categories.map((catRef) => {
                                  const matching = allCategories.find(
                                    (c) => c._id === catRef._id
                                  );
                                  return (
                                    <span
                                      key={catRef._id}
                                      className="px-1.5 py-0.5 rounded text-white text-xs font-medium"
                                      style={{
                                        backgroundColor:
                                          matching?.color || "#888",
                                      }}
                                    >
                                      {matching?.name || "Unknown"}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-teal font-semibold">
                          {person.birthdayThisYear.format("MMM D")}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-700">
                        {daysLabel}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </section>

      {/* Right Column: Person Details */}
      <section className="w-1/2 p-4 overflow-y-auto bg-lavender">
        {selectedPerson ? (
          <PersonDetails
            person={selectedPerson}
            allCategories={allCategories}
            avatarUrl={avatarUrls[selectedPerson._id]}
            onEdit={() => {
              setIsEditing(true);
              setShowAddForm(true);
            }}
            onDelete={handleDelete}
          />
        ) : (
          <p className="text-gray-600">
            Select a person to view their details.
          </p>
        )}
      </section>

      {/* Modal for adding or editing birthdays */}
      <AddBirthdayModal
        show={showAddModal}
        onClose={() => {
          setShowAddForm(false);
          setIsEditing(false);
        }}
        onRefresh={async () => {
          await refreshPeople(setPeople);
        }}
        personToEdit={isEditing ? selectedPerson : null}
        onUpdated={(updatedPerson) => {
          setSelectedPerson(updatedPerson); // Refresh details panel if person is updated
        }}
      />
    </main>
  );
}
