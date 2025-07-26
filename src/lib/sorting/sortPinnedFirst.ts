import dayjs from "dayjs";
import { PersonWithBirthday } from "@/types";

/**
 * Sorts a list of people by placing pinned people first, then others by upcoming birthday.
 * @param people - The full list of people.
 * @param pinnedIds - An array of person `_id` strings that are pinned.
 * @returns A sorted list of people with pinned ones first, both sorted by upcoming birthday.
 */
export function sortPinnedFirst(
  people: PersonWithBirthday[],
  pinnedIds: string[]
): PersonWithBirthday[] {
  return [...people].sort((a, b) => {
    const aIsPinned = pinnedIds.includes(a._id);
    const bIsPinned = pinnedIds.includes(b._id);

    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;

    // Both are pinned or both are unpinned, sort by upcoming birthday
    return dayjs(a.birthdayThisYear).diff(dayjs(b.birthdayThisYear));
  });
}
