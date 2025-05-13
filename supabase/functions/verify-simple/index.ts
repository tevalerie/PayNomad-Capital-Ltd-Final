import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";
import { verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

// Simple rate limiting implementation
const RATE_LIMIT = {
  windowMs: 60 * 60 * 1000, // 1 hour window
  maxRequests: 10, // 10 requests per IP per hour
  ipMap: new Map<string, { count: number; resetTime: number }>(),
};

// Check if IP is rate limited
const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const record = RATE_LIMIT.ipMap.get(ip);

  if (!record) {
    // First request from this IP
    RATE_LIMIT.ipMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return false;
  }

  if (now > record.resetTime) {
    // Reset period has passed
    RATE_LIMIT.ipMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return false;
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    // Rate limit exceeded
    return true;
  }

  // Increment counter
  record.count++;
  RATE_LIMIT.ipMap.set(ip, record);
  return false;
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  // Get client IP for rate limiting
  const clientIP = req.headers.get("x-forwarded-for") || "unknown";

  // Check rate limit
  if (checkRateLimit(clientIP)) {
    return new Response(
      JSON.stringify({
        error: "Too many verification attempts. Please try again later.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429, // Too Many Requests
      },
    );
  }

  try {
    // Get token from request body
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Verification token is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Find user with this verification token
    const { data: userData, error: userError } = await supabase
      .from("user_registrations")
      .select("*")
      .eq("verification_token", token)
      .maybeSingle();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification token" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Update user status to verified
    const { error: updateError } = await supabase
      .from("user_registrations")
      .update({
        status: "verified",
        verification_token: null, // Clear the token after use for security
        updated_at: new Date().toISOString(),
      })
      .eq("id", userData.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update user status" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // Return success with user email
    return new Response(
      JSON.stringify({
        message: "Email verified successfully",
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        referral_code: userData.referral_code,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
