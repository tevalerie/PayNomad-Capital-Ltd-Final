import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "./Navbar";
import Footer from "./Footer";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  verificationCode: z
    .string()
    .min(6, { message: "Verification code must be at least 6 characters" }),
});

type FormData = z.infer<typeof formSchema>;

const VerifyEmail: React.FC = () => {
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
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
        message: "Verifying your email...",
      });

      // Log form data for debugging
      console.log("Form data being submitted:", data);

      // Simulate verification process
      // In a real implementation, this would call an API endpoint

      // Success message and redirect
      setSubmitStatus({
        success: true,
        message: "Email verified successfully. Redirecting to login...",
      });

      setTimeout(() => {
        window.location.href = "https://ebank.paynomadcapital.com/signin";
      }, 1500); // Short delay to show success message
    } catch (error: any) {
      console.error("Error verifying email:", error);

      setSubmitStatus({
        success: false,
        message: "There was an error verifying your email. Please try again.",
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
          Verify Your Email
        </h1>
      </div>

      {/* Form Card */}
      <div className="container mx-auto px-4 -mt-20 mb-16">
        <div className="max-w-[480px] mx-auto bg-white rounded-2xl shadow-md p-6 md:p-8">
          <form
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
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

            {/* Verification Code Field */}
            <div className="space-y-2">
              <label
                htmlFor="verificationCode"
                className="block text-base font-medium text-gray-700"
              >
                Verification Code
              </label>
              <input
                id="verificationCode"
                type="text"
                placeholder="Enter the code sent to your email"
                className={`w-full h-12 px-4 rounded-md border ${errors.verificationCode ? "border-red-500" : "border-[#EFF2F6]"} focus:outline-none focus:border-[#0077BE] focus:ring-1 focus:ring-[#0077BE]`}
                {...register("verificationCode")}
                aria-invalid={errors.verificationCode ? "true" : "false"}
              />
              {errors.verificationCode && (
                <p className="text-red-500 text-sm">
                  {errors.verificationCode.message}
                </p>
              )}
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

            {/* Verify Button */}
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
                  Verifying...
                </>
              ) : (
                "VERIFY EMAIL"
              )}
            </button>

            {/* Quick Links */}
            <div className="text-center text-sm space-y-2">
              <div>
                <span className="text-gray-600">Already verified? </span>
                <a
                  href="https://ebank.paynomadcapital.com/signin"
                  className="text-[#0077BE] underline hover:text-[#6B96C3]"
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
        </div>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default VerifyEmail;
