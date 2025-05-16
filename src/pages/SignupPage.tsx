import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SignupForm from "../components/SignupForm";

const SignupPage = () => {
  return (
    <div className="min-h-screen bg-[#faf4eb] flex flex-col">
      <Navbar />

      {/* Mini Hero Section */}
      <div className="bg-gradient-to-r from-[#2c3e50] to-[#0077be] h-[220px] flex items-center justify-center relative shadow-lg">
        <h1
          className="text-white font-bold tracking-[8px] md:tracking-[16px] text-center px-4"
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: "clamp(1.75rem, 5vw, 3rem)", // Slightly smaller on mobile
          }}
        >
          CREATE YOUR ACCOUNT
        </h1>
      </div>

      {/* Form Card that overlaps hero section */}
      <div className="container mx-auto px-4 -mt-8 flex justify-center relative z-10">
        <div className="w-full max-w-[480px]">
          <SignupForm />
        </div>
      </div>

      {/* Spacer to push footer down */}
      <div className="flex-grow"></div>

      <Footer />
    </div>
  );
};

export default SignupPage;
