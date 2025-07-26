/**
 * Deletes a birthday by ID from the server.
 * @param id - The `_id` of the birthday entry to delete.
 * @returns A promise that resolves to `true` if deletion was successful, or throws an error.
 */
export async function deleteBirthday(id: string): Promise<boolean> {
  const res = await fetch(`/api/birthdays/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete birthday");
  }

  return true;
}
