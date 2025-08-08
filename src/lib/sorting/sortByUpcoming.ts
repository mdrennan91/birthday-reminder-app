import dayjs from "dayjs";
import type { Person, PersonWithBirthday } from "@/types";
import { addBirthdayThisYear } from "../helper/addBirthdayThisYear";

/**
 * Returns a list of people sorted by upcoming birthday.
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
  // Split pinned and unpinned
  const pinned = people.filter((p) => p.pinned);
  const unpinned = people.filter((p) => !p.pinned);

  // Filter unpinned by category (if needed)
  const categoryFiltered = activeCategory
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

  // Combine pinned + filtered unpinned
  const combined = [...pinned, ...categoryFiltered];

  // Add birthdayThisYear and sort by date
  const withBirthday = addBirthdayThisYear(combined, today);

  // Sort by upcoming date
  const sorted = [...withBirthday].sort((a, b) =>
    a.birthdayThisYear.diff(b.birthdayThisYear)
  );

  // Return only the top N
  return typeof displayCount === "number"
    ? sorted.slice(0, displayCount)
    : sorted;
}
