import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import registrationStore from "../lib/registrationStore";

const VerifyEmail: React.FC = () => {
  const [status, setStatus] = useState<{
    type: "loading" | "success" | "error";
    message: string;
  }>({
    type: "loading",
    message: "Verifying your email...",
  });

  const [email, setEmail] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Get token from URL
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token) {
          setStatus({
            type: "error",
            message: "Error: No verification token provided",
          });
          return;
        }

        try {
          // Import the helper function dynamically
          const { invokeEdgeFunction } = await import(
            "../lib/edgeFunctionHelper"
          );

          // Call the Supabase Edge Function to verify the token using the helper
          const data = await invokeEdgeFunction("verify-simple", { token });
          console.log("Edge Function response:", data);

          // If successful, update the local registration status
          if (data && data.email) {
            setEmail(data.email);
            registrationStore.setRegistered(data.email);

            setStatus({
              type: "success",
              message: "Email verified successfully!",
            });

            // Redirect after a short delay
            setTimeout(() => {
              window.location.href = "https://ebank.paynomadcapital.com/signup";
            }, 3000);
          } else {
            setStatus({
              type: "error",
              message: "Verification failed. Please try again.",
            });
          }
        } catch (err: any) {
          console.error("Error during verification:", err);
          setStatus({
            type: "error",
            message: err.message || "An unexpected error occurred",
          });
        }
      } catch (err: any) {
        console.error("Error during verification:", err);
        setStatus({
          type: "error",
          message: err.message || "An unexpected error occurred",
        });
      }
    };

    verifyToken();
  }, [location.search, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Mini Hero Section */}
      <div className="bg-[#2C3E50] h-[240px] flex items-center justify-center">
        <h1 className="text-white text-4xl md:text-5xl font-bold tracking-wider font-serif">
          Verify Your Email
        </h1>
      </div>

      {/* Verification Card */}
      <div className="container mx-auto px-4 -mt-20 mb-16">
        <div className="max-w-[480px] mx-auto bg-white rounded-2xl shadow-md p-6 md:p-8">
          <div className="flex flex-col items-center justify-center space-y-6 py-8">
            {/* Email Icon */}
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center ${status.type === "loading" ? "bg-blue-50" : status.type === "success" ? "bg-green-50" : "bg-red-50"}`}
            >
              {status.type === "loading" ? (
                <Loader2 className="h-12 w-12 text-[#0077BE] animate-spin" />
              ) : status.type === "success" ? (
                <CheckCircle className="h-12 w-12 text-[#0077BE]" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-[#2C3E50]"
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
              )}
            </div>

            {/* Status Title */}
            <h2 className="text-2xl font-bold text-center">
              {status.type === "loading"
                ? "Verifying Your Email"
                : status.type === "success"
                  ? "Email Verified!"
                  : "Verification Failed"}
            </h2>

            {/* Status Message */}
            <p
              className={`text-center ${status.type === "loading" ? "text-gray-600" : status.type === "success" ? "text-[#0077BE]" : "text-[#2C3E50]"}`}
            >
              {status.message}
              {status.type === "success" && email && (
                <>
                  <br />
                  <span className="font-medium">{email}</span>
                </>
              )}
            </p>

            {/* Additional Info */}
            {status.type === "success" && (
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  Thank you for verifying your email address. Your account has
                  been created successfully.
                </p>
                <p className="text-gray-600">
                  Redirecting to dashboard in a few seconds...
                </p>
                <div className="mt-4">
                  <CheckCircle className="inline-block h-5 w-5 text-[#0077BE] mr-2" />
                  <span className="text-[#0077BE] font-medium">
                    Verification complete
                  </span>
                </div>
              </div>
            )}

            {/* Error Guidance */}
            {status.type === "error" && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  There was a problem verifying your email. The link may have
                  expired or is invalid.
                </p>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-[#0077BE] text-white px-6 py-2 rounded-lg hover:bg-[#2C3E50] transition-colors"
                >
                  Return to Registration
                </button>
              </div>
            )}

            {/* Loading State */}
            {status.type === "loading" && (
              <div className="text-center">
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
