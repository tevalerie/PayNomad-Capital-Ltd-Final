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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

const NetlifyFunctionsTester = () => {
  // Submit Application State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("TEST123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
    expiresAt?: string;
  } | null>(null);

  // Verify OTP State
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    message: string;
    redirectUrl?: string;
  } | null>(null);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
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

      const data = await response.json();

      setSubmitResult({
        success: response.ok,
        message: data.message,
        expiresAt: data.expiresAt,
      });

      if (response.ok) {
        // If successful, pre-fill the email for OTP verification
        document.getElementById("otp-tab")?.click();
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerifyResult(null);

    try {
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

      const data = await response.json();

      setVerifyResult({
        success: response.ok,
        message: data.message,
        redirectUrl: data.redirectUrl,
      });

      if (response.ok && data.redirectUrl) {
        // Show success for 3 seconds before redirecting
        setTimeout(() => {
          window.location.href = data.redirectUrl;
        }, 3000);
      }
    } catch (error) {
      setVerifyResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf4eb] p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-[#2c3e50] text-white">
            <CardTitle className="text-2xl">Netlify Functions Tester</CardTitle>
            <CardDescription className="text-gray-300">
              Test the submit-application and verify-otp functions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="submit">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="submit">Submit Application</TabsTrigger>
                <TabsTrigger value="verify" id="otp-tab">
                  Verify OTP
                </TabsTrigger>
              </TabsList>

              <TabsContent value="submit" className="space-y-4 mt-4">
                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referralCode">Referral Code</Label>
                    <Input
                      id="referralCode"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="TEST123"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500">
                      Default: TEST123 (for testing)
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#0077be] hover:bg-[#0066a6]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </form>

                {submitResult && (
                  <div
                    className={`p-4 rounded flex items-start ${submitResult.success ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}
                  >
                    {submitResult.success ? (
                      <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p>{submitResult.message}</p>
                      {submitResult.expiresAt && (
                        <p className="text-sm mt-1">
                          OTP expires at: {submitResult.expiresAt}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="verify" className="space-y-4 mt-4">
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verify-email">Email</Label>
                    <Input
                      id="verify-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      disabled={isVerifying}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP Code</Label>
                    <Input
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      required
                      disabled={isVerifying}
                      className="text-center text-xl tracking-widest"
                      maxLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#0077be] hover:bg-[#0066a6]"
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                </form>

                {verifyResult && (
                  <div
                    className={`p-4 rounded flex items-start ${verifyResult.success ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}
                  >
                    {verifyResult.success ? (
                      <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p>{verifyResult.message}</p>
                      {verifyResult.success && verifyResult.redirectUrl && (
                        <p className="text-sm mt-1">
                          Redirecting to: {verifyResult.redirectUrl}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Testing Instructions:
              </h3>
              <ol className="text-xs text-gray-500 list-decimal pl-4 space-y-1">
                <li>
                  Fill out the form in the "Submit Application" tab and submit
                </li>
                <li>Check your email for the OTP code</li>
                <li>Enter the OTP code in the "Verify OTP" tab</li>
                <li>
                  Upon successful verification, you'll be redirected to the
                  e-banking signup page
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetlifyFunctionsTester;
