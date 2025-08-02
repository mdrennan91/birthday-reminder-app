import { createClient } from '@supabase/supabase-js';

// Create a Supabase client instance for use on the client-side.
// Uses public environment variables (safe for frontend exposure).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,       // Supabase project URL (from .env)
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!   // Public anon key (not service role)
);
