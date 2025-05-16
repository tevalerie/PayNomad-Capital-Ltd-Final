import { corsHeaders } from "@shared/utils.ts";

// This function has been removed

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  return new Response(
    JSON.stringify({
      error: "This feature has been removed and is no longer available",
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    },
  );
});
