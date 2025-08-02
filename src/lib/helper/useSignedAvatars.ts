"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Person } from "@/types";

/**
 * Custom React hook that retrieves signed Supabase Storage URLs
 * for each person's avatar image.
 *
 * @param people - Array of people, each with a potential avatar path stored in `avatarUrl`.
 * @returns A map of person._id to signed image URL, valid for 1 hour.
 */
export function useSignedAvatars(people: Person[]) {
  // Local state to hold a map of person ID -> signed Supabase URL
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    /**
     * Fetch signed URLs from Supabase for each person who has an avatar path.
     * Signed URLs allow temporary access to private storage assets.
     */
    async function loadAvatars() {
      const avatarMap: Record<string, string> = {};

      // Only include people who actually have an `avatarUrl` set
      const peopleWithAvatars = people.filter((p) => p.avatarUrl);

      // For each person with an avatar path, request a signed URL from Supabase
        await Promise.all(
        peopleWithAvatars.map(async (person) => {
            const path = person.avatarUrl!;

            const { data, error } = await supabase.storage
            .from("images")
            .createSignedUrl(path, 60 * 60); // 1 hour

            if (error) {
            console.error(`Failed to fetch signed URL for ${path}:`, error.message);
            } else {
            avatarMap[person._id] = data.signedUrl;
            }
        })
        );


      // Update state once all signed URLs are fetched
      setAvatarUrls(avatarMap);
    }

    // Only run if the list of people is non-empty
    if (people.length > 0) {
      loadAvatars();
    }
  }, [people]); // Rerun the effect if the list of people changes

  // Return the dictionary of personId -> signed URL
  return avatarUrls;
}
