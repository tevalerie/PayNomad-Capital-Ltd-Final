import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// Email sending is handled by Netlify functions

const VerificationForm = () => {
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from session storage (set during registration)
    const storedEmail = sessionStorage.getItem("registrationEmail");
    const storedName = sessionStorage.getItem("registrationName");

    if (storedEmail) {
      setEmail(storedEmail);
    }

    if (storedName) {
      setName(storedName);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setStatus("error");
      setMessage("Please enter a valid 6-digit OTP");
      return;
    }

    setStatus("loading");
    setMessage("Verifying your OTP...");

    try {
      // Verify OTP via Netlify function
      const response = await axios.post("/.netlify/functions/verify-otp", {
        email,
        otp,
      });

      if (response.status === 200) {
        setStatus("success");
        setMessage("Email verified successfully!");

        // Update user status in Google Sheets via Netlify function
        await axios.post("/.netlify/functions/update-status", {
          email,
          status: "verified",
          verifiedAt: new Date().toISOString(),
        });

        // Redirect to ebanking after a delay
        setTimeout(() => {
          window.location.href = `https://ebank.paynomadcapital.com/signup?email=${encodeURIComponent(email)}`;
        }, 2000);
      } else {
        setStatus("error");
        setMessage(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setStatus("error");
      setMessage(
        err.response?.data?.message ||
          "An error occurred during verification. Please try again.",
      );
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setStatus("error");
      setMessage("Email address not found. Please go back to registration.");
      return;
    }

    setStatus("loading");
    setMessage("Sending new OTP...");

    try {
      // Generate new OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // Update OTP in Google Sheets via submit-application function
      const updateResponse = await axios.post(
        "/.netlify/functions/submit-application",
        {
          email,
          otp: newOtp,
          resend: true,
        },
      );

      if (updateResponse.status !== 200) {
        throw new Error(
          updateResponse.data.message || "Failed to generate new OTP",
        );
      }

      // New OTP email is sent by the backend Netlify function

      setStatus("idle");
      setMessage("New OTP sent! Please check your email.");
    } catch (err) {
      console.error("Resend OTP error:", err);
      setStatus("error");
      setMessage(
        err instanceof Error
          ? err.message
          : "Failed to resend OTP. Please try again.",
      );
    }
  };

  return (
    <Card className="max-w-md w-full bg-white rounded-lg shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-[#2c3e50]">
          Verify Your Email
        </CardTitle>
        {email && (
          <CardDescription className="text-gray-600">{email}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {status === "success" ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <p className="text-green-600 font-medium text-center">{message}</p>
            <p className="text-gray-500 text-sm text-center">
              Redirecting to dashboard...
            </p>
            <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#0077be] animate-pulse"></div>
            </div>
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <p className="text-red-600 font-medium text-center">{message}</p>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="flex-1 bg-[#0077be] hover:bg-[#0066a6]"
                >
                  Verify
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendOtp}
                  className="flex-1 border-[#0077be] text-[#0077be] hover:bg-[#0077be] hover:text-white"
                >
                  Resend OTP
                </Button>
              </div>
            </form>
            <Button
              variant="link"
              onClick={() => navigate("/register")}
              className="text-[#0077be]"
            >
              Back to Registration
            </Button>
          </div>
        ) : status === "loading" ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 text-[#0077be] animate-spin" />
            <p className="text-gray-600">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <p className="text-center text-gray-600">
                We've sent a 6-digit verification code to your email. Please
                enter it below to verify your account.
              </p>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                className="flex-1 bg-[#0077be] hover:bg-[#0066a6]"
              >
                Verify
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendOtp}
                className="flex-1 border-[#0077be] text-[#0077be] hover:bg-[#0077be] hover:text-white"
              >
                Resend OTP
              </Button>
            </div>
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => navigate("/newsignup")}
                className="text-[#0077be]"
              >
                Back to Registration
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationForm;
