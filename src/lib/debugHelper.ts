/**
 * Helper function to log environment information for debugging
 */
export function logEnvironmentInfo() {
  console.log("Environment Debug Info:");
  console.log("- NODE_ENV:", import.meta.env.MODE);
  console.log("- BASE_URL:", import.meta.env.BASE_URL);
  console.log("- SUPABASE_URL defined:", !!import.meta.env.VITE_SUPABASE_URL);
  console.log(
    "- SUPABASE_ANON_KEY defined:",
    !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  );

  // Check if we're running in production (Netlify)
  const isProduction = import.meta.env.PROD;
  console.log("- Running in production:", isProduction);

  // Log browser information
  console.log("- User Agent:", navigator.userAgent);
  console.log("- Current URL:", window.location.href);
}
