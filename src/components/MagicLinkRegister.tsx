// This file is kept as a placeholder but the feature has been removed
import React from "react";

const MagicLinkRegister: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf4eb] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Feature Unavailable
        </h2>
        <p className="text-gray-600 mb-6">
          The Magic Link registration feature has been removed. Please use the
          standard registration process instead.
        </p>
        <button
          onClick={() => (window.location.href = "/register")}
          className="bg-[#0077be] hover:bg-[#0066a6] text-white py-2 px-4 rounded"
        >
          Go to Registration
        </button>
      </div>
    </div>
  );
};

export default MagicLinkRegister;
