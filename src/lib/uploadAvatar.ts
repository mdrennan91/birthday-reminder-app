/**
 * Uploads an avatar image to the server and associates it with a person.
 *
 * @param image - A File object representing the image to upload.
 * @param personId - The unique identifier of the person the image belongs to.
 * @returns A Promise resolving to an object containing either the uploaded image path and signed URL or an error message.
 */
export async function uploadAvatar(
  image: File,
  personId: string
): Promise<{ path?: string; signedUrl?: string; error?: string }> {
  // Create multipart form data to send file and metadata
  const form = new FormData();
  form.append("personId", personId); // Include the person's ID
  form.append("image", image);       // Include the avatar image file

  try {
    // Send POST request to API route for image upload
    const res = await fetch("/api/uploadAvatar", {
      method: "POST",
      body: form,
    });

    const data = await res.json(); // Parse JSON response

    // If upload was successful, return file path and signed preview URL
    if (res.ok) {
      return {
        path: data.path,
        signedUrl: data.signedUrl,
      };
    }

    // If server responded with an error, return the error message
    return { error: data.error || "Upload failed" };
  } catch (err) {
    // Catch network or unexpected client-side errors
    console.error("Upload error:", err);
    return { error: "Unexpected upload error" };
  }
}
