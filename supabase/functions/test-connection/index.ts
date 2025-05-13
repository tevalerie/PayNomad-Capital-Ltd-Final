import { corsHeaders } from "@shared/utils.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Get environment variables to verify they're accessible
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") ?? "";

    // Check if environment variables are set correctly
    const envStatus = {
      SUPABASE_URL: supabaseUrl ? "✓ Set" : "✗ Not set",
      SUPABASE_SERVICE_KEY: supabaseServiceKey ? "✓ Set" : "✗ Not set",
      URL_FORMAT: supabaseUrl.includes("supabase.co")
        ? "✓ Correct format"
        : "✗ Incorrect format",
    };

    return new Response(
      JSON.stringify({
        message: "Connection successful",
        timestamp: new Date().toISOString(),
        environment: envStatus,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
