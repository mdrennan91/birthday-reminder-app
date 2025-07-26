"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useSession } from "next-auth/react";
import AddBirthdayForm from "./AddBirthdayForm";


// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isSameOrAfter);

// Updated: category is now an array
interface Person {
  _id: string;
  name: string;
  birthday: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  userId: string;
  avatarUrl: string;
  categories: string[];
}

const CATEGORY_FILTER_EVENT = "filter-category";

export default function MainContent() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [displayCount, setDisplayCount] = useState(4);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false); 
  const { status } = useSession();
  const [isEditing, setIsEditing] = useState(false);

  const fetchBirthdays = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const response = await fetch("/api/birthdays");
      if (!response.ok) throw new Error("Failed to load birthdays");

      const rawData = await response.json();
      const normalized = rawData.map((person: Partial<Person>) => ({
        ...person,
        categories: Array.isArray(person.categories)
          ? person.categories
          : typeof person.categories === "string"
          ? [person.categories]
          : [],
      }));

      setPeople(normalized);
    } catch (error) {
      console.error("Error loading birthdays:", error);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBirthdays();
    }

    const handleCategoryFilter = (e: CustomEvent) => {
      setActiveCategory(e.detail);
    };

    window.addEventListener(CATEGORY_FILTER_EVENT, handleCategoryFilter as EventListener);
    return () => {
      window.removeEventListener(CATEGORY_FILTER_EVENT, handleCategoryFilter as EventListener);
    };
  }, [status, fetchBirthdays]);


  
  const today = dayjs();

  const pinnedPeople = useMemo(() => {
    return people
      .filter(p => pinnedIds.includes(p._id))
      .map(person => {
        let birthdayThisYear = dayjs(person.birthday).set("year", today.year());
        if (birthdayThisYear.isBefore(today, "day")) {
          birthdayThisYear = birthdayThisYear.add(1, "year");
        }
        return { ...person, birthdayThisYear };
      })
      .sort((a, b) => a.birthdayThisYear.diff(b.birthdayThisYear));
  }, [people, pinnedIds, today]);

  const upcoming = useMemo(() => {
    return people
      .filter(p => !pinnedIds.includes(p._id))
      .filter(p => {
        return !activeCategory || (
          Array.isArray(p.categories) &&
          p.categories.some(cat =>
            typeof cat === "string" &&
            cat.toLowerCase() === activeCategory.toLowerCase()
          )
        );
      })
      .map(person => {
        let birthdayThisYear = dayjs(person.birthday).set("year", today.year());
        if (birthdayThisYear.isBefore(today, "day")) {
          birthdayThisYear = birthdayThisYear.add(1, "year");
        }
        return { ...person, birthdayThisYear };
      })
      .sort((a, b) => a.birthdayThisYear.diff(b.birthdayThisYear))
      .slice(0, displayCount);
  }, [people, pinnedIds, activeCategory, displayCount, today]);

  const combinedList = [...pinnedPeople, ...upcoming];

  const handleDelete = async () => {
    if (!selectedPerson) return;

    const confirmed = confirm(`Are you sure you want to delete ${selectedPerson.name}?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/birthdays/${selectedPerson._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete birthday");
      }

      await fetchBirthdays();         // Refresh the list
      setSelectedPerson(null);       // Deselect the person
    } catch (err) {
      console.error("Error deleting birthday:", err);
      alert("Failed to delete birthday.");
    }
  };


  const grouped = combinedList.reduce((acc, person) => {
    const month = person.birthdayThisYear.format("MMMM");
    if (!acc[month]) acc[month] = [];
    acc[month].push(person);
    return acc;
  }, {} as Record<string, (Person & { birthdayThisYear: dayjs.Dayjs })[]>);

  const monthOrder = {
    January: 0, February: 1, March: 2, April: 3,
    May: 4, June: 5, July: 6, August: 7,
    September: 8, October: 9, November: 10, December: 11,
  };

  const orderedMonths = Object.keys(grouped).sort(
  (a, b) => monthOrder[a as keyof typeof monthOrder] - monthOrder[b as keyof typeof monthOrder]
  );

  if (status === "unauthenticated") {
    return null; // Don’t show anything if not logged in
  }
  

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
            {[4, 6, 8, 10].map(n => (
              <option key={n} value={n}>{n} shown</option>
            ))}
          </select>
        </div>

        {/* Add Birthday Button */}
        <button
          onClick={() => {
            setIsEditing(false);
            setSelectedPerson(null);
            setShowAddForm(true);
          }}
          className="mb-4 px-4 py-2 bg-teal text-white rounded hover:bg-teal/40"
        >
          + Add Birthday
        </button>


          {/*  Show empty state if no results */}
          {orderedMonths.length === 0 && (
            <div className="text-center text-gray-600 mt-10">
              No birthdays found in this category.
            </div>
          )}

        {orderedMonths.map(month => (
          <div key={month} className="mb-6">
            <h3 className="text-md font-bold text-teal mb-2">{month}</h3>
            <ul className="space-y-4">
              {grouped[month].map(person => {
                const age = person.birthdayThisYear.diff(dayjs(person.birthday), "year");
                const daysUntil = person.birthdayThisYear.diff(today, "day");
                const daysLabel = person.birthdayThisYear.isToday() ? "Today" : `${daysUntil} days`;

                return (
                  <li
                    key={person._id}
                    className="border border-teal rounded p-4 flex items-center justify-between cursor-pointer hover:bg-teal/50"
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
                              ? prev.filter(id => id !== person._id)
                              : [...prev, person._id]
                          );
                        }}
                      />
                      {person.avatarUrl ? (
                        <Image
                          src={person.avatarUrl}
                          alt={person.name}
                          width={80}
                          height={80}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-[80px] h-[80px] rounded-full bg-gray-700 text-white flex items-center justify-center">
                          N/A
                        </div>
                      )}
                      <div className="text-left">
                        <div className="font-semibold">{person.name}</div>
                        <div className="text-sm text-gray-600">Age: {age}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-teal/90 font-extrabold">{person.birthdayThisYear.format("MMM D")}</div>
                    </div>
                    <div className="text-right text-sm text-gray-700">
                      {daysLabel}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <section className="w-1/2 p-4 overflow-y-auto bg-lavender">
        {selectedPerson ? (
          <div>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-black">{selectedPerson.name}</h2>
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
            {selectedPerson.avatarUrl ? (
              <Image
                src={selectedPerson.avatarUrl}
                alt={selectedPerson.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full mb-4 border border-teal"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mb-4 border border-teal bg-gray-700 text-white flex items-center justify-center">
                N/A
              </div>
            )}
            <div className="text-gray-700 space-y-2">
              <p><strong>Birthday:</strong> {dayjs(selectedPerson.birthday).format("MM-DD-YYYY")}</p>
              <p><strong>Phone:</strong> {selectedPerson.phone}</p>
              <p><strong>Email:</strong> {selectedPerson.email}</p>
              <p><strong>Address:</strong> {selectedPerson.address}</p>
              <p><strong>Notes:</strong> {selectedPerson.notes}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Select a person to view their details.</p>
        )}
      </section>
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <AddBirthdayForm
              onClose={() => {
                setShowAddForm(false);
                setIsEditing(false);
              }}
              refreshPeople={fetchBirthdays}
              personToEdit={isEditing ? selectedPerson : null}
            />
          </div>
        </div>
      )}
    </main>
  );
}
