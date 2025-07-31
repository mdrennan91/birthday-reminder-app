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
  displayCount = 4,
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
              typeof cat === "string" &&
              cat.toLowerCase() === activeCategory.toLowerCase()
          )
      )
    : unpinned;

  // Combine pinned + filtered unpinned
  const combined = [...pinned, ...categoryFiltered];

  // Add birthdayThisYear and sort by date
  const withBirthday = addBirthdayThisYear(combined, today);

  const sorted = [...withBirthday].sort((a, b) =>
    a.birthdayThisYear.diff(b.birthdayThisYear)
  );

  return sorted.slice(0, displayCount);
}
