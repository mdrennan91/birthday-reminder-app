import dayjs from "dayjs";
import type { Person } from "@/types";

// Define the extended type for birthday calculation
export interface PersonWithBirthday extends Person {
  birthdayThisYear: dayjs.Dayjs;
}

/**
 * Sorts a list of people by how soon their birthday is from today.
 * Optionally filters by pinned status and/or category.
 */
export function sortByUpcoming({
  people,
  today,
  pinnedIds = [],
  activeCategory = null,
  displayCount = 4,
}: {
  people: Person[];
  today: dayjs.Dayjs;
  pinnedIds?: string[];
  activeCategory?: string | null;
  displayCount?: number;
}): PersonWithBirthday[] {

  return people
    .filter(p => !pinnedIds.includes(p._id))
    .filter(p =>
      !activeCategory ||
      (Array.isArray(p.categories) &&
        p.categories.some((cat: string) =>
          typeof cat === "string" &&
          cat.toLowerCase() === activeCategory.toLowerCase()
        ))
    )
    .map(person => {
      let birthdayThisYear = dayjs(person.birthday).set("year", today.year());
      if (birthdayThisYear.isBefore(today, "day")) {
        birthdayThisYear = birthdayThisYear.add(1, "year");
      }
      return { ...person, birthdayThisYear };
    })
    .sort((a, b) => a.birthdayThisYear.diff(b.birthdayThisYear))
    .slice(0, displayCount);
}
