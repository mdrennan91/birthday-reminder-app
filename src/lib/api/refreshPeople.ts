import { fetchBirthdays } from "./fetchBirthdays";
import { Person } from "@/types";

/**
 * Refreshes the list of people by fetching the latest birthdays from the API.
 * @param setPeople - The state setter function to update the people list.
 * @returns A promise that resolves once the state is updated.
 */
export async function refreshPeople(setPeople: (people: Person[]) => void): Promise<void> {
  try {
    const people = await fetchBirthdays();
    setPeople(people);
  } catch (error) {
    console.error("Failed to refresh people:", error);
    throw error;
  }
}
