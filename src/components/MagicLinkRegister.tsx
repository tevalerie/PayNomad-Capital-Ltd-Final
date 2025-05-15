import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { MagicLinks } from "@magiclinks/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardFooter } from "./ui/card";

// Initialize MagicLinks client
const magicLinks = new MagicLinks();

const MagicLinkRegister: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

      // Log signup attempt to userData table
      try {
        const { error: logError } = await supabase.from("userData").insert({
          email,
          action: "signup_attempt",
          action_details: {
            first_name: firstName,
            last_name: lastName,
            referral_code: referralCode,
            created_at: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
        });

        if (logError) {
          console.error("Error logging signup attempt:", logError);
        }
      } catch (logError) {
        // Continue even if logging fails
        console.error("Exception during logging signup attempt:", logError);
      }

      // Send magic link using magiclinks.dev
      const redirectUrl = `${window.location.origin}/verify-magic`;

      const result = await magicLinks.auth.sendMagicLink({
        email,
        redirectUrl,
        metadata: {
          firstName,
          lastName,
          referralCode,
          intent: "signup",
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Update contact status
      await supabase
        .from("contacts")
        .update({
          status: "email_sent",
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      setMessage("Verification email sent. Please check your inbox.");

      // Clear form
      setFirstName("");
      setLastName("");
      setEmail("");
      setReferralCode("");
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
      <div className="bg-[#2c3e50] h-[220px] flex items-center justify-center relative">
        <h1
          className="text-white font-bold tracking-[16px] text-center"
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: "clamp(2rem, 5vw, 3rem)",
          }}
        >
          CREATE YOUR ACCOUNT
        </h1>
      </div>

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
    </div>
  );
};

export default MagicLinkRegister;
