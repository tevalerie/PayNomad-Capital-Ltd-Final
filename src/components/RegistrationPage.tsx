import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../lib/supabaseClient";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Mail } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  referralCode: z.string().min(1, { message: "Referral code is required" }),
});

type FormData = z.infer<typeof formSchema>;

const RegistrationPage: React.FC = () => {
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitStatus({
        success: false,
        message: "Sending your registration data...",
      });

      // Log form data for debugging
      console.log("Form data being submitted:", data);

      if (!formRef.current) {
        throw new Error("Form reference is not available");
      }

      // Call the Supabase Edge Function to send the magic link using the helper
      try {
        const { invokeEdgeFunction } = await import(
          "../lib/edgeFunctionHelper"
        );
        console.log("Invoking Edge Function: signup-simple");
        const responseData = await invokeEdgeFunction("signup-simple", {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          referral_code: data.referralCode || "",
        });

        console.log("Edge Function response:", responseData);

        console.log("Supabase function response:", responseData);

        // Show verification sent screen
        setVerificationSent(true);
        setVerificationEmail(data.email);
        setSubmitStatus({
          success: true,
          message:
            responseData.message ||
            "Verification email sent. Please check your inbox.",
        });
      } catch (error: any) {
        console.error("Error submitting form:", error);

        // More detailed error message based on the error type
        let errorMessage =
          "There was an error submitting your form. Please try again.";

        if (error.text) {
          errorMessage = `Error: ${error.text}`;
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }

        setSubmitStatus({
          success: false,
          message: errorMessage,
        });
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);

      // More detailed error message based on the error type
      let errorMessage =
        "There was an error submitting your form. Please try again.";

      if (error.text) {
        errorMessage = `Error: ${error.text}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      setSubmitStatus({
        success: false,
        message: errorMessage,
      });
    }
  };

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
          Create Your Account
        </h1>
      </div>

      {/* Form Card */}
      <div className="container mx-auto px-4 -mt-20 mb-16">
        <div className="max-w-[480px] mx-auto bg-white rounded-2xl shadow-md p-6 md:p-8">
          {!verificationSent ? (
            <form
              ref={formRef}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* First Name Field */}
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="block text-base font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  className={`w-full h-12 px-4 rounded-md border ${errors.firstName ? "border-red-500" : "border-[#EFF2F6]"} focus:outline-none focus:border-[#0077BE] focus:ring-1 focus:ring-[#0077BE]`}
                  {...register("firstName")}
                  aria-invalid={errors.firstName ? "true" : "false"}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name Field */}
              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="block text-base font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  className={`w-full h-12 px-4 rounded-md border ${errors.lastName ? "border-red-500" : "border-[#EFF2F6]"} focus:outline-none focus:border-[#0077BE] focus:ring-1 focus:ring-[#0077BE]`}
                  {...register("lastName")}
                  aria-invalid={errors.lastName ? "true" : "false"}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Email Address Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-base font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className={`w-full h-12 px-4 rounded-md border ${errors.email ? "border-red-500" : "border-[#EFF2F6]"} focus:outline-none focus:border-[#0077BE] focus:ring-1 focus:ring-[#0077BE]`}
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Referral Code Field */}
              <div className="space-y-2">
                <label
                  htmlFor="referralCode"
                  className="block text-base font-medium text-gray-700"
                >
                  Referral Code
                </label>
                <input
                  id="referralCode"
                  type="text"
                  placeholder="Enter your referral code"
                  className="w-full h-12 px-4 rounded-md border border-[#EFF2F6] focus:outline-none focus:border-[#0077BE] focus:ring-1 focus:ring-[#0077BE]"
                  {...register("referralCode")}
                />
              </div>

              {/* Status Message */}
              {submitStatus && (
                <div
                  className={`p-3 rounded-md ${submitStatus.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                >
                  {submitStatus.message}
                  {!submitStatus.success && (
                    <button
                      className="ml-2 underline text-sm font-medium"
                      onClick={() => setSubmitStatus(null)}
                      type="button"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              )}

              {/* Continue Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0077BE] text-white uppercase tracking-wider py-3 rounded-lg font-medium hover:bg-[#6B96C3] transition-colors duration-200 transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "CONTINUE"
                )}
              </button>

              {/* Quick Links */}
              <div className="text-center text-sm space-y-2">
                <div>
                  <span className="text-gray-600">
                    Already have an account?{" "}
                  </span>
                  <a
                    href="https://ebank.paynomadcapital.com/signIn"
                    className="text-[#0077BE] underline hover:text-[#6B96C3] cursor-pointer"
                  >
                    Sign In
                  </a>
                </div>
                <div className="flex justify-center flex-wrap gap-4 pt-2">
                  <a
                    href="/#about"
                    className="text-[#0077BE] hover:text-[#6B96C3]"
                  >
                    About Us
                  </a>
                  <a
                    href="/#services"
                    className="text-[#0077BE] hover:text-[#6B96C3]"
                  >
                    Services
                  </a>
                  <a
                    href="/#insights"
                    className="text-[#0077BE] hover:text-[#6B96C3]"
                  >
                    Insights
                  </a>
                  <a
                    href="/#contact"
                    className="text-[#0077BE] hover:text-[#6B96C3]"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </form>
          ) : (
            /* Verification Email Sent Screen */
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
                <Mail className="h-12 w-12 text-[#0077BE]" />
              </div>

              <h2 className="text-2xl font-bold text-center">
                Verify Your Email
              </h2>

              <p className="text-center text-gray-600">
                We've sent a verification link to <br />
                <span className="font-medium">{verificationEmail}</span>
              </p>

              <div className="bg-gray-50 p-4 rounded-md w-full text-center">
                <p className="text-gray-700">
                  Please check your inbox and click the verification link to
                  continue. If you don't see the email, check your spam folder.
                </p>
              </div>

              <div className="w-full pt-4">
                <button
                  onClick={() => setVerificationSent(false)}
                  className="w-full border border-[#0077BE] text-[#0077BE] py-3 rounded-lg font-medium hover:bg-[#0077BE] hover:text-white transition-colors duration-200"
                >
                  Use a different email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default RegistrationPage;
