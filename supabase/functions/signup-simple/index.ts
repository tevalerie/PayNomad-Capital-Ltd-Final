import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

// Simple rate limiting implementation
const RATE_LIMIT = {
  windowMs: 60 * 60 * 1000, // 1 hour window
  maxRequests: 5, // 5 requests per IP per hour
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

// Generate a simple verification token
const generateToken = (): string => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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
        error: "Too many requests. Please try again later.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429, // Too Many Requests
      },
    );
  }

  try {
    // Get request body
    const { first_name, last_name, email, referral_code } = await req.json();

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return new Response(
        JSON.stringify({ error: "Required fields are missing" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const verificationBaseUrl =
      Deno.env.get("VERIFICATION_BASE_URL") ?? req.headers.get("origin") ?? "";

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Generate a simple verification token
    const token = generateToken();

    // Store user data in database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .upsert(
        [
          {
            email,
            first_name,
            last_name,
            referral_code: referral_code || null,
            is_verified: false,
            verification_token: token,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "email" },
      )
      .select();

    if (userError) {
      console.error("Error storing user data:", userError);
      return new Response(JSON.stringify({ error: userError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Send email using Zoho SMTP
    const client = new SmtpClient();

    const zohoUsername = Deno.env.get("ZOHO_SMTP_USERNAME") ?? "";
    const zohoPassword = Deno.env.get("ZOHO_SMTP_PASSWORD") ?? "";

    try {
      await client.connectTLS({
        hostname: "smtppro.zoho.eu",
        port: 465,
        username: zohoUsername,
        password: zohoPassword,
      });

      const verificationUrl = `${verificationBaseUrl}/verify?token=${token}`;

      await client.send({
        from: zohoUsername,
        to: email,
        subject: "Verify your PayNomad Capital account",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2C3E50; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">PayNomad Capital</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #eee; background-color: #fff;">
            <h2>Hello ${first_name},</h2>
            <p>Thank you for registering with PayNomad Capital. Please verify your email address to complete your registration.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #0077BE; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
            </div>
            <p>If you did not request this verification, please ignore this email.</p>
            <p>This verification link will expire in 24 hours.</p>
          </div>
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} PayNomad Capital. All rights reserved.</p>
          </div>
        </div>
      `,
      });

      await client.close();

      return new Response(
        JSON.stringify({
          message: "Verification email sent. Please check your inbox.",
          success: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } catch (emailError) {
      console.error("Email sending error:", emailError);

      try {
        await client.close();
      } catch (closeError) {
        console.error("Error closing SMTP connection:", closeError);
      }

      // Return success anyway since the user was registered in the database
      return new Response(
        JSON.stringify({
          message:
            "Registration successful. If you don't receive a verification email, please contact support.",
          success: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
