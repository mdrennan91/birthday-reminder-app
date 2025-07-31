/**
 * Sends a PATCH request to update the pinned status of a birthday entry.
 *
 * This function communicates with the API route `/api/birthdays/:id/pin`
 * to update the `pinned` property of a specific birthday document.
 *
 */
export async function updatePinnedStatus(id: string, pinned: boolean): Promise<void> {
  // Send a PATCH request to the backend API route responsible for updating pin status
  const res = await fetch(`/api/birthdays/${id}/pin`, {
    method: "PATCH", // Indicates a partial update to an existing resource
    headers: {
      "Content-Type": "application/json", // Specifies that we're sending JSON data in the body
    },
    body: JSON.stringify({ pinned }), // Send the updated 'pinned' value as JSON
  });

  // If the response was not successful throw an error
  if (!res.ok) {
    throw new Error("Failed to update pinned status"); 
  }
}
