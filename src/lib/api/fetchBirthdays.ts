
import { Person } from "@/types";

/**
 * Fetches birthday data from the API.
 * @returns A list of people from the server.
 * @throws If the fetch fails.
 */
export async function fetchBirthdays(): Promise<Person[]> {
  const res = await fetch("/api/birthdays");
  if (!res.ok) {
    throw new Error("Failed to fetch birthdays");
  }
  return res.json();
}
