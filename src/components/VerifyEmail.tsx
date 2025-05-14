import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Navbar from "./Navbar";
import Footer from "./Footer";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<{
    loading: boolean;
    success: boolean;
    message: string;
  }>({
    loading: true,
    success: false,
    message: "Verifying your email...",
  });

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Extract token from URL
        const token = searchParams.get("token");
        const type = searchParams.get("type");
        const email = searchParams.get("email");

        if (!token) {
          setStatus({
            loading: false,
            success: false,
            message:
              "Verification token is missing. Please check your email link.",
          });
          return;
        }

        if (type === "signup" || type === "email_change") {
          // Verify the email with Supabase
          const { error } = await supabase.auth.verifyOtp({
            token,
            type: "email",
            email: email || "",
          });

          if (error) {
            console.error("Verification error:", error);
            setStatus({
              loading: false,
              success: false,
              message: `Email verification failed: ${error.message}`,
            });
          } else {
            // Update user profile in the database if needed
            // This could be used to set a verified flag or update other user data
            const {
              data: { user },
            } = await supabase.auth.getUser();

            if (user) {
              // Optional: Update user metadata or profile in your database
              const { error: updateError } = await supabase
                .from("profiles")
                .update({ email_verified: true })
                .eq("id", user.id);

              if (updateError) {
                console.error("Error updating profile:", updateError);
              }
            }

            setStatus({
              loading: false,
              success: true,
              message: "Email verified successfully! Redirecting to login...",
            });

            // Redirect to login after successful verification
            setTimeout(() => {
              window.location.href = "https://ebank.paynomadcapital.com/login";
            }, 3000);
          }
        } else if (type === "recovery") {
          // Handle password reset verification
          setStatus({
            loading: false,
            success: true,
            message: "Please set your new password.",
          });
          // Redirect to password reset page
          navigate("/reset-password", { state: { token, email } });
        } else {
          setStatus({
            loading: false,
            success: false,
            message: "Invalid verification type.",
          });
        }
      } catch (error: any) {
        console.error("Error during verification:", error);
        setStatus({
          loading: false,
          success: false,
          message: `An unexpected error occurred: ${error.message || error}`,
        });
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar
        onNavigate={(sectionId) => {
          window.location.href = `/#${sectionId}`;
        }}
      />

      {/* Mini Hero Section */}
      <div className="bg-[#2C3E50] h-[240px] flex items-center justify-center">
        <h1 className="text-white text-4xl md:text-5xl font-bold tracking-wider font-serif">
          Email Verification
        </h1>
      </div>

      {/* Status Card */}
      <div className="container mx-auto px-4 -mt-20 mb-16">
        <div className="max-w-[480px] mx-auto bg-white rounded-2xl shadow-md p-6 md:p-8">
          <div className="flex flex-col items-center justify-center space-y-6 py-8">
            {status.loading ? (
              <>
                <div className="w-16 h-16 border-4 border-[#0077BE] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg text-center text-gray-700">
                  {status.message}
                </p>
              </>
            ) : status.success ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-lg text-center text-green-700">
                  {status.message}
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <p className="text-lg text-center text-red-700">
                  {status.message}
                </p>
              </>
            )}

            {/* Quick Links */}
            <div className="text-center text-sm space-y-2 pt-4">
              <div>
                <span className="text-gray-600">Return to </span>
                <a
                  href="/"
                  className="text-[#0077BE] underline hover:text-[#6B96C3]"
                >
                  Home Page
                </a>
              </div>
              <div>
                <span className="text-gray-600">Already verified? </span>
                <a
                  href="https://ebank.paynomadcapital.com/login"
                  className="text-[#0077BE] underline hover:text-[#6B96C3]"
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default VerifyEmail;
