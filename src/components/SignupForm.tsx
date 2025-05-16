import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardFooter } from "./ui/card";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignupForm = () => {
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

  const generateOTP = () => {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
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
      // First validate the email using our Netlify function
      const validationResponse = await axios.post(
        "/.netlify/functions/validate-email",
        { email },
      );

      if (validationResponse.status !== 200) {
        throw new Error(
          validationResponse.data.message || "Email validation failed",
        );
      }

      // Generate OTP
      const otp = generateOTP();

      // Store user data in Google Sheets via Netlify function
      const registrationResponse = await axios.post(
        "/.netlify/functions/submit-application",
        {
          firstName,
          lastName,
          email,
          referralCode,
          otp,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      );

      if (registrationResponse.status !== 200) {
        throw new Error(
          registrationResponse.data.message || "Registration failed",
        );
      }

      // OTP email is sent by the submit-application.js Netlify function

      setMessage("Verification email sent. Please check your inbox.");

      // Store email in sessionStorage for verification page
      sessionStorage.setItem("registrationEmail", email);
      sessionStorage.setItem("registrationName", `${firstName} ${lastName}`);

      // Clear form
      setFirstName("");
      setLastName("");
      setEmail("");
      setReferralCode("");

      // Redirect to verification page after a short delay
      setTimeout(() => {
        navigate("/OTPVerification");
      }, 2000);
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
    <Card className="rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] overflow-hidden bg-white">
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
              <Label htmlFor="firstName" className="text-[#2c3e50] font-medium">
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
              <Label htmlFor="lastName" className="text-[#2c3e50] font-medium">
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
              <Label htmlFor="email" className="text-[#2c3e50] font-medium">
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
  );
};

export default SignupForm;
