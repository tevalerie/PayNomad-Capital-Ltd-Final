import React, { useEffect, useState } from "react";
import { MagicLinks } from "@magiclinks/client";
import { supabase } from "../supabaseClient";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Initialize MagicLinks client
const magicLinks = new MagicLinks();

const VerifyMagicLink: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email address...");
  const [searchParams] = useSearchParams();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token from URL
        const token = searchParams.get("token");

        if (!token) {
          setStatus("error");
          setMessage("Invalid verification link. No token found.");
          return;
        }

        // Verify the token with magiclinks.dev
        const result = await magicLinks.auth.verifyMagicLink({
          token,
        });

        if (result.error) {
          console.error("Magic link verification error:", result.error);
          setStatus("error");
          setMessage(`Error verifying email: ${result.error.message}`);
          return;
        }

        // Successfully verified
        const { email, metadata } = result.data;
        const { firstName, lastName, referralCode } = metadata || {};

        setDebugInfo({
          email,
          metadata,
          timestamp: new Date().toISOString(),
        });

        // Update contacts table
        const { error: contactUpdateError } = await supabase
          .from("contacts")
          .update({
            status: "verified",
            verified_at: new Date().toISOString(),
          })
          .eq("email", email);

        if (contactUpdateError) {
          console.error("Error updating contacts table:", contactUpdateError);
        }

        // Create or update user in Supabase Auth (if needed)
        // This would depend on your authentication strategy
        // For now, we'll just create a profile entry

        // Create profile entry
        if (firstName && lastName) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert(
              {
                email,
                full_name: `${firstName} ${lastName}`,
                referral_code: referralCode,
                is_email_verified: true,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "email" },
            );

          if (profileError) {
            console.error("Error creating/updating profile:", profileError);
          }
        }

        // Log verification success
        try {
          await supabase.from("userData").insert({
            email,
            action: "email_verified",
            action_details: {
              verified_at: new Date().toISOString(),
              metadata,
            },
            created_at: new Date().toISOString(),
          });
        } catch (logError) {
          console.error("Error logging email verification:", logError);
        }

        setStatus("success");
        setMessage("Your email has been successfully verified!");

        // Redirect to the signup page after a short delay
        setTimeout(() => {
          // Generate a secure token or use the one from magiclinks
          const accessToken = result.data.token || "verified";
          window.location.href = `https://ebank.paynomadcapital.com/signup?access_token=${accessToken}&email=${encodeURIComponent(email)}`;
        }, 2500);
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
          <div className="bg-white rounded-b-lg shadow-lg p-8">
            <div className="text-center">
              <div className="mb-6">
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
                    <button
                      className="mt-4 border border-[#0077be] text-[#0077be] hover:bg-[#0077be] hover:text-white px-4 py-2 rounded transition-colors"
                      onClick={() => (window.location.href = "/register")}
                    >
                      Back to Registration
                    </button>
                  </div>
                )}
              </div>

              {debugInfo && (
                <div className="mt-8 p-4 bg-gray-50 rounded text-left">
                  <h3 className="font-medium mb-2 text-gray-700">
                    Debug Information
                  </h3>
                  <pre className="text-xs overflow-auto max-h-40 bg-gray-100 p-2 rounded">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VerifyMagicLink;
