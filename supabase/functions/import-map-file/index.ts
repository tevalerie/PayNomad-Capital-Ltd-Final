import { corsHeaders } from "@shared/utils.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  // Return the import map as JSON
  const importMap = {
    imports: {
      "@shared/": "../_shared/",
    },
  };

  return new Response(JSON.stringify(importMap), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
