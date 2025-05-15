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
      flowType: "pkce", // Use PKCE flow for better security
      debug: true, // Enable debug mode for auth
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
  flowType: "pkce",
  debug: true,
});

// Add auth state change listener for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth state changed:", event);
  if (session) {
    console.log("New session established:", {
      user_id: session.user.id,
      has_user_metadata: !!session.user.user_metadata,
      user_metadata: session.user.user_metadata,
    });
  } else {
    console.log("No session available after auth state change");
  }
});
