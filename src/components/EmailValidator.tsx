import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

const EmailValidator = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  // Basic client-side validation before sending to the server
  const isValidEmailFormat = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setResult({ valid: false, message: "Please enter an email address" });
      return;
    }

    if (!isValidEmailFormat(email)) {
      setResult({ valid: false, message: "Please enter a valid email format" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/.netlify/functions/validate-email", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ valid: true, message: data.message || "Email is valid!" });
      } else {
        setResult({
          valid: false,
          message: data.message || "Invalid email address",
        });
      }
    } catch (error) {
      console.error("Error validating email:", error);
      setResult({
        valid: false,
        message:
          error instanceof Error
            ? error.message
            : "Error validating email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      validateEmail(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#faf4eb] p-4">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-center text-[#2c3e50]">
            Email Validation
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Verify email addresses before sending important communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={validateEmail} className="space-y-4">
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
                onKeyDown={handleKeyDown}
                className="border-gray-300 focus:border-[#0077be] focus:ring-[#0077be]"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0077be] hover:bg-[#0066a6] py-2.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Validate Email"
              )}
            </Button>

            {result && (
              <div
                className={`p-4 rounded flex items-start ${result.valid ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}
              >
                {result.valid ? (
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                )}
                <span>{result.message}</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailValidator;
