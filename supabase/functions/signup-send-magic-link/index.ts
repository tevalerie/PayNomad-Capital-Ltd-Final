import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import {
  corsHeaders,
  generateRandomPassword,
  generateToken,
} from "@shared/utils.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { first_name, last_name, email, referral_code } = await req.json();

    // Validate required fields
    if (!first_name || !last_name || !email || !referral_code) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Check if user already exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userCheckError) {
      console.error("Error checking existing user:", userCheckError);
      return new Response(
        JSON.stringify({ error: "Error checking user existence" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User with this email already exists" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Check if referral code exists
    const { data: referralData, error: referralError } = await supabase
      .from("referral_codes")
      .select("id, is_active")
      .eq("code", referral_code)
      .maybeSingle();

    if (referralError) {
      console.error("Error checking referral code:", referralError);
      return new Response(
        JSON.stringify({ error: "Error checking referral code" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    if (!referralData) {
      return new Response(JSON.stringify({ error: "Invalid referral code" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!referralData.is_active) {
      return new Response(
        JSON.stringify({ error: "This referral code is no longer active" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Generate a verification token
    const verificationToken = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

    // Store the verification token
    const { error: tokenError } = await supabase
      .from("verification_tokens")
      .insert({
        token: verificationToken,
        email,
        first_name,
        last_name,
        referral_code,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error("Error storing verification token:", tokenError);
      return new Response(
        JSON.stringify({ error: "Error creating verification token" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // Generate verification link
    const baseUrl = req.headers.get("origin") || "https://paynomadcapital.com";
    const verificationLink = `${baseUrl}/verify?token=${verificationToken}`;

    // Send verification email using Supabase's email service
    const { error: emailError } = await supabase.auth.admin.sendRawMagicLink({
      email,
      redirectTo: verificationLink,
    });

    if (emailError) {
      console.error("Error sending verification email:", emailError);
      return new Response(
        JSON.stringify({ error: "Error sending verification email" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    return new Response(
      JSON.stringify({ message: "Verification email sent successfully" }),
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
