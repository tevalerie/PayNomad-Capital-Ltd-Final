import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

// Rate limiting implementation
const RATE_LIMIT = {
  windowMs: 60 * 60 * 1000, // 1 hour window
  maxRequests: 10, // 10 requests per IP per hour
  ipMap: new Map<string, { count: number; resetTime: number }>(),
};

// Log environment variables (without exposing secrets)
const checkEnvVars = () => {
  const vars = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "JWT_SECRET"];
  const missing = vars.filter((v) => !Deno.env.get(v));
  if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(", ")}`);
    return false;
  }
  return true;
};

// Check if IP is rate limited
const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const record = RATE_LIMIT.ipMap.get(ip);

  // Clean up expired records
  if (now % 100 === 0) {
    // Occasional cleanup
    for (const [key, value] of RATE_LIMIT.ipMap.entries()) {
      if (now > value.resetTime) {
        RATE_LIMIT.ipMap.delete(key);
      }
    }
  }

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
    // Check environment variables
    if (!checkEnvVars()) {
      return new Response(
        JSON.stringify({
          error: "Server configuration error. Please contact support.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

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
    const jwtSecret = Deno.env.get("JWT_SECRET") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verify the token
    try {
      // Split the token into parts
      const [header, payload, signature] = token.split(".");

      // Decode the payload
      const base64Decode = (str: string): string => {
        str = str.replace(/-/g, "+").replace(/_/g, "/");
        while (str.length % 4) {
          str += "=";
        }
        return atob(str);
      };

      const decodedPayload = JSON.parse(base64Decode(payload));

      // Check if token is expired
      if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        return new Response(
          JSON.stringify({ error: "Verification token has expired" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      // Verify signature
      const isValid = await crypto.subtle.verify(
        { name: "HMAC", hash: "SHA-256" },
        await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(jwtSecret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["verify"],
        ),
        new Uint8Array(
          base64Decode(signature)
            .split("")
            .map((c) => c.charCodeAt(0)),
        ),
        new TextEncoder().encode(`${header}.${payload}`),
      );

      if (!isValid) {
        return new Response(
          JSON.stringify({ error: "Invalid verification token" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      // Get user data from database
      const { data: userData, error: userError } = await supabase
        .from("user_registrations")
        .select("*")
        .eq("verification_token", token)
        .eq("email", decodedPayload.email)
        .maybeSingle();

      console.log("User data query result:", userData, userError);

      if (userError) {
        return new Response(
          JSON.stringify({ error: "User not found or token mismatch" }),
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
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          verification_token: null, // Clear the token after use for security
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
          email: decodedPayload.email,
          first_name: decodedPayload.first_name,
          last_name: decodedPayload.last_name,
          referral_code: decodedPayload.referral_code,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid token format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
