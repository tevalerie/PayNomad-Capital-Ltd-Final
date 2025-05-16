import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import axios from "axios";

const EmailValidator = () => {
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = async () => {
    // Reset states
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setIsValid(null);

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);

    if (!isValidFormat) {
      setIsValid(false);
      setError("Invalid email format");
      setIsLoading(false);
      return;
    }

    try {
      // Call the Netlify function to validate email
      const response = await axios.post("/.netlify/functions/validate-email", {
        email,
      });

      if (response.status === 200) {
        setIsValid(true);
        setMessage(response.data.message || "Email is valid!");
      } else {
        setIsValid(false);
        setError(response.data.message || "Email validation failed");
      }
    } catch (err) {
      console.error("Email validation error:", err);
      setIsValid(false);
      setError(
        err.response?.data?.message ||
          "Error verifying email. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10 bg-white">
      <CardHeader>
        <CardTitle className="text-[#2c3e50]">Email Validator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-gray-300 focus:border-[#0077be] focus:ring-[#0077be]"
          />
        </div>

        <Button
          onClick={validateEmail}
          disabled={isLoading || !email}
          className="w-full bg-[#0077be] hover:bg-[#0066a6] text-white"
        >
          {isLoading ? "Validating..." : "Validate Email"}
        </Button>

        {isValid === true && message && (
          <div className="p-3 rounded bg-green-100 text-green-800">
            {message}
          </div>
        )}

        {isValid === false && error && (
          <div className="p-3 rounded bg-red-100 text-red-800">{error}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailValidator;
