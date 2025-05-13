import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";
import { create, verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

// Rate limiting implementation
const RATE_LIMIT = {
  windowMs: 60 * 60 * 1000, // 1 hour window
  maxRequests: 5, // 5 requests per IP per hour
  ipMap: new Map<string, { count: number; resetTime: number }>(),
};

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Referral code validation regex (alphanumeric, 6-12 chars)
const REFERRAL_CODE_REGEX = /^[A-Za-z0-9]{6,12}$/;

// Log environment variables (without exposing secrets)
const checkEnvVars = () => {
  const vars = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "JWT_SECRET",
    "ZOHO_SMTP_USERNAME",
    "ZOHO_SMTP_PASSWORD",
    "VERIFICATION_BASE_URL",
    "SMTP_HOST", // Added configurable SMTP host
  ];
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

// Generate email template
const generateEmailTemplate = (firstName: string, verificationUrl: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2C3E50; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">PayNomad Capital</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #eee; background-color: #fff;">
        <h2>Hello ${firstName},</h2>
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
  `;
};

Deno.serve(async (req) => {
  // Get request origin for CORS
  const origin = req.headers.get("origin") || "*";
  // Create more restrictive CORS headers based on origin
  const responseCorsHeaders = {
    ...corsHeaders,
    "Access-Control-Allow-Origin": origin,
  };

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: responseCorsHeaders, status: 200 });
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
        headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
        status: 429, // Too Many Requests
      },
    );
  }

  try {
    // Check environment variables - fail fast with specific message
    if (!checkEnvVars()) {
      return new Response(
        JSON.stringify({
          error:
            "Server configuration error. Missing required environment variables.",
        }),
        {
          headers: {
            ...responseCorsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        },
      );
    }

    // Get request body
    const { first_name, last_name, email, referral_code } = await req.json();

    // Validate required fields
    if (!first_name || !last_name || !email || !referral_code) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          headers: {
            ...responseCorsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        },
      );
    }

    // Enhanced validation
    if (!EMAIL_REGEX.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!REFERRAL_CODE_REGEX.test(referral_code)) {
      return new Response(
        JSON.stringify({
          error: "Invalid referral code. Must be 6-12 alphanumeric characters.",
        }),
        {
          headers: {
            ...responseCorsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        },
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const jwtSecret = Deno.env.get("JWT_SECRET") ?? "";
    const verificationBaseUrl =
      Deno.env.get("VERIFICATION_BASE_URL") ?? req.headers.get("origin") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check if user already exists and is verified
    const { data: existingUser } = await supabase
      .from("user_registrations")
      .select("status")
      .eq("email", email)
      .single();

    if (existingUser && existingUser.status === "verified") {
      return new Response(
        JSON.stringify({
          message: "Your email is already verified. Please log in.",
          success: false,
        }),
        {
          headers: {
            ...responseCorsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        },
      );
    }

    try {
      // Generate a verification token using djwt library with minimal payload
      const payload = {
        email, // Only include necessary data
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours expiry
      };

      // Create JWT token using the djwt library
      const jwtSecretKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(jwtSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"],
      );

      const token = await create(
        { alg: "HS256", typ: "JWT" },
        payload,
        jwtSecretKey,
      );

      // Store user data in database
      const { data: userData, error: userError } = await supabase
        .from("user_registrations")
        .upsert(
          [
            {
              email,
              first_name,
              last_name,
              referral_code,
              status: "pending",
              verification_token: token,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: "email" },
        )
        .select();

      if (userError) {
        console.error("Error storing user data:", userError);
        return new Response(JSON.stringify({ error: userError.message }), {
          headers: {
            ...responseCorsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        });
      }

      // Send email using configurable SMTP settings
      const client = new SmtpClient();

      const zohoUsername = Deno.env.get("ZOHO_SMTP_USERNAME") ?? "";
      const zohoPassword = Deno.env.get("ZOHO_SMTP_PASSWORD") ?? "";
      const smtpHost = Deno.env.get("SMTP_HOST") ?? "smtppro.zoho.eu";

      console.log(`Attempting to connect to SMTP server: ${smtpHost}...`);

      try {
        await client.connectTLS({
          hostname: smtpHost,
          port: 465,
          username: zohoUsername,
          password: zohoPassword,
        });
      } catch (smtpError) {
        console.error("SMTP connection error:", smtpError);

        // Update status to indicate email failure
        await supabase
          .from("user_registrations")
          .update({ status: "pending_email_failure" })
          .eq("email", email);

        // Store the registration but return a modified success message
        return new Response(
          JSON.stringify({
            message:
              "Registration successful. Email delivery is currently unavailable, but your account has been created.",
            success: true,
          }),
          {
            headers: {
              ...responseCorsHeaders,
              "Content-Type": "application/json",
            },
            status: 200,
          },
        );
      }

      const verificationUrl = `${verificationBaseUrl}/verify?token=${token}`;

      // Implement retry logic for email sending
      let sendAttempts = 0;
      const maxAttempts = 3;
      let sendError = null;

      while (sendAttempts < maxAttempts) {
        try {
          await client.send({
            from: zohoUsername,
            to: email,
            subject: "Verify your PayNomad Capital account",
            html: generateEmailTemplate(first_name, verificationUrl),
          });

          await client.close();
          sendError = null;
          break; // Email sent successfully
        } catch (error) {
          sendError = error;
          sendAttempts++;
          console.error(`Email sending attempt ${sendAttempts} failed:`, error);

          if (sendAttempts < maxAttempts) {
            // Exponential backoff: 1s, 2s, 4s...
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, sendAttempts - 1) * 1000),
            );
          }
        }
      }

      if (sendError) {
        console.error("Email sending error:", sendError);

        try {
          await client.close();
        } catch (closeError) {
          console.error("Error closing SMTP connection:", closeError);
        }

        // Update status to indicate email failure
        await supabase
          .from("user_registrations")
          .update({ status: "pending_email_failure" })
          .eq("email", email);

        // Return success anyway since the user was registered in the database
        return new Response(
          JSON.stringify({
            message:
              "Registration successful. If you don't receive a verification email, please contact support.",
            success: true,
          }),
          {
            headers: {
              ...responseCorsHeaders,
              "Content-Type": "application/json",
            },
            status: 200,
          },
        );
      }

      return new Response(
        JSON.stringify({
          message: "Verification email sent. Please check your inbox.",
          success: true,
        }),
        {
          headers: {
            ...responseCorsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        },
      );
    } catch (jwtError) {
      console.error("JWT generation error:", jwtError);
      return new Response(
        JSON.stringify({ error: "Error generating verification token" }),
        {
          headers: {
            ...responseCorsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        },
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...responseCorsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
