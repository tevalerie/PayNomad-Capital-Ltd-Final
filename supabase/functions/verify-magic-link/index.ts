import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { corsHeaders, generateRandomPassword } from "@shared/utils.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
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

    // Get the verification token data
    const { data: tokenData, error: tokenError } = await supabase
      .from("verification_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (tokenError) {
      console.error("Error retrieving verification token:", tokenError);
      return new Response(
        JSON.stringify({ error: "Error retrieving verification token" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    if (!tokenData) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification token" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      return new Response(
        JSON.stringify({ error: "Verification token has expired" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Check if token has already been used
    if (tokenData.used) {
      return new Response(
        JSON.stringify({ error: "Verification token has already been used" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Generate a random password for the user
    const password = generateRandomPassword();

    // Create the user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: tokenData.email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: tokenData.first_name,
          last_name: tokenData.last_name,
          referral_code: tokenData.referral_code,
        },
      });

    if (authError) {
      console.error("Error creating user in auth:", authError);
      return new Response(
        JSON.stringify({ error: "Error creating user account" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // Create user profile in the users table
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: tokenData.email,
      first_name: tokenData.first_name,
      last_name: tokenData.last_name,
      referral_code: tokenData.referral_code,
      status: "active",
    });

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      // If profile creation fails, delete the auth user to maintain consistency
      await supabase.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({ error: "Error creating user profile" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // Mark the token as used
    await supabase
      .from("verification_tokens")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("token", token);

    // Create a session for the user
    const { data: sessionData, error: sessionError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: tokenData.email,
      });

    if (sessionError) {
      console.error("Error generating session:", sessionError);
      return new Response(
        JSON.stringify({ error: "Error generating user session" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    return new Response(
      JSON.stringify({
        message: "User verified and created successfully",
        email: tokenData.email,
        properties: sessionData.properties,
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
