import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const NetlifyFunctionsTester = () => {
  const [firstName, setFirstName] = useState("Test");
  const [lastName, setLastName] = useState("User");
  const [email, setEmail] = useState("test@example.com");
  const [referralCode, setReferralCode] = useState("TEST123");
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testSubmitApplication = async () => {
    setIsLoading(true);
    setResult("");
    setError("");

    try {
      console.log(
        `Testing submit-application with email: ${email}, firstName: ${firstName}`,
      );

      const response = await fetch("/.netlify/functions/submit-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          referralCode,
        }),
      });

      // Get raw text first to handle potential JSON parsing errors
      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (jsonError) {
        console.error(
          "JSON parsing error:",
          jsonError,
          "Raw response:",
          rawText,
        );
        throw new Error(
          `Failed to parse JSON response: ${rawText.substring(0, 100)}${rawText.length > 100 ? "..." : ""}`,
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit application");
      }

      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Error testing submit-application:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const testVerifyOtp = async () => {
    setIsLoading(true);
    setResult("");
    setError("");

    try {
      console.log(`Testing verify-otp with email: ${email}, otp: ${otp}`);

      const response = await fetch("/.netlify/functions/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      // Get raw text first to handle potential JSON parsing errors
      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (jsonError) {
        console.error(
          "JSON parsing error:",
          jsonError,
          "Raw response:",
          rawText,
        );
        throw new Error(
          `Failed to parse JSON response: ${rawText.substring(0, 100)}${rawText.length > 100 ? "..." : ""}`,
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify OTP");
      }

      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Error testing verify-otp:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf4eb] p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Netlify Functions Tester</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Test submit-application</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code</Label>
                <Input
                  id="referralCode"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={testSubmitApplication}
              disabled={isLoading}
              className="bg-[#0077be] hover:bg-[#0066a6]"
            >
              {isLoading ? "Testing..." : "Test Submit Application"}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Test verify-otp</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="otpEmail">Email</Label>
                <Input
                  id="otpEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={testVerifyOtp}
              disabled={isLoading}
              className="bg-[#2c3e50] hover:bg-[#1a2530]"
            >
              {isLoading ? "Testing..." : "Test Verify OTP"}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              <h3 className="font-medium mb-2">Error:</h3>
              <pre className="whitespace-pre-wrap text-sm">{error}</pre>
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NetlifyFunctionsTester;
