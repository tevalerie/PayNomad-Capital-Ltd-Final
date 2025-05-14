import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);

// Log Supabase configuration for debugging
console.log("Supabase URL configured as:", import.meta.env.VITE_SUPABASE_URL);
console.log(
  "Supabase Anon Key configured (first 5 chars):",
  import.meta.env.VITE_SUPABASE_ANON_KEY
    ? import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 5) + "..."
    : "Not set",
);

// Add additional debug logging
console.log("Supabase client initialized with auth config:", {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
});
