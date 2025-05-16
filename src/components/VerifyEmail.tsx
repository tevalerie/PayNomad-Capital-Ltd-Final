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

        // Get the OTP token from URL parameters
        const token = searchParams.get("token");

        if (!token) {
          setStatus("error");
          setMessage("Invalid verification link. Please try again.");
          return;
        }

        // Verify OTP using Netlify function
        const response = await fetch("/.netlify/functions/verify-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: storedEmail,
            otp: token,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to verify email");
        }

        setStatus("success");
        setMessage("Your email has been successfully verified!");

        // Redirect to the signup page after a short delay
        setTimeout(() => {
          try {
            // Redirect to e-banking portal
            window.location.href =
              data.redirectUrl || "https://ebank.paynomadcapital.com/signup";
          } catch (redirectErr) {
            console.error("Redirect error:", redirectErr);
            // Fallback if redirect fails
            window.location.href = window.location.origin;
          }
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
