import { PersonWithBirthday } from "@/types";

/**
 * Groups a list of people by the month of their birthdayThisYear property.
 *
 * @param people - An array of people with `birthdayThisYear` already calculated.
 * @returns A Record object where the keys are month names (e.g., "January") and the values are arrays of people.
 */
export function groupByMonth(people: PersonWithBirthday[]): Record<string, PersonWithBirthday[]> {
  return people.reduce((acc, person) => {
    const month = person.birthdayThisYear.format("MMMM"); // e.g., "April"
    if (!acc[month]) acc[month] = [];
    acc[month].push(person);
    return acc;
  }, {} as Record<string, PersonWithBirthday[]>);
}
