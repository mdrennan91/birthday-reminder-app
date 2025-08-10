"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
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
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import ErrorDialog from "./ErrorDialog";
import { Search, ChevronDown } from "lucide-react";


dayjs.extend(isToday);

const CATEGORY_FILTER_EVENT = "filter-category";

const LazyImage = dynamic(() => import("next/image"), {
  loading: () => <div>Loading...</div>,
});

export default function MainContent() {
  const { status } = useSession();
  const [today, setToday] = useState<dayjs.Dayjs | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<PersonWithBirthday | null>(null);
  const [displayCount, setDisplayCount] = useState<number | "all">(4);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [allCategories, setAllCategories] = useState<{ _id: string; name: string; color: string }[]>([]);
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [searchError, setSearchError] = useState(""); // inline search error

  const avatarUrls = useSignedAvatars(people);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);

  useEffect(() => {
    setToday(dayjs());
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBirthdays()
        .then((birthdays) => {
          setAllPeople(birthdays);
          setPeople(birthdays);
        })
        .catch(console.error);
    }
  }, [status]);

  useEffect(() => {
    const handleCategoryFilter = (e: CustomEvent) => setActiveCategory(e.detail);
    window.addEventListener(CATEGORY_FILTER_EVENT, handleCategoryFilter as EventListener);
    return () => window.removeEventListener(CATEGORY_FILTER_EVENT, handleCategoryFilter as EventListener);
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setAllCategories(data);
      }
    }
    if (status === "authenticated") fetchCategories();
  }, [status]);

  useEffect(() => {
    const handleCategoryUpdate = () => {
      fetch("/api/categories")
        .then((res) => res.json())
        .then(setAllCategories)
        .catch(console.error);
    };
    window.addEventListener("categoryUpdated", handleCategoryUpdate);
    return () => window.removeEventListener("categoryUpdated", handleCategoryUpdate);
  }, []);

  const todaySafe = useMemo(() => today ?? dayjs(), [today]);
  const peopleWithBirthday = useMemo(() => addBirthdayThisYear(people, todaySafe), [people, todaySafe]);

  const upcoming = useMemo(() => {
    return sortByUpcoming({
      people: peopleWithBirthday,
      today: today ?? dayjs(),
      activeCategory,
      displayCount: displayCount === "all" ? undefined : displayCount,
    });
  }, [peopleWithBirthday, today, activeCategory, displayCount]);

  const combinedList = useMemo(() => sortPinnedFirst(upcoming), [upcoming]);
  const groupedByMonth = useMemo(() => groupByMonth(combinedList), [combinedList]);

  const requestDelete = async (): Promise<void> => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedPerson) return;
    setIsDeleting(true);
    try {
      await deleteBirthday(selectedPerson._id);
      await refreshPeople(setPeople);
      setSelectedPerson(null);
    } catch (err) {
      console.error("Error deleting birthday:", err);
      setErrorMessage("Failed to delete birthday.");
      setErrorOpen(true);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (!today) return null;
  if (status === "unauthenticated") return null;
  if (status === "loading") return <div className="p-4 text-center">Loading...</div>;

  return (
    <main className="flex flex-1 overflow-hidden flex-col lg:flex-row">
      {/* Left Column (list) */}
      <section
        className={`w-full lg:w-1/2 p-4 border-r border-teal overflow-y-auto bg-white
          ${selectedPerson ? "hidden lg:block" : "block"}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold">Upcoming Birthdays</h2>

          <div className="flex items-center gap-3 ml-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-56 pl-9 pr-3 rounded-md border border-gray-300 bg-white shadow-sm
                          text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                onChange={(e) => {
                  const query = e.target.value.toLowerCase();
                  if (timeoutId) clearTimeout(timeoutId);
                  const newTimeout = setTimeout(() => {
                    if (query === "") {
                      setPeople(allPeople);
                      setSearchError("");
                      return;
                    }
                    const filtered = allPeople.filter((p) => p.name.toLowerCase().includes(query));
                    if (filtered.length > 0) {
                      setPeople(filtered);
                      setSearchError("");
                    } else {
                      setSearchError("No results found.");
                      setPeople(allPeople);
                    }
                  }, 1000);
                  setTimeoutId(newTimeout);
                }}
              />
              <span
                aria-live="polite"
                className={`absolute -bottom-5 left-0 text-xs transition-opacity duration-200
                  ${searchError ? "opacity-100 text-red-600" : "opacity-0 text-transparent"}`}
              >
                {searchError || "placeholder"}
              </span>
            </div>

            {/* Show N dropdown */}
            <div className="relative">
              <label htmlFor="display-count" className="sr-only">Number to show</label>
              <select
                id="display-count"
                className="h-9 appearance-none pl-3 pr-8 rounded-md border border-gray-300 bg-white shadow-sm
                          text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                value={displayCount}
                onChange={(e) => {
                  const val = e.target.value;
                  setDisplayCount(val === "all" ? "all" : Number(val));
                }}
              >
                {[4, 6, 8, 10].map((n) => (
                  <option key={n} value={n}>Show {n}</option>
                ))}
                <option value="all">Show all</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>

            {/* Add button (unchanged) */}
            <button
              onClick={() => { setIsEditing(false); setSelectedPerson(null); setShowAddForm(true); }}
              className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium rounded-md
                        bg-[#2F6F9F] text-white hover:bg-[#265a80] transition focus:outline-none
                        focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 whitespace-nowrap"
            >
              <span className="sm:hidden">+ Add</span>
              <span className="hidden sm:inline">+ Add Birthday</span>
            </button>
          </div>
        </div>

        {combinedList.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">No birthdays found in this category.</div>
        ) : (
          Object.entries(groupedByMonth).map(([month, peopleInMonth]) => (
            <div key={month} className="mb-6">
              <h3 className="text-md font-bold text-teal-800 mb-2">{month}</h3>
              <ul className="space-y-4">
                {peopleInMonth.map((person) => {
                  const age = dayjs().diff(dayjs(person.birthday), "year");
                  const daysUntil = person.birthdayThisYear.diff(today, "day");
                  const adjustedDaysUntil = person.birthdayThisYear.isToday() ? 0 : daysUntil + 1;
                  const daysLabel =
                    adjustedDaysUntil === 0 ? "Today" : `${adjustedDaysUntil} day${adjustedDaysUntil !== 1 ? "s" : ""}`;

                  return (
                    <li
                      key={person._id}
                      className="border border-teal rounded p-4 flex items-center justify-between cursor-pointer hover:bg-teal/25"
                      onClick={() => setSelectedPerson(person)}
                    >
                      <div className="flex items-start gap-3 w-full max-w-[300px]">
                        <input
                          type="checkbox"
                          checked={person.pinned ?? false}
                          onChange={async (e) => {
                            e.stopPropagation();
                            const newPinned = e.target.checked;
                            try {
                              await updatePinnedStatus(person._id, newPinned);
                              await refreshPeople(setPeople);
                            } catch (err) {
                              console.error("Failed to update pinned state:", err);
                            }
                          }}
                          aria-label={`Pin ${person.name}`}
                          title={`Pin ${person.name}`}
                        />
                        <Image
                          src={avatarUrls[person._id] || "/default-avatar.png"}
                          alt={person.name}
                          width={40}
                          height={40}
                          className="rounded-full aspect-square object-cover border border-teal"
                        />
                        <div className="text-left">
                          <div className="font-semibold">{person.name}</div>
                          <div className="text-sm text-gray-600">Age: {age}</div>
                          {(person.categories?.length ?? 0) > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {person.categories?.map((catRef) => {
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
                      <div className="text-center w-[70px] shrink-0">
                        <div className="text-teal-800 font-semibold">{person.birthdayThisYear.format("MMM D")}</div>
                      </div>
                      <div className="text-right text-sm text-gray-700 w-[80px] shrink-0">{daysLabel}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </section>

      {/* Right Column (details) */}
      <section
        className={`w-full lg:w-1/2 max-h-[calc(100vh-200px)] overflow-y-auto p-4 bg-lavender
          ${selectedPerson ? "block" : "hidden lg:block"}`}
      >
        {selectedPerson ? (
          <PersonDetails
            person={selectedPerson}
            allCategories={allCategories}
            avatarUrl={avatarUrls[selectedPerson._id]}
            onEdit={() => {
              setIsEditing(true);
              setShowAddForm(true);
            }}
            onDelete={requestDelete}
            onClose={() => setSelectedPerson(null)}
          />
        ) : (
          <div className="hidden lg:flex flex-col items-center justify-start min-h-full pt-10">
            <LazyImage
              src="/empty-state.webp"
              alt="No birthday selected"
              width={500}
              height={500}
              priority
              className="mb-4 opacity-80"
            />
          </div>
        )}
      </section>

      {/* Add/Edit modal */}
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
        onUpdated={(updatedPerson) => setSelectedPerson(updatedPerson)}
      />

      {/* Delete confirmation */}
      {showDeleteDialog && selectedPerson && (
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          personName={selectedPerson.name}
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          isLoading={isDeleting}
        />
      )}

      {/* Error Dialog */}
      <ErrorDialog open={errorOpen} message={errorMessage} onClose={() => setErrorOpen(false)} />
    </main>
  );
}
