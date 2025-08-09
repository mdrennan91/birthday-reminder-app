import dayjs from "dayjs";
import type { Person, PersonWithBirthday } from "@/types";
import { addBirthdayThisYear } from "../helper/addBirthdayThisYear";

/**
 * Returns a list sorted with pinned birthdays first (sorted by upcoming date within that group),
 * followed by the rest (also sorted by upcoming date).
 * Pinned people are always included, regardless of category.
 */
export function sortByUpcoming({
  people,
  today,
  activeCategory = null,
  displayCount,
}: {
  people: Person[];
  today: dayjs.Dayjs;
  activeCategory?: string | null;
  displayCount?: number;
}): PersonWithBirthday[] {
  // Separate pinned and unpinned
  const pinned = people.filter((p) => p.pinned);
  const unpinned = people.filter((p) => !p.pinned);

  // Apply category filter only to unpinned
  const categoryFilteredUnpinned = activeCategory
    ? unpinned.filter(
        (p) =>
          Array.isArray(p.categories) &&
          p.categories.some(
            (cat) =>
              typeof cat.name === "string" &&
              cat.name.toLowerCase() === activeCategory.toLowerCase()
          )
      )
    : unpinned;

  // Add birthdayThisYear for both groups
  const pinnedWithBirthday = addBirthdayThisYear(pinned, today);
  const unpinnedWithBirthday = addBirthdayThisYear(categoryFilteredUnpinned, today);

  // Sort each group independently by upcoming date
  const sortedPinned = [...pinnedWithBirthday].sort((a, b) =>
    a.birthdayThisYear.diff(b.birthdayThisYear)
  );
  const sortedUnpinned = [...unpinnedWithBirthday].sort((a, b) =>
    a.birthdayThisYear.diff(b.birthdayThisYear)
  );

  // Merge: pinned first, then unpinned
  const combined = [...sortedPinned, ...sortedUnpinned];

  // Limit total results if displayCount is set
  return typeof displayCount === "number"
    ? combined.slice(0, displayCount)
    : combined;
}
