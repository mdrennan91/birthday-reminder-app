import { supabase } from './supabase';

/**
 * Generates a signed URL for an avatar image stored in Supabase.
 * Ensures secure temporary access for private images.
 *
 * @param path - The filename of the image stored in the 'images' bucket (e.g., 'abc123.png')
 * @returns The signed URL if successful, or null if invalid
 */
export async function getSignedAvatarUrl(path: string) {
  // Guard clause: Skip if path is missing or incorrectly includes a bucket prefix
  if (!path || path.includes("images/")) {
    console.warn("Avatar path is invalid or contains redundant 'images/' prefix:", path);
    return null;
  }

  // Request a signed URL from Supabase valid for 1 hour (3600 seconds)
  const { data, error } = await supabase
    .storage
    .from('images') // Name of the storage bucket
    .createSignedUrl(path, 60 * 60);

  // Log and throw on Supabase error
  if (error) {
    console.error("Failed to create signed URL:", error.message);
    throw error;
  }

  // Return the signed URL for secure public access
  return data.signedUrl;
}
