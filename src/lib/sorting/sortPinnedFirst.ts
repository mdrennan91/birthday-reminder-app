import dayjs from "dayjs";
import { PersonWithBirthday } from "@/types";

/**
 * Sorts a list of people by placing pinned people first, then others by upcoming birthday.
 * @param people - The full list of people.
 * @returns A sorted list of people with pinned ones first, both sorted by upcoming birthday.
 */
export function sortPinnedFirst(people: PersonWithBirthday[]): PersonWithBirthday[] {
  return [...people].sort((a, b) => {
    const aIsPinned = a.pinned ?? false;
    const bIsPinned = b.pinned ?? false;

    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;

    // Both are pinned or both are unpinned — sort by upcoming birthday
    return dayjs(a.birthdayThisYear).diff(dayjs(b.birthdayThisYear));
  });
}
