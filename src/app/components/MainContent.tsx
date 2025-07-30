"use client";

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

dayjs.extend(isToday);

const CATEGORY_FILTER_EVENT = "filter-category";

export default function MainContent() {
  const { status } = useSession();
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<PersonWithBirthday | null>(null);
  const [displayCount, setDisplayCount] = useState(4);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [allCategories, setAllCategories] = useState<
    { _id: string; name: string; color: string }[]
  >([]);

  const today = dayjs();

  useEffect(() => {
    if (status === "authenticated") {
      fetchBirthdays()
        .then(setPeople)
        .catch(console.error);
    }
  }, [status]);

  useEffect(() => {
    const handleCategoryFilter = (e: CustomEvent) => {
      setActiveCategory(e.detail);
    };

    window.addEventListener(CATEGORY_FILTER_EVENT, handleCategoryFilter as EventListener);
    return () => {
      window.removeEventListener(CATEGORY_FILTER_EVENT, handleCategoryFilter as EventListener);
    };
  }, []);

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

  const peopleWithBirthday = useMemo(() => {
    return addBirthdayThisYear(people, today);
  }, [people, today]);

  const upcoming = useMemo(() => {
    return sortByUpcoming({
      people: peopleWithBirthday,
      today,
      pinnedIds,
      activeCategory,
      displayCount,
    });
  }, [peopleWithBirthday, today, pinnedIds, activeCategory, displayCount]);

  const combinedList = useMemo(() => {
    return sortPinnedFirst(upcoming, pinnedIds);
  }, [upcoming, pinnedIds]);

  const groupedByMonth = useMemo(() => {
    return groupByMonth(combinedList);
  }, [combinedList]);

  const handleDelete = async () => {
    if (!selectedPerson) return;

    const confirmed = confirm(`Are you sure you want to delete ${selectedPerson.name}?`);
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

  return (
    <main className="flex flex-1 overflow-hidden">
      <section className="w-1/2 p-4 border-r border-teal overflow-y-auto bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Upcoming Birthdays</h2>
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
          <button
            onClick={() => {
              setIsEditing(false);
              setSelectedPerson(null);
              setShowAddForm(true);
            }}
            className="px-3 py-1 text-sm bg-teal text-white rounded hover:bg-teal/80"
          >
            Add Birthday
          </button>
        </div>

        {combinedList.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">
            No birthdays found in this category.
          </div>
        ) : (
          Object.entries(groupedByMonth).map(([month, peopleInMonth]) => (
            <div key={month} className="mb-6">
              <h3 className="text-md font-bold text-teal mb-2">{month}</h3>
              <ul className="space-y-4">
                {peopleInMonth.map((person) => {
                  const age = person.birthdayThisYear.diff(dayjs(person.birthday), "year");
                  const daysUntil = person.birthdayThisYear.diff(today, "day");
                  const daysLabel = person.birthdayThisYear.isToday() ? "Today" : `${daysUntil} days`;

                  return (
                    <li
                      key={person._id}
                      className="border border-teal rounded p-4 flex items-center justify-between cursor-pointer hover:bg-teal/5"
                      onClick={() => setSelectedPerson(person)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={pinnedIds.includes(person._id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            setPinnedIds((prev) =>
                              prev.includes(person._id)
                                ? prev.filter((id) => id !== person._id)
                                : [...prev, person._id]
                            );
                          }}
                        />
                        <Image
                          src={person.avatarUrl || "/default-avatar.png"}
                          alt={person.name}
                          width={40}
                          height={40}
                          className="rounded-full border border-teal"
                        />
                        <div className="text-left">
                          <div className="font-semibold">{person.name}</div>
                          <div className="text-sm text-gray-600">Age: {age}</div>
                          {person.categories && person.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {person.categories.map((catRef) => {
                                const matching = allCategories.find((c) => c._id === catRef._id);
                                return (
                                  <span
                                    key={catRef._id}
                                    className="px-1.5 py-0.5 rounded text-white text-xs font-medium"
                                    style={{ backgroundColor: matching?.color || "#888" }}
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
                      <div className="text-right text-sm text-gray-700">{daysLabel}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </section>

      <section className="w-1/2 p-4 overflow-y-auto bg-lavender">
        {selectedPerson ? (
          <div>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{selectedPerson.name}</h2>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowAddForm(true);
                  }}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            <Image
              src={selectedPerson.avatarUrl || "/default-avatar.png"}
              alt={selectedPerson.name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full mb-4 border border-teal"
            />
            <div className="text-gray-700 space-y-2">
              <p>
                <strong>Birthday:</strong> {selectedPerson.birthday}
              </p>
              <p>
                <strong>Phone:</strong> {selectedPerson.phone}
              </p>
              <p>
                <strong>Email:</strong> {selectedPerson.email}
              </p>
              <p>
                <strong>Address:</strong> {selectedPerson.address}
              </p>
              <p>
                <strong>Notes:</strong> {selectedPerson.notes}
              </p>

              {selectedPerson.categories && selectedPerson.categories.length > 0 && (
                <div className="mt-4">
                  <strong>Tags:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedPerson.categories.map((catRef) => {
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
        ) : (
          <p className="text-gray-600">Select a person to view their details.</p>
        )}
      </section>

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
          setSelectedPerson(updatedPerson); // ✅ this will refresh the details pane
        }}
      />
    </main>
  );
}
