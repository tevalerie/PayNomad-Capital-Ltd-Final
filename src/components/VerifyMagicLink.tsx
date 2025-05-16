// This file is kept as a placeholder but the feature has been removed
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const VerifyMagicLink: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#faf4eb] flex flex-col">
      <Navbar />

      <div className="flex items-center justify-center flex-grow p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#2c3e50] p-6 rounded-t-lg text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Feature Removed
            </h1>
          </div>
          <div className="bg-white rounded-b-lg shadow-lg p-8">
            <div className="text-center">
              <p className="text-gray-700 mb-6">
                The Magic Link verification feature has been removed. Please use
                the standard registration process instead.
              </p>
              <button
                className="bg-[#0077be] hover:bg-[#0066a6] text-white px-4 py-2 rounded transition-colors"
                onClick={() => navigate("/register")}
              >
                Go to Registration
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VerifyMagicLink;
