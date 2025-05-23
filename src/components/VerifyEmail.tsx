import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import VerificationForm from "./VerificationForm";

const VerifyEmail = () => {
  return (
    <div className="min-h-screen bg-[#faf4eb] flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-r from-[#2c3e50] to-[#0077be] p-6 rounded-t-lg text-center shadow-md">
            <h1
              className="text-2xl md:text-3xl font-bold text-white mb-2"
              style={{
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Verify Your Email
            </h1>
          </div>
          <VerificationForm />
          <div className="mt-8 text-center">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 px-2">
              <a
                href="#about"
                className="text-sm text-gray-600 hover:text-[#0077be] transition-colors"
              >
                About Us
              </a>
              <a
                href="#services"
                className="text-sm text-gray-600 hover:text-[#0077be] transition-colors"
              >
                Services
              </a>
              <a
                href="#insights"
                className="text-sm text-gray-600 hover:text-[#0077be] transition-colors"
              >
                Insights
              </a>
              <a
                href="#contact"
                className="text-sm text-gray-600 hover:text-[#0077be] transition-colors"
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
