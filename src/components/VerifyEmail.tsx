import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Navbar from "./Navbar";
import Footer from "./Footer";

const VerifyEmail = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email address...");
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Try to get the email from sessionStorage (from registration page)
        const storedEmail = sessionStorage.getItem("registrationEmail");
        if (storedEmail) {
          setEmail(storedEmail);
        }

        // Get the current session after verification
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        // If we have a session, the user has been verified
        if (sessionData?.session) {
          // Update the contacts table status to 'verified'
          if (storedEmail) {
            const { error: updateError } = await supabase
              .from("contacts")
              .update({
                status: "verified",
                updated_at: new Date().toISOString(),
              })
              .eq("email", storedEmail);

            if (updateError) {
              console.error("Error updating contact status:", updateError);
            }

            // Log verification success
            try {
              await supabase.from("userData").insert({
                email: storedEmail,
                action: "email_verified",
                action_details: {
                  verified_at: new Date().toISOString(),
                },
                created_at: new Date().toISOString(),
              });
            } catch (logError) {
              // Continue even if logging fails
              console.error("Error logging email verification:", logError);
            }
          }

          setStatus("success");
          setMessage("Your email has been successfully verified!");

          // Get user email from session if not already set
          if (!email && sessionData.session.user?.email) {
            setEmail(sessionData.session.user.email);
          }

          // Redirect to the signup page after a short delay
          setTimeout(() => {
            try {
              // If we have session data with access token, use it
              if (sessionData?.session?.access_token) {
                window.location.href = `${window.location.origin}?access_token=${sessionData.session.access_token}`;
              } else {
                // Fallback to just redirecting without token
                window.location.href = window.location.origin;
              }
            } catch (redirectErr) {
              console.error("Redirect error:", redirectErr);
              // Fallback if redirect fails
              window.location.href = window.location.origin;
            }
          }, 2500);
        } else {
          // No session found, check if we have a token in the URL
          const token = searchParams.get("token");

          if (!token) {
            setStatus("error");
            setMessage("Invalid verification link. Please try again.");
            return;
          }

          // Try to exchange the token for a session
          const { error: exchangeError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "email",
          });

          if (exchangeError) {
            throw exchangeError;
          }

          // Check again for a session after verification
          const { data: newSessionData, error: newSessionError } =
            await supabase.auth.getSession();

          if (newSessionError) {
            throw newSessionError;
          }

          if (newSessionData?.session) {
            setStatus("success");
            setMessage("Your email has been successfully verified!");

            // Get user email from session
            if (newSessionData.session.user?.email) {
              setEmail(newSessionData.session.user.email);

              // Update contacts table
              const { error: updateError } = await supabase
                .from("contacts")
                .update({
                  status: "verified",
                  updated_at: new Date().toISOString(),
                })
                .eq("email", newSessionData.session.user.email);

              if (updateError) {
                console.error("Error updating contact status:", updateError);
              }

              // Create or update profile for the user
              const { id: user_id, user_metadata } =
                newSessionData.session.user;
              const { error: profileError } = await supabase
                .from("profiles")
                .upsert(
                  [
                    {
                      user_id,
                      full_name:
                        user_metadata?.first_name && user_metadata?.last_name
                          ? `${user_metadata.first_name} ${user_metadata.last_name}`
                          : "User",
                      referral_code: user_metadata?.referral_code,
                      is_email_verified: true,
                      updated_at: new Date().toISOString(),
                    },
                  ],
                  { onConflict: "user_id" },
                );

              if (profileError) {
                console.error("Error creating/updating profile:", profileError);
              }

              // Log verification success
              try {
                await supabase.from("userData").insert({
                  email: newSessionData.session.user.email,
                  action: "email_verified",
                  action_details: {
                    verified_at: new Date().toISOString(),
                  },
                  created_at: new Date().toISOString(),
                });
              } catch (logError) {
                // Continue even if logging fails
                console.error("Error logging email verification:", logError);
              }
            }

            // Redirect to the signup page after a short delay
            setTimeout(() => {
              try {
                if (newSessionData?.session?.access_token) {
                  window.location.href = `${window.location.origin}?access_token=${newSessionData.session.access_token}`;
                } else {
                  window.location.href = window.location.origin;
                }
              } catch (redirectErr) {
                console.error("Redirect error:", redirectErr);
                window.location.href = window.location.origin;
              }
            }, 2500);
          } else {
            setStatus("error");
            setMessage("Unable to verify your email. Please try again.");
          }
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again later.",
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#faf4eb] flex flex-col">
      <Navbar />

      <div className="flex items-center justify-center flex-grow p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#2c3e50] p-6 rounded-t-lg text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Create Your Account
            </h1>
          </div>
          <Card className="rounded-t-none shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {status === "loading"
                  ? "Verify Your Email"
                  : status === "success"
                    ? "Email Verified!"
                    : "Verification Failed"}
              </CardTitle>
              {email && status === "success" && (
                <CardDescription>{email}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              {status === "loading" && (
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-12 w-12 text-[#0077be] animate-spin" />
                  <p className="text-gray-600">{message}</p>
                </div>
              )}

              {status === "success" && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </div>
                  <p className="text-green-600 font-medium text-center">
                    {message}
                  </p>
                  <p className="text-gray-500 text-sm text-center">
                    Your account has been created successfully.
                  </p>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2 text-center">
                      Redirecting to dashboard...
                    </p>
                    <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0077be] animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="rounded-full bg-red-100 p-3">
                    <XCircle className="w-16 h-16 text-red-500" />
                  </div>
                  <p className="text-red-600 font-medium text-center">
                    {message}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 border-[#0077be] text-[#0077be] hover:bg-[#0077be] hover:text-white"
                    onClick={() => (window.location.href = "/register")}
                  >
                    Back to Registration
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="mt-8 text-center">
            <div className="flex justify-center space-x-6">
              <a
                href="#about"
                className="text-sm text-gray-600 hover:text-[#0077be]"
              >
                About Us
              </a>
              <a
                href="#services"
                className="text-sm text-gray-600 hover:text-[#0077be]"
              >
                Services
              </a>
              <a
                href="#insights"
                className="text-sm text-gray-600 hover:text-[#0077be]"
              >
                Insights
              </a>
              <a
                href="#contact"
                className="text-sm text-gray-600 hover:text-[#0077be]"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VerifyEmail;
