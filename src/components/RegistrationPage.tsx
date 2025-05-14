import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardFooter } from "./ui/card";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Use the imported supabase client instead of creating a new one
import { supabase } from "../supabaseClient";

const RegistrationPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateReferralCode = (code: string) => {
    // Allow TEST123 for testing purposes, otherwise use the regex
    if (code === "TEST123") return true;
    const re = /^(?=.*[A-Za-z])[A-Za-z0-9]{4,12}$/;
    return re.test(code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate inputs
    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }

    if (!lastName.trim()) {
      setError("Last name is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    if (!validateReferralCode(referralCode)) {
      setError(
        "Referral code must be 4-12 alphanumeric characters with at least one letter",
      );
      return;
    }

    setIsLoading(true);

    try {
      console.log("Starting registration process for email:", email);

      // Store user data in contacts table
      const { data: contactData, error: insertError } = await supabase
        .from("contacts")
        .insert({
          first_name: firstName,
          last_name: lastName,
          email,
          referral_code: referralCode,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (insertError) {
        console.error("Error inserting into contacts:", insertError);
        if (insertError.code === "23505") {
          // Postgres unique violation code
          setError(
            "This email is already registered. Please use a different email.",
          );
        } else {
          setError(`Error creating contact record: ${insertError.message}`);
        }
        setIsLoading(false);
        return;
      }

      console.log("Successfully inserted contact data:", contactData);

      // Log signup attempt to userData table
      try {
        console.log("Attempting to log signup attempt to userData table");
        const userDataPayload = {
          email,
          action: "signup_attempt",
          action_details: {
            first_name: firstName,
            last_name: lastName,
            referral_code: referralCode,
            created_at: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
        };
        console.log("userData payload:", userDataPayload);

        const { data: logData, error: logError } = await supabase
          .from("userData")
          .insert(userDataPayload);

        if (logError) {
          console.error("Error logging signup attempt:", logError);
          console.log("Log error details:", {
            code: logError.code,
            message: logError.message,
            details: logError.details,
            hint: logError.hint,
          });
        } else {
          console.log("Successfully logged signup attempt");
        }
      } catch (logError) {
        // Continue even if logging fails
        console.error("Exception during logging signup attempt:", logError);
      }

      // Send magic link using Supabase Auth with more detailed error handling
      try {
        console.log("Attempting to send magic link to:", email);
        console.log("Redirect URL:", `${window.location.origin}/verify`);

        const otpOptions = {
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/verify`,
            data: {
              first_name: firstName,
              last_name: lastName,
              referral_code: referralCode,
              intent: "signup",
            },
          },
        };

        console.log("OTP options:", JSON.stringify(otpOptions, null, 2));

        const { data: otpData, error: authError } =
          await supabase.auth.signInWithOtp(otpOptions);

        if (authError) {
          console.error("Supabase signInWithOtp error:", authError);

          // Log more details about the error for debugging
          console.log("Error details:", {
            code: authError.code,
            name: authError.name,
            message: authError.message,
            status: authError.status,
          });

          // If there was an error sending the email, update the contacts status
          await supabase
            .from("contacts")
            .update({
              status: "email_failed",
              error_details: authError.message,
              updated_at: new Date().toISOString(),
            })
            .eq("email", email);

          let errorMessage = "Error sending verification email. ";

          // Provide more specific error messages based on common issues
          if (authError.message.includes("rate limit")) {
            errorMessage +=
              "Too many attempts. Please try again in a few minutes.";
          } else if (authError.message.includes("Invalid email")) {
            errorMessage += "Please check that your email address is correct.";
          } else {
            errorMessage += `${authError.message}. Please try again later.`;
          }

          setError(errorMessage);
          setIsLoading(false);
          return;
        }

        console.log("Magic link sent successfully", otpData);
      } catch (unexpectedError) {
        console.error("Unexpected error during OTP process:", unexpectedError);

        // Update contacts table with error status
        await supabase
          .from("contacts")
          .update({
            status: "email_failed",
            error_details:
              unexpectedError instanceof Error
                ? unexpectedError.message
                : "Unknown error",
            updated_at: new Date().toISOString(),
          })
          .eq("email", email);

        setError(
          "An unexpected error occurred while sending the verification email. Please try again later.",
        );
        setIsLoading(false);
        return;
      }

      setMessage("Verification email sent. Please check your inbox.");

      // Store email in sessionStorage for verification page
      sessionStorage.setItem("registrationEmail", email);

      // Clear form
      setFirstName("");
      setLastName("");
      setEmail("");
      setReferralCode("");

      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf4eb] flex flex-col">
      <Navbar />

      {/* Mini Hero Section */}
      <div className="bg-[#2c3e50] h-[220px] flex items-center justify-center relative">
        <h1
          className="text-white font-bold tracking-[16px] text-center"
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: "clamp(2rem, 5vw, 3rem)", // 32px on mobile, 48px on desktop
          }}
        >
          CREATE YOUR ACCOUNT
        </h1>
      </div>

      {/* Form Card that overlaps hero section */}
      <div className="container mx-auto px-4 -mt-8 flex justify-center relative z-10">
        <div className="w-full max-w-[480px]">
          <Card className="rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] overflow-hidden">
            <CardContent className="pt-6 px-6 md:px-8 py-6 md:py-8">
              {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
                  {message}
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-[#2c3e50] font-medium"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                      className="border-gray-300 focus:border-[#0077be] focus:ring-[#0077be]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-[#2c3e50] font-medium"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                      className="border-gray-300 focus:border-[#0077be] focus:ring-[#0077be]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-[#2c3e50] font-medium"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="border-gray-300 focus:border-[#0077be] focus:ring-[#0077be]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="referralCode"
                      className="text-[#2c3e50] font-medium"
                    >
                      Referral Code
                    </Label>
                    <Input
                      id="referralCode"
                      placeholder="Enter referral code"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      disabled={isLoading}
                      className="border-gray-300 focus:border-[#0077be] focus:ring-[#0077be]"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#0077be] hover:bg-[#0066a6] py-3 text-base font-medium mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : "Continue"}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t py-6 px-6 md:px-8">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a
                  href="https://ebank.paynomadcapital.com/login"
                  className="text-[#0077be] hover:underline font-medium"
                >
                  Sign In
                </a>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Spacer to push footer down */}
      <div className="flex-grow"></div>

      <Footer />
    </div>
  );
};

export default RegistrationPage;
