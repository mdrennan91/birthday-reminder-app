import dayjs from "dayjs";
import { Person, PersonWithBirthday } from "@/types";

/**
 * Enhances a list of people by computing their next upcoming birthday in the current year.
 * If their birthday this year has already passed, it rolls over to next year.
 *
 * @param people - Array of Person objects
 * @param today - The current dayjs instance (used for comparison)
 * @returns An array of PersonWithBirthday
 */
export function addBirthdayThisYear(
  people: Person[],
  today: dayjs.Dayjs
): PersonWithBirthday[] {
  return people.map((person) => {
    let birthdayThisYear = dayjs(person.birthday).set("year", today.year());
    if (birthdayThisYear.isBefore(today, "day")) {
      birthdayThisYear = birthdayThisYear.add(1, "year");
    }
    return { ...person, birthdayThisYear };
  });
}
